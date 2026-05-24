<?php
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/db.php';

require_method('POST');
$session = require_auth(['student', 'receptionist', 'admin']);
require_csrf();

$input       = read_json_input();
$userId      = $session['id'];
$oldPassword = (string)($input['oldPassword'] ?? '');
$newPassword = (string)($input['newPassword'] ?? '');

if ($oldPassword === '' || $newPassword === '') {
    json_response(['success' => false, 'error' => 'Missing fields'], 400);
}

if (mb_strlen($newPassword) < 10 || mb_strlen($newPassword) > 200) {
    json_response(['success' => false, 'error' => 'New password must be 10-200 characters'], 400);
}

try {
    $pdo  = getDB();
    $stmt = $pdo->prepare('SELECT password_hash FROM users WHERE id = ?');
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($oldPassword, $user['password_hash'])) {
        audit_log($pdo, 'password_change', 'failed', 'user', $userId, 'Current password mismatch', $session);
        json_response(['success' => false, 'error' => 'Current password is incorrect'], 401);
    }

    $newHash = password_hash($newPassword, PASSWORD_DEFAULT);
    $pdo->prepare('UPDATE users SET password_hash = ? WHERE id = ?')->execute([$newHash, $userId]);
    audit_log($pdo, 'password_change', 'success', 'user', $userId, 'Password changed', $session);
    json_response(['success' => true]);
} catch (Exception $e) {
    json_response(['success' => false, 'error' => 'Server error'], 500);
}
