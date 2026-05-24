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

function audit_target_fallback(?string $targetType, ?string $targetId): string {
    $type = trim((string)$targetType);
    $id = trim((string)$targetId);

    if ($type === '' && $id === '') {
        return '-';
    }

    $typeLabel = $type !== '' ? ucwords(str_replace(['_', '-'], ' ', $type)) : 'Target';
    return $id !== '' ? ($typeLabel . ' #' . $id) : $typeLabel;
}

function resolve_audit_target_display(PDO $pdo, ?string $targetType, ?string $targetId): string {
    static $cache = [];

    $type = strtolower(trim((string)$targetType));
    $id = trim((string)$targetId);
    $cacheKey = $type . '|' . $id;

    if (isset($cache[$cacheKey])) {
        return $cache[$cacheKey];
    }

    if ($type === '' && $id === '') {
        $cache[$cacheKey] = '-';
        return '-';
    }

    $label = '';

    try {
        switch ($type) {
            case 'payment':
            case 'payments': {
                if ($id !== '') {
                    $stmt = $pdo->prepare('SELECT txn_id, pay_type, student_name, amount FROM payments WHERE id = ? LIMIT 1');
                    $stmt->execute([$id]);
                    $row = $stmt->fetch();
                    if ($row) {
                        $txn = trim((string)($row['txn_id'] ?? ''));
                        $payType = trim((string)($row['pay_type'] ?? ''));
                        $student = trim((string)($row['student_name'] ?? ''));
                        $amount = (float)($row['amount'] ?? 0);
                        $label = 'Payment' . ($txn !== '' ? (' ' . $txn) : (' #' . $id));
                        if ($student !== '') $label .= ' • ' . $student;
                        if ($payType !== '') $label .= ' • ' . $payType;
                        if ($amount > 0) $label .= ' • Rs ' . number_format($amount, 2);
                    }
                }
                break;
            }

            case 'request':
            case 'requests': {
                if ($id !== '') {
                    $stmt = $pdo->prepare('SELECT r.req_type, u.name AS student_name FROM requests r LEFT JOIN users u ON u.id = r.student_id WHERE r.id = ? LIMIT 1');
                    $stmt->execute([$id]);
                    $row = $stmt->fetch();
                    if ($row) {
                        $reqType = trim((string)($row['req_type'] ?? ''));
                        $student = trim((string)($row['student_name'] ?? ''));
                        $label = 'Request';
                        if ($reqType !== '') $label .= ' • ' . ucwords(str_replace(['_', '-'], ' ', $reqType));
                        if ($student !== '') $label .= ' • ' . $student;
                        $label .= ' • #' . $id;
                    }
                }
                break;
            }

            case 'user':
            case 'users': {
                if ($id !== '') {
                    $stmt = $pdo->prepare('SELECT name, username, role, student_id FROM users WHERE id = ? LIMIT 1');
                    $stmt->execute([$id]);
                    $row = $stmt->fetch();
                    if ($row) {
                        $name = trim((string)($row['name'] ?? ''));
                        $username = trim((string)($row['username'] ?? ''));
                        $role = trim((string)($row['role'] ?? ''));
                        $studentId = trim((string)($row['student_id'] ?? ''));
                        $label = 'User ' . ($name !== '' ? $name : ($username !== '' ? $username : ('#' . $id)));
                        if ($role !== '') $label .= ' (' . $role . ')';
                        if ($studentId !== '') $label .= ' • ' . $studentId;
                    }
                }
                break;
            }

            case 'room':
            case 'rooms': {
                if ($id !== '') {
                    $stmt = $pdo->prepare('SELECT number, type, floor FROM rooms WHERE id = ? LIMIT 1');
                    $stmt->execute([$id]);
                    $row = $stmt->fetch();
                    if ($row) {
                        $number = trim((string)($row['number'] ?? ''));
                        $typeName = trim((string)($row['type'] ?? ''));
                        $floor = trim((string)($row['floor'] ?? ''));
                        $label = 'Room ' . ($number !== '' ? $number : ('#' . $id));
                        if ($typeName !== '') $label .= ' • ' . $typeName;
                        if ($floor !== '') $label .= ' • ' . $floor;
                    }
                }
                break;
            }

            case 'booking':
            case 'bookings': {
                if ($id !== '') {
                    $stmt = $pdo->prepare('SELECT student_name, student_sid, status FROM bookings WHERE id = ? LIMIT 1');
                    $stmt->execute([$id]);
                    $row = $stmt->fetch();
                    if ($row) {
                        $student = trim((string)($row['student_name'] ?? ''));
                        $sid = trim((string)($row['student_sid'] ?? ''));
                        $statusText = trim((string)($row['status'] ?? ''));
                        $label = 'Booking #' . $id;
                        if ($student !== '') $label .= ' • ' . $student;
                        if ($sid !== '') $label .= ' • ' . $sid;
                        if ($statusText !== '') $label .= ' • ' . $statusText;
                    }
                }
                break;
            }

            case 'visitor':
            case 'visitors': {
                if ($id !== '') {
                    $stmt = $pdo->prepare('SELECT name, purpose FROM visitors WHERE id = ? LIMIT 1');
                    $stmt->execute([$id]);
                    $row = $stmt->fetch();
                    if ($row) {
                        $name = trim((string)($row['name'] ?? ''));
                        $purpose = trim((string)($row['purpose'] ?? ''));
                        $label = 'Visitor ' . ($name !== '' ? $name : ('#' . $id));
                        if ($purpose !== '') $label .= ' • ' . $purpose;
                    }
                }
                break;
            }

            case 'attendance': {
                if ($id !== '') {
                    $stmt = $pdo->prepare('SELECT a.att_date, a.status, u.name AS student_name FROM attendance a LEFT JOIN users u ON u.id = a.student_id WHERE a.id = ? LIMIT 1');
                    $stmt->execute([$id]);
                    $row = $stmt->fetch();
                    if ($row) {
                        $date = trim((string)($row['att_date'] ?? ''));
                        $statusText = trim((string)($row['status'] ?? ''));
                        $student = trim((string)($row['student_name'] ?? ''));
                        $label = 'Attendance';
                        if ($student !== '') $label .= ' • ' . $student;
                        if ($date !== '') $label .= ' • ' . $date;
                        if ($statusText !== '') $label .= ' • ' . $statusText;
                    }
                }
                break;
            }

            case 'notice':
            case 'notices': {
                if ($id !== '') {
                    $stmt = $pdo->prepare('SELECT title FROM notices WHERE id = ? LIMIT 1');
                    $stmt->execute([$id]);
                    $row = $stmt->fetch();
                    if ($row) {
                        $title = trim((string)($row['title'] ?? ''));
                        $label = 'Notice ' . ($title !== '' ? $title : ('#' . $id));
                    }
                }
                break;
            }

            case 'outpass':
            case 'outpasses': {
                if ($id !== '') {
                    $stmt = $pdo->prepare('SELECT student_name, destination, status FROM outpasses WHERE id = ? LIMIT 1');
                    $stmt->execute([$id]);
                    $row = $stmt->fetch();
                    if ($row) {
                        $student = trim((string)($row['student_name'] ?? ''));
                        $destination = trim((string)($row['destination'] ?? ''));
                        $statusText = trim((string)($row['status'] ?? ''));
                        $label = 'Outpass #' . $id;
                        if ($student !== '') $label .= ' • ' . $student;
                        if ($destination !== '') $label .= ' • ' . $destination;
                        if ($statusText !== '') $label .= ' • ' . $statusText;
                    }
                }
                break;
            }
        }
    } catch (Throwable $e) {
        // Fall back to generic label if enrichment fails.
    }

    if ($label === '') {
        $label = audit_target_fallback($targetType, $targetId);
    }

    $label = mb_substr($label, 0, 220);
    $cache[$cacheKey] = $label;
    return $label;
}

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

    foreach ($logs as &$log) {
        $log['target_display'] = resolve_audit_target_display($pdo, (string)($log['target_type'] ?? ''), (string)($log['target_id'] ?? ''));
    }
    unset($log);

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
