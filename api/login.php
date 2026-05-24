<?php
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/twofa_lib.php';

$allowedRoles = ['student', 'receptionist', 'admin'];

require_method('POST');
check_login_rate_limit();

$input = read_json_input();
$username = trim((string)($input['username'] ?? ''));
$password = $input['password'] ?? '';
$role     = (string)($input['role'] ?? '');

$attemptFingerprint = hash('sha256', strtolower($username) . '|' . $role . '|' . (is_string($password) ? $password : ''));
$now = microtime(true);
$lastAttempt = $_SESSION['last_login_attempt'] ?? null;

if (is_array($lastAttempt)
    && ($lastAttempt['fingerprint'] ?? '') === $attemptFingerprint
    && ($now - (float)($lastAttempt['time'] ?? 0)) < 1.5) {
    json_response(['success' => false, 'error' => 'Invalid credentials'], 401);
}

$_SESSION['last_login_attempt'] = [
    'fingerprint' => $attemptFingerprint,
    'time' => $now,
];

if ($username === '' || !is_string($password) || $password === '' || !in_array($role, $allowedRoles, true)) {
    json_response(['success' => false, 'error' => 'Invalid credentials'], 400);
}

$usernameLen = function_exists('mb_strlen') ? mb_strlen($username) : strlen($username);
$passwordLen = function_exists('mb_strlen') ? mb_strlen($password) : strlen($password);
if ($usernameLen > 50 || $passwordLen > 200) {
    json_response(['success' => false, 'error' => 'Invalid credentials'], 400);
}

try {
    $pdo  = getDB();
    ensure_twofa_schema($pdo);
    $stmt = $pdo->prepare('SELECT id, username, password_hash, role, name, twofa_enabled, twofa_secret FROM users WHERE username = ? AND role = ?');
    $stmt->execute([$username, $role]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password_hash'])) {
        $isAdmin2faEnabled = ($user['role'] ?? '') === 'admin'
            && (int)($user['twofa_enabled'] ?? 0) === 1
            && !empty($user['twofa_secret']);

        if ($isAdmin2faEnabled) {
            clear_login_failures();
            unset($_SESSION['last_login_attempt']);
            unset($_SESSION['user']);

            $challengeId = bin2hex(random_bytes(16));
            $_SESSION['pending_2fa'] = [
                'challengeId' => $challengeId,
                'attempts' => 0,
                'expiresAt' => time() + 300,
                'user' => [
                    'id'       => $user['id'],
                    'role'     => $user['role'],
                    'name'     => $user['name'],
                    'username' => $user['username'],
                ],
            ];

            audit_log($pdo, 'login_2fa_challenge', 'success', 'user', (string)$user['id'], 'Password validated; awaiting 2FA code', ['id' => (string)$user['id'], 'role' => (string)$user['role']]);

            json_response([
                'success' => true,
                'twoFactorRequired' => true,
                'challengeId' => $challengeId,
                'message' => 'Authenticator code required',
            ]);
        }

        session_regenerate_id(true);
        $_SESSION['user'] = [
            'id'       => $user['id'],
            'role'     => $user['role'],
            'name'     => $user['name'],
            'username' => $user['username'],
        ];
        $csrf = new_csrf_token();
        clear_login_failures();
        unset($_SESSION['last_login_attempt']);
        audit_log($pdo, 'login', 'success', 'user', $user['id'], 'User logged in', $_SESSION['user']);

        json_response([
            'success' => true,
            'user'    => [
                'id'       => $user['id'],
                'role'     => $user['role'],
                'name'     => $user['name'],
                'username' => $user['username'],
            ],
            'csrfToken' => $csrf,
        ]);
    } else {
        record_login_failure();
        audit_log($pdo, 'login', 'failed', 'user', null, 'Invalid login attempt for username=' . $username . ' role=' . $role, ['id' => null, 'role' => $role]);
        json_response(['success' => false, 'error' => 'Invalid credentials'], 401);
    }
} catch (Exception $e) {
    json_response(['success' => false, 'error' => 'Server error'], 500);
}
