<?php
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/twofa_lib.php';

require_method('POST');
$input = read_json_input();
$challengeId = clean_text((string)($input['challengeId'] ?? ''), 80);
$rawCode = trim((string)($input['code'] ?? $input['otp'] ?? ''));
$otpCode = normalize_otp_code($rawCode);
$recoveryCode = normalize_recovery_code($rawCode);

$pending = $_SESSION['pending_2fa'] ?? null;
if (!is_array($pending)) {
    json_response(['success' => false, 'error' => '2FA session expired. Please login again.'], 401);
}

if (($pending['expiresAt'] ?? 0) < time()) {
    unset($_SESSION['pending_2fa']);
    json_response(['success' => false, 'error' => '2FA session expired. Please login again.'], 401);
}

if ($challengeId === null || !hash_equals((string)($pending['challengeId'] ?? ''), $challengeId)) {
    unset($_SESSION['pending_2fa']);
    json_response(['success' => false, 'error' => 'Invalid 2FA challenge. Please login again.'], 401);
}

if (!preg_match('/^\d{6}$/', $otpCode) && strlen($recoveryCode) !== 10) {
    json_response(['success' => false, 'error' => 'Enter a valid 6-digit authenticator code or backup code.'], 400);
}

$attempts = (int)($pending['attempts'] ?? 0);
if ($attempts >= 5) {
    unset($_SESSION['pending_2fa']);
    record_login_failure();
    json_response(['success' => false, 'error' => 'Too many invalid codes. Please login again.'], 429);
}

try {
    $pdo = getDB();
    ensure_twofa_schema($pdo);

    $userId = (string)($pending['user']['id'] ?? '');
    $stmt = $pdo->prepare('SELECT id, username, role, name, twofa_enabled, twofa_secret FROM users WHERE id = ? LIMIT 1');
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    if (!$user || ($user['role'] ?? '') !== 'admin' || (int)($user['twofa_enabled'] ?? 0) !== 1 || empty($user['twofa_secret'])) {
        unset($_SESSION['pending_2fa']);
        json_response(['success' => false, 'error' => '2FA is not enabled for this account. Please login again.'], 401);
    }

    $usedRecoveryCode = false;
    if (preg_match('/^\d{6}$/', $otpCode)) {
        if (!verify_totp_code((string)$user['twofa_secret'], $otpCode, 1)) {
            $_SESSION['pending_2fa']['attempts'] = $attempts + 1;
            json_response(['success' => false, 'error' => 'Invalid authenticator code.'], 401);
        }
    } elseif (strlen($recoveryCode) === 10) {
        if (!consume_recovery_code($pdo, (string)$user['id'], $recoveryCode)) {
            $_SESSION['pending_2fa']['attempts'] = $attempts + 1;
            json_response(['success' => false, 'error' => 'Invalid or already used backup code.'], 401);
        }
        $usedRecoveryCode = true;
    } else {
        $_SESSION['pending_2fa']['attempts'] = $attempts + 1;
        json_response(['success' => false, 'error' => 'Invalid 2FA code.'], 401);
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
    unset($_SESSION['pending_2fa']);
    unset($_SESSION['last_login_attempt']);

    audit_log(
        $pdo,
        'login',
        'success',
        'user',
        (string)$user['id'],
        $usedRecoveryCode ? 'User logged in with 2FA backup code' : 'User logged in with 2FA authenticator code',
        $_SESSION['user']
    );

    json_response([
        'success' => true,
        'usedRecoveryCode' => $usedRecoveryCode,
        'recoveryRemaining' => count_unused_recovery_codes($pdo, (string)$user['id']),
        'user' => [
            'id'       => $user['id'],
            'role'     => $user['role'],
            'name'     => $user['name'],
            'username' => $user['username'],
        ],
        'csrfToken' => $csrf,
    ]);
} catch (Throwable $e) {
    json_response(['success' => false, 'error' => 'Server error'], 500);
}
