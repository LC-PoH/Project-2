<?php
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/db.php';

require_method('GET');
$session = require_auth(['admin']);

try {
    $pdo = getDB();

    $failedStmt = $pdo->query(
        'SELECT COUNT(*) AS c
         FROM audit_logs
         WHERE status = "failed"
           AND created_at >= (NOW() - INTERVAL 24 HOUR)'
    );
    $failed24h = (int)($failedStmt->fetch()['c'] ?? 0);

    $highRiskStmt = $pdo->query(
        'SELECT COUNT(*) AS c
         FROM audit_logs
         WHERE created_at >= (NOW() - INTERVAL 24 HOUR)
           AND (
             (status = "failed" AND action_name = "login")
             OR (status = "failed" AND action_name = "payment_submit")
             OR action_name = "data_remove"
           )'
    );
    $highRisk24h = (int)($highRiskStmt->fetch()['c'] ?? 0);

    $ipStmt = $pdo->query(
        'SELECT ip_address, COUNT(*) AS c
         FROM audit_logs
         WHERE created_at >= (NOW() - INTERVAL 24 HOUR)
           AND status = "failed"
           AND ip_address IS NOT NULL
           AND ip_address <> ""
         GROUP BY ip_address
         ORDER BY c DESC
         LIMIT 1'
    );
    $topIpRow = $ipStmt->fetch();
    if ($topIpRow) {
        $rawIp = (string)($topIpRow['ip_address'] ?? '');
        $ipLabel = $rawIp;
        if ($rawIp === '::1' || $rawIp === '127.0.0.1') {
            $ipLabel = 'Localhost';
        }
        $topIp = $ipLabel . ' - ' . (int)$topIpRow['c'] . ' failed events';
    } else {
        $topIp = '-';
    }

        $actorStmt = $pdo->query(
                'SELECT al.actor_user_id, al.actor_role, u.name AS actor_name, COUNT(*) AS c
                 FROM audit_logs al
                 LEFT JOIN users u ON u.id = al.actor_user_id
                 WHERE al.created_at >= (NOW() - INTERVAL 24 HOUR)
                     AND al.actor_user_id IS NOT NULL
                     AND al.actor_user_id <> ""
                 GROUP BY al.actor_user_id, al.actor_role, u.name
         ORDER BY c DESC
         LIMIT 1'
    );
    $topActorRow = $actorStmt->fetch();
    if ($topActorRow) {
        $topActor = (string)($topActorRow['actor_name'] ?? '');
        if ($topActor === '') {
            $topActor = (string)$topActorRow['actor_user_id'];
        }
        if (!empty($topActorRow['actor_role'])) {
            $topActor .= ' (' . $topActorRow['actor_role'] . ')';
        }
        $topActor .= ' - ' . (int)$topActorRow['c'] . ' events';
    } else {
        $topActor = '-';
    }

    json_response([
        'success' => true,
        'summary' => [
            'failed24h' => $failed24h,
            'highRisk24h' => $highRisk24h,
            'topIp' => $topIp,
            'topActor' => $topActor,
        ],
    ]);
} catch (Exception $e) {
    json_response(['success' => false, 'error' => 'Server error'], 500);
}
