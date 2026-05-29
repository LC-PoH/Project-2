<?php
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/db.php';

require_method('GET');
require_auth(['admin']);

try {
    $pdo = getDB();

    $monthStart = date('Y-m-01');

    $bedsStmt = $pdo->query('SELECT COALESCE(SUM(beds), 0) AS total_beds FROM rooms');
    $totalBeds = (int)($bedsStmt->fetch()['total_beds'] ?? 0);

    $occupiedStmt = $pdo->query("SELECT COUNT(*) AS occupied_beds FROM users WHERE role = 'student' AND status = 'active' AND room_id IS NOT NULL AND room_id <> ''");
    $occupiedBeds = (int)($occupiedStmt->fetch()['occupied_beds'] ?? 0);
    $occupancyPct = $totalBeds > 0 ? round(($occupiedBeds / $totalBeds) * 100, 1) : 0.0;

    $monthPaidStmt = $pdo->prepare(
        'SELECT COALESCE(SUM(amount), 0) AS total
         FROM payments
         WHERE status = "paid" AND pay_date >= ?'
    );
    $monthPaidStmt->execute([$monthStart]);
    $monthCollected = (float)($monthPaidStmt->fetch()['total'] ?? 0);

    $monthPendingStmt = $pdo->prepare(
        'SELECT COALESCE(SUM(amount), 0) AS total
         FROM payments
         WHERE status = "pending" AND pay_date >= ?'
    );
    $monthPendingStmt->execute([$monthStart]);
    $monthPending = (float)($monthPendingStmt->fetch()['total'] ?? 0);

    $monthDueTotal = $monthCollected + $monthPending;
    $collectionRatePct = $monthDueTotal > 0 ? round(($monthCollected / $monthDueTotal) * 100, 1) : 0.0;

    $pendingTotalStmt = $pdo->query('SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE status = "pending"');
    $pendingTotal = (float)($pendingTotalStmt->fetch()['total'] ?? 0);

    $agingRows = $pdo->query(
        'SELECT
            SUM(CASE WHEN DATEDIFF(CURDATE(), pay_date) BETWEEN 0 AND 30 THEN amount ELSE 0 END) AS bucket_0_30,
            SUM(CASE WHEN DATEDIFF(CURDATE(), pay_date) BETWEEN 31 AND 60 THEN amount ELSE 0 END) AS bucket_31_60,
            SUM(CASE WHEN DATEDIFF(CURDATE(), pay_date) BETWEEN 61 AND 90 THEN amount ELSE 0 END) AS bucket_61_90,
            SUM(CASE WHEN DATEDIFF(CURDATE(), pay_date) > 90 THEN amount ELSE 0 END) AS bucket_90_plus
         FROM payments
         WHERE status = "pending"'
    )->fetch();

    $duesAging = [
        ['label' => '0-30 days', 'amount' => (float)($agingRows['bucket_0_30'] ?? 0)],
        ['label' => '31-60 days', 'amount' => (float)($agingRows['bucket_31_60'] ?? 0)],
        ['label' => '61-90 days', 'amount' => (float)($agingRows['bucket_61_90'] ?? 0)],
        ['label' => '90+ days', 'amount' => (float)($agingRows['bucket_90_plus'] ?? 0)],
    ];

    $slaStmt = $pdo->query(
        'SELECT AVG(TIMESTAMPDIFF(HOUR, req_date, resolved_at)) AS avg_hours
         FROM requests
         WHERE status IN ("resolved", "approved", "rejected")
           AND resolved_at IS NOT NULL'
    );
    $avgComplaintSlaHours = (float)($slaStmt->fetch()['avg_hours'] ?? 0);

    $openReqStmt = $pdo->query('SELECT COUNT(*) AS c FROM requests WHERE status = "pending"');
    $openRequests = (int)($openReqStmt->fetch()['c'] ?? 0);

    $topIssuesStmt = $pdo->query(
        'SELECT req_type AS issue, COUNT(*) AS c
         FROM requests
         WHERE status = "pending"
         GROUP BY req_type
         ORDER BY c DESC
         LIMIT 5'
    );
    $topIssues = [];
    while ($row = $topIssuesStmt->fetch()) {
        $topIssues[] = [
            'issue' => (string)($row['issue'] ?? 'General'),
            'count' => (int)($row['c'] ?? 0),
        ];
    }

    $methodStmt = $pdo->prepare(
        'SELECT COALESCE(NULLIF(method, ""), "Unknown") AS payment_method,
                COUNT(*) AS tx_count,
                COALESCE(SUM(amount), 0) AS amount_total
         FROM payments
         WHERE status = "paid" AND pay_date >= ?
         GROUP BY COALESCE(NULLIF(method, ""), "Unknown")
         ORDER BY amount_total DESC'
    );
    $methodStmt->execute([$monthStart]);
    $paymentMethods = [];
    while ($row = $methodStmt->fetch()) {
        $paymentMethods[] = [
            'method' => (string)$row['payment_method'],
            'txCount' => (int)($row['tx_count'] ?? 0),
            'amount' => (float)($row['amount_total'] ?? 0),
        ];
    }

    $trendStmt = $pdo->query(
        'SELECT DATE_FORMAT(pay_date, "%Y-%m") AS month_key,
                COALESCE(SUM(amount), 0) AS amount_total
         FROM payments
         WHERE status = "paid"
           AND pay_date >= DATE_SUB(CURDATE(), INTERVAL 5 MONTH)
         GROUP BY DATE_FORMAT(pay_date, "%Y-%m")
         ORDER BY month_key ASC'
    );
    $rawTrend = [];
    while ($row = $trendStmt->fetch()) {
        $rawTrend[(string)$row['month_key']] = (float)($row['amount_total'] ?? 0);
    }

    $revenueTrend = [];
    $baseMonth = new DateTimeImmutable(date('Y-m-01'));
    for ($i = 5; $i >= 0; $i--) {
        $monthKey = $baseMonth->modify("-{$i} month")->format('Y-m');
        $revenueTrend[] = [
            'month' => $monthKey,
            'amount' => $rawTrend[$monthKey] ?? 0.0,
        ];
    }

    json_response([
        'success' => true,
        'report' => [
            'monthStart' => $monthStart,
            'monthCollected' => $monthCollected,
            'monthPending' => $monthPending,
            'monthDueTotal' => $monthDueTotal,
            'collectionRatePct' => $collectionRatePct,
            'pendingTotal' => $pendingTotal,
            'occupancy' => [
                'totalBeds' => $totalBeds,
                'occupiedBeds' => $occupiedBeds,
                'occupancyPct' => $occupancyPct,
            ],
            'duesAging' => $duesAging,
            'complaints' => [
                'avgSlaHours' => $avgComplaintSlaHours,
                'openRequests' => $openRequests,
                'topIssues' => $topIssues,
            ],
            'paymentMethods' => $paymentMethods,
            'revenueTrend' => $revenueTrend,
            'generatedAt' => date('c'),
        ],
    ]);
} catch (Exception $e) {
    json_response(['success' => false, 'error' => 'Server error'], 500);
}
