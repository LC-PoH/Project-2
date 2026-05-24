<?php
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/db.php';

require_method('GET');
require_auth(['admin']);

try {
    $pdo = getDB();

    $tables = ['users', 'rooms', 'bookings', 'payments', 'requests', 'visitors', 'attendance', 'notices', 'audit_logs'];
    $counts = [];

    foreach ($tables as $table) {
        $stmt = $pdo->query('SELECT COUNT(*) AS c FROM ' . $table);
        $counts[$table] = (int)($stmt->fetch()['c'] ?? 0);
    }

    $dbName = $pdo->query('SELECT DATABASE() AS db_name')->fetch()['db_name'] ?? '';

    json_response([
        'success' => true,
        'database' => (string)$dbName,
        'counts' => $counts,
        'generatedAt' => date('c'),
    ]);
} catch (Exception $e) {
    json_response(['success' => false, 'error' => 'Server error'], 500);
}
