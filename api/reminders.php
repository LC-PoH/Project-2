<?php
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/db.php';

$session = require_auth(['admin']);
$pdo = getDB();

$pdo->exec(
    'CREATE TABLE IF NOT EXISTS reminders_queue (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        student_id VARCHAR(30) NOT NULL,
        student_name VARCHAR(100) NULL,
        student_sid VARCHAR(30) NULL,
        amount_due DECIMAL(10,2) NOT NULL DEFAULT 0,
        days_overdue INT NOT NULL DEFAULT 0,
        channel VARCHAR(20) NOT NULL,
        template_key VARCHAR(50) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT "queued",
        note VARCHAR(255) NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        sent_at DATETIME NULL,
        actor_user_id VARCHAR(30) NULL,
        INDEX idx_reminders_student (student_id),
        INDEX idx_reminders_status (status),
        INDEX idx_reminders_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4'
);

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

if ($method === 'GET') {
    require_method('GET');

    $status = clean_text((string)($_GET['status'] ?? ''), 20);
    $limit = max(10, min(200, (int)($_GET['limit'] ?? 60)));

    $where = [];
    $params = [];

    if ($status !== null && $status !== '') {
        $where[] = 'status = ?';
        $params[] = $status;
    }

    $sql = 'SELECT id, student_id, student_name, student_sid, amount_due, days_overdue, channel, template_key, status, note, created_at, sent_at
            FROM reminders_queue';
    if (!empty($where)) {
        $sql .= ' WHERE ' . implode(' AND ', $where);
    }
    $sql .= ' ORDER BY created_at DESC LIMIT ' . (int)$limit;

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    json_response(['success' => true, 'rows' => $rows]);
}

require_method('POST');
require_csrf();

$input = read_json_input();
$action = clean_text((string)($input['action'] ?? ''), 30);

if ($action === 'generate') {
    $channel = clean_text((string)($input['channel'] ?? 'whatsapp'), 20);
    $minDays = max(0, min(365, (int)($input['minDays'] ?? 0)));
    $templateKey = clean_text((string)($input['templateKey'] ?? 'fee_due_v1'), 50);

    $allowedChannels = ['whatsapp', 'email', 'inapp'];
    if ($channel === null || !in_array($channel, $allowedChannels, true) || $templateKey === null) {
        json_response(['success' => false, 'error' => 'Invalid reminder settings'], 400);
    }

    $query = $pdo->prepare(
        'SELECT p.student_id,
                MAX(COALESCE(u.name, p.student_name, "Student")) AS student_name,
                MAX(COALESCE(u.student_id, p.student_sid, "")) AS student_sid,
                COALESCE(SUM(p.amount), 0) AS total_due,
                MAX(DATEDIFF(CURDATE(), p.pay_date)) AS max_overdue_days
         FROM payments p
         LEFT JOIN users u ON u.id = p.student_id
         WHERE p.status = "pending"
         GROUP BY p.student_id
         HAVING MAX(DATEDIFF(CURDATE(), p.pay_date)) >= ?'
    );
    $query->execute([$minDays]);
    $candidates = $query->fetchAll();

    $inserted = 0;
    $skipped = 0;

    $checkExisting = $pdo->prepare(
        'SELECT id
         FROM reminders_queue
         WHERE student_id = ?
           AND channel = ?
           AND DATE(created_at) = CURDATE()
           AND status IN ("queued", "sent")
         LIMIT 1'
    );

    $insertStmt = $pdo->prepare(
        'INSERT INTO reminders_queue
            (student_id, student_name, student_sid, amount_due, days_overdue, channel, template_key, status, note, actor_user_id)
         VALUES
            (?, ?, ?, ?, ?, ?, ?, "queued", ?, ?)'
    );

    foreach ($candidates as $row) {
        $studentId = (string)($row['student_id'] ?? '');
        if ($studentId === '') {
            $skipped++;
            continue;
        }

        $checkExisting->execute([$studentId, $channel]);
        if ($checkExisting->fetch()) {
            $skipped++;
            continue;
        }

        $amountDue = (float)($row['total_due'] ?? 0);
        $daysOverdue = (int)($row['max_overdue_days'] ?? 0);
        $note = 'Auto-generated due reminder';

        $insertStmt->execute([
            $studentId,
            (string)($row['student_name'] ?? 'Student'),
            (string)($row['student_sid'] ?? ''),
            $amountDue,
            $daysOverdue,
            $channel,
            $templateKey,
            $note,
            (string)($session['id'] ?? ''),
        ]);
        $inserted++;
    }

    audit_log(
        $pdo,
        'reminder_generate',
        'success',
        'reminders',
        null,
        'Generated due reminders channel=' . $channel . ' minDays=' . $minDays . ' inserted=' . $inserted . ' skipped=' . $skipped,
        $session
    );

    json_response([
        'success' => true,
        'inserted' => $inserted,
        'skipped' => $skipped,
        'message' => 'Reminders generated',
    ]);
}

if ($action === 'mark_sent') {
    $id = (int)($input['id'] ?? 0);
    if ($id <= 0) {
        json_response(['success' => false, 'error' => 'Invalid reminder id'], 400);
    }

    $update = $pdo->prepare('UPDATE reminders_queue SET status = "sent", sent_at = NOW(), note = "Marked sent by admin" WHERE id = ?');
    $update->execute([$id]);

    audit_log($pdo, 'reminder_mark_sent', 'success', 'reminders', (string)$id, 'Reminder marked as sent', $session);

    json_response(['success' => true, 'id' => $id]);
}

json_response(['success' => false, 'error' => 'Invalid action'], 400);
