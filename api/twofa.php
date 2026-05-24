<?php
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/twofa_lib.php';

$session = require_auth(['admin']);
$pdo = getDB();
ensure_twofa_schema($pdo);

$stmt = $pdo->prepare('SELECT id, username, role, twofa_enabled, twofa_secret FROM users WHERE id = ? LIMIT 1');
$stmt->execute([$session['id']]);
$user = $stmt->fetch();

if (!$user) {
    json_response(['success' => false, 'error' => 'User not found'], 404);
}

$issuer = 'AVM Hostel';
$account = (string)$user['username'];

function fetch_recovery_last_generated_at(PDO $pdo, string $userId): ?string {
    $stmt = $pdo->prepare('SELECT MAX(created_at) AS last_created_at FROM `2fa_recovery_codes` WHERE user_id = ?');
    $stmt->execute([$userId]);
    $row = $stmt->fetch();
    $value = (string)($row['last_created_at'] ?? '');
    return $value !== '' ? $value : null;
}

if (strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'GET') {
    $setup = $_SESSION['twofa_setup'] ?? null;
    $setupSecret = is_array($setup) ? (string)($setup['secret'] ?? '') : '';
    $setupCreatedAt = is_array($setup) ? (int)($setup['createdAt'] ?? 0) : 0;
    if ($setupSecret !== '' && $setupCreatedAt > 0 && (time() - $setupCreatedAt) > 900) {
        unset($_SESSION['twofa_setup']);
        $setupSecret = '';
    }
    $setupPending = $setupSecret !== '';

    json_response([
        'success' => true,
        'enabled' => (int)($user['twofa_enabled'] ?? 0) === 1,
        'setupPending' => $setupPending,
        'recoveryRemaining' => count_unused_recovery_codes($pdo, (string)$session['id']),
        'recoveryLastGeneratedAt' => fetch_recovery_last_generated_at($pdo, (string)$session['id']),
        'account' => $account,
        'secret' => $setupPending ? $setupSecret : null,
        'otpauthUri' => $setupPending ? build_otpauth_uri($issuer, $account, $setupSecret) : null,
    ]);
}

require_method('POST');
require_csrf();
$input = read_json_input();
$action = clean_text((string)($input['action'] ?? ''), 40);

if ($action === 'begin_setup') {
    if ((int)($user['twofa_enabled'] ?? 0) === 1) {
        json_response(['success' => false, 'error' => '2FA is already enabled.'], 400);
    }

    $secret = generate_totp_secret();
    $_SESSION['twofa_setup'] = [
        'secret' => $secret,
        'createdAt' => time(),
    ];

    audit_log($pdo, 'twofa_setup_begin', 'success', 'user', (string)$session['id'], 'Admin started 2FA setup', $session);

    json_response([
        'success' => true,
        'setupPending' => true,
        'secret' => $secret,
        'otpauthUri' => build_otpauth_uri($issuer, $account, $secret),
    ]);
}

if ($action === 'cancel_setup') {
    unset($_SESSION['twofa_setup']);
    audit_log($pdo, 'twofa_setup_cancel', 'success', 'user', (string)$session['id'], 'Admin cancelled 2FA setup', $session);
    json_response(['success' => true, 'setupPending' => false]);
}

if ($action === 'confirm_setup') {
    $setup = $_SESSION['twofa_setup'] ?? null;
    $secret = is_array($setup) ? (string)($setup['secret'] ?? '') : '';
    $createdAt = is_array($setup) ? (int)($setup['createdAt'] ?? 0) : 0;
    $code = normalize_otp_code((string)($input['otp'] ?? ''));

    if ($secret === '') {
        json_response(['success' => false, 'error' => 'No setup in progress.'], 400);
    }

    if ($createdAt > 0 && (time() - $createdAt) > 900) {
        unset($_SESSION['twofa_setup']);
        json_response(['success' => false, 'error' => 'Setup session expired. Start setup again.'], 400);
    }

    if (!verify_totp_code($secret, $code, 1)) {
        json_response(['success' => false, 'error' => 'Invalid authenticator code.'], 401);
    }

    $update = $pdo->prepare('UPDATE users SET twofa_enabled = 1, twofa_secret = ? WHERE id = ?');
    $update->execute([$secret, $session['id']]);

    $recoveryCodes = replace_recovery_codes($pdo, (string)$session['id']);

    unset($_SESSION['twofa_setup']);
    audit_log($pdo, 'twofa_enable', 'success', 'user', (string)$session['id'], 'Admin enabled 2FA', $session);

    json_response([
        'success' => true,
        'enabled' => true,
        'recoveryCodes' => $recoveryCodes,
        'recoveryRemaining' => count($recoveryCodes),
        'recoveryLastGeneratedAt' => fetch_recovery_last_generated_at($pdo, (string)$session['id']),
    ]);
}

if ($action === 'regenerate_recovery') {
    if ((int)($user['twofa_enabled'] ?? 0) !== 1 || empty($user['twofa_secret'])) {
        json_response(['success' => false, 'error' => '2FA must be enabled before regenerating recovery codes.'], 400);
    }

    $code = normalize_otp_code((string)($input['otp'] ?? ''));
    if (!verify_totp_code((string)$user['twofa_secret'], $code, 1)) {
        json_response(['success' => false, 'error' => 'Invalid authenticator code.'], 401);
    }

    $recoveryCodes = replace_recovery_codes($pdo, (string)$session['id']);
    audit_log($pdo, 'twofa_recovery_regenerate', 'success', 'user', (string)$session['id'], 'Admin regenerated 2FA recovery codes', $session);

    json_response([
        'success' => true,
        'recoveryCodes' => $recoveryCodes,
        'recoveryRemaining' => count($recoveryCodes),
        'recoveryLastGeneratedAt' => fetch_recovery_last_generated_at($pdo, (string)$session['id']),
    ]);
}

if ($action === 'disable') {
    if ((int)($user['twofa_enabled'] ?? 0) !== 1 || empty($user['twofa_secret'])) {
        json_response(['success' => false, 'error' => '2FA is not enabled.'], 400);
    }

    $code = normalize_otp_code((string)($input['otp'] ?? ''));
    if (!verify_totp_code((string)$user['twofa_secret'], $code, 1)) {
        json_response(['success' => false, 'error' => 'Invalid authenticator code.'], 401);
    }

    $update = $pdo->prepare('UPDATE users SET twofa_enabled = 0, twofa_secret = NULL WHERE id = ?');
    $update->execute([$session['id']]);
    $deleteCodes = $pdo->prepare('DELETE FROM `2fa_recovery_codes` WHERE user_id = ?');
    $deleteCodes->execute([$session['id']]);

    unset($_SESSION['twofa_setup']);
    audit_log($pdo, 'twofa_disable', 'success', 'user', (string)$session['id'], 'Admin disabled 2FA', $session);

    json_response(['success' => true, 'enabled' => false]);
}

json_response(['success' => false, 'error' => 'Invalid action'], 400);
