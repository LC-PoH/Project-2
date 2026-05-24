<?php
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/db.php';

require_method('GET');
$session = require_auth(); // any authenticated role

$pdo = getDB();
$limit = max(5, min(20, (int)($_GET['limit'] ?? 10)));

$stmt = $pdo->prepare(
    'SELECT action_name, status, details, ip_address, created_at
     FROM audit_logs
     WHERE actor_user_id = ?
     ORDER BY created_at DESC
     LIMIT ?'
);
$stmt->execute([(string)$session['id'], $limit]);
$rows = $stmt->fetchAll();

json_response(['success' => true, 'logs' => $rows]);
