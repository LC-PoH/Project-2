<?php
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/db.php';

require_method('GET');
$session = require_auth(['admin']);

$page = max(1, (int)($_GET['page'] ?? 1));
$pageSize = max(5, min(100, (int)($_GET['pageSize'] ?? 20)));
$offset = ($page - 1) * $pageSize;

$action = clean_text((string)($_GET['action'] ?? ''), 100);
$status = clean_text((string)($_GET['status'] ?? ''), 20);
$actorRole = clean_text((string)($_GET['actorRole'] ?? ''), 30);
$q = clean_text((string)($_GET['q'] ?? ''), 100);
$dateFrom = clean_text((string)($_GET['dateFrom'] ?? ''), 20);
$dateTo = clean_text((string)($_GET['dateTo'] ?? ''), 20);
$includeSystem = (string)($_GET['includeSystem'] ?? '') === '1';

$where = [];
$params = [];

// Hide internal audit page noise by default unless explicitly requested.
if (!$includeSystem) {
    $where[] = 'al.action_name NOT IN ("audit_logs_view", "audit_summary_view")';
}

if ($action !== null && $action !== '') {
    $where[] = 'al.action_name = :action_name';
    $params['action_name'] = $action;
}

if ($status !== null && $status !== '') {
    $where[] = 'al.status = :status';
    $params['status'] = $status;
}

if ($actorRole !== null && $actorRole !== '') {
    $where[] = 'al.actor_role = :actor_role';
    $params['actor_role'] = $actorRole;
}

if ($q !== null && $q !== '') {
    $where[] = '(al.details LIKE :q OR al.actor_user_id LIKE :q OR al.target_id LIKE :q OR al.action_name LIKE :q OR u.name LIKE :q)';
    $params['q'] = '%' . $q . '%';
}

if ($dateFrom !== null && $dateFrom !== '') {
    $where[] = 'DATE(al.created_at) >= :date_from';
    $params['date_from'] = $dateFrom;
}

if ($dateTo !== null && $dateTo !== '') {
    $where[] = 'DATE(al.created_at) <= :date_to';
    $params['date_to'] = $dateTo;
}

$whereSql = $where ? ('WHERE ' . implode(' AND ', $where)) : '';

try {
    $pdo = getDB();

    $countStmt = $pdo->prepare('SELECT COUNT(*) AS total FROM audit_logs al LEFT JOIN users u ON u.id = al.actor_user_id ' . $whereSql);
    $countStmt->execute($params);
    $total = (int)($countStmt->fetch()['total'] ?? 0);
    $totalPages = max(1, (int)ceil($total / $pageSize));

    if ($page > $totalPages) {
        $page = $totalPages;
        $offset = ($page - 1) * $pageSize;
    }

        $sql = 'SELECT al.id, al.actor_user_id, al.actor_role, u.name AS actor_name, al.action_name, al.target_type, al.target_id, al.status, al.details, al.ip_address, al.user_agent, al.created_at
            FROM audit_logs al
            LEFT JOIN users u ON u.id = al.actor_user_id '
            . $whereSql .
            ' ORDER BY al.created_at DESC, al.id DESC
              LIMIT :limit OFFSET :offset';

    $stmt = $pdo->prepare($sql);
    foreach ($params as $k => $v) {
        $stmt->bindValue(':' . $k, $v, PDO::PARAM_STR);
    }
    $stmt->bindValue(':limit', $pageSize, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $logs = $stmt->fetchAll();

    json_response([
        'success' => true,
        'logs' => $logs,
        'pagination' => [
            'page' => $page,
            'pageSize' => $pageSize,
            'total' => $total,
            'totalPages' => $totalPages,
        ],
    ]);
} catch (Exception $e) {
    json_response(['success' => false, 'error' => 'Server error'], 500);
}
