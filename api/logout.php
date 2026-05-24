<?php
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/db.php';

require_method('POST');
$session = require_auth();
require_csrf();

try {
    $pdo = getDB();
    audit_log($pdo, 'logout', 'success', 'user', (string)$session['id'], 'User logged out', $session);
} catch (Exception $e) {
    // Keep logout flow resilient even if DB/audit is unavailable.
}

$_SESSION = [];
if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], (bool)$params['secure'], (bool)$params['httponly']);
}
session_destroy();

json_response(['success' => true]);
