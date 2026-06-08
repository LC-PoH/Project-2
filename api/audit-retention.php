<?php
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/db.php';

require_method('POST');
$session = require_auth(['admin']);
require_csrf();

$input = read_json_input();
$keepDays = (int)($input['keepDays'] ?? 90);

if ($keepDays < 7 || $keepDays > 3650) {
    json_response(['success' => false, 'error' => 'keepDays must be between 7 and 3650'], 400);
}

try {
    $pdo = getDB();

    $cutoff = (new DateTimeImmutable('now'))->modify('-' . $keepDays . ' days')->format('Y-m-d H:i:s');

    $countStmt = $pdo->prepare('SELECT COUNT(*) AS c FROM audit_logs WHERE created_at < :cutoff');
    $countStmt->execute(['cutoff' => $cutoff]);
    $toDelete = (int)($countStmt->fetch()['c'] ?? 0);

    $deleted = 0;
    if ($toDelete > 0) {
        $deleteStmt = $pdo->prepare('DELETE FROM audit_logs WHERE created_at < :cutoff');
        $deleteStmt->execute(['cutoff' => $cutoff]);
        $deleted = (int)$deleteStmt->rowCount();
    }

    audit_log(
        $pdo,
        'audit_retention_purge',
        'success',
        'audit_logs',
        null,
        'Retention purge applied: keepDays=' . $keepDays . ', purged=' . $deleted,
        $session
    );

    json_response([
        'success' => true,
        'keepDays' => $keepDays,
        'cutoff' => $cutoff,
        'purged' => $deleted,
    ]);
} catch (Throwable $e) {
    if (isset($pdo) && $pdo instanceof PDO) {
        audit_log(
            $pdo,
            'audit_retention_purge',
            'failed',
            'audit_logs',
            null,
            'Retention purge failed',
            $session
        );
    }

    json_response(['success' => false, 'error' => 'Server error'], 500);
}
