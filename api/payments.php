<?php
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/db.php';

require_method('POST');
$session = require_auth(['student']);
require_csrf();

$input = read_json_input();
$method = clean_text((string)($input['method'] ?? ''), 50);
$amount = (float)($input['amount'] ?? 0);
$idempotencyKey = clean_text((string)($input['idempotencyKey'] ?? ''), 100);

if ($method === null || $amount <= 0 || $idempotencyKey === null) {
    json_response(['success' => false, 'error' => 'Invalid payment request'], 400);
}

if (!preg_match('/^[A-Za-z0-9._:-]{8,100}$/', $idempotencyKey)) {
    json_response(['success' => false, 'error' => 'Invalid idempotency key'], 400);
}

try {
    $pdo = getDB();
    $pdo->beginTransaction();

    $studentStmt = $pdo->prepare('SELECT id, name, student_id FROM users WHERE id = ? LIMIT 1');
    $studentStmt->execute([$session['id']]);
    $student = $studentStmt->fetch();
    if (!$student) {
        $pdo->rollBack();
        json_response(['success' => false, 'error' => 'Student not found'], 404);
    }

    $ref = 'idem:' . $idempotencyKey;
    $idemStmt = $pdo->prepare(
        'SELECT id, txn_id, amount, pay_date
         FROM payments
         WHERE student_id = ? AND reference_no = ?
         LIMIT 1'
    );
    $idemStmt->execute([$session['id'], $ref]);
    $existing = $idemStmt->fetch();
    if ($existing) {
        $dueStmt = $pdo->prepare('SELECT COALESCE(SUM(amount),0) AS due_total FROM payments WHERE student_id = ? AND status = "pending"');
        $dueStmt->execute([$session['id']]);
        $due = (float)($dueStmt->fetch()['due_total'] ?? 0);

        $pdo->commit();
        json_response([
            'success' => true,
            'idempotent' => true,
            'transactionId' => $existing['txn_id'],
            'paidAmount' => (float)$existing['amount'],
            'remainingDue' => $due,
            'message' => 'Payment already processed',
        ]);
    }

    $pendingStmt = $pdo->prepare(
        'SELECT id, booking_id, amount, pay_type
         FROM payments
         WHERE student_id = ? AND status = "pending"
         ORDER BY pay_date ASC, id ASC
         FOR UPDATE'
    );
    $pendingStmt->execute([$session['id']]);
    $pendingRows = $pendingStmt->fetchAll();

    $dueTotal = array_reduce($pendingRows, static fn($sum, $row) => $sum + (float)$row['amount'], 0.0);
    if ($dueTotal <= 0) {
        $pdo->rollBack();
        json_response(['success' => false, 'error' => 'No pending dues'], 400);
    }

    $payAmount = min($amount, $dueTotal);
    $remainingToAllocate = $payAmount;
    $txnId = 'TXN' . date('YmdHis') . random_int(1000, 9999);
    $payDate = date('Y-m-d');
    $insertedPaymentId = null;

    $insertPaidStmt = $pdo->prepare(
        'INSERT INTO payments (id, booking_id, student_id, student_name, student_sid, amount, method, pay_date, status, pay_type, txn_id, reference_no, collected_by, collected_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, "paid", ?, ?, ?, ?, NOW())'
    );
    $updatePendingAmountStmt = $pdo->prepare('UPDATE payments SET amount = ? WHERE id = ?');
    $deletePendingStmt = $pdo->prepare('DELETE FROM payments WHERE id = ?');

    foreach ($pendingRows as $row) {
        if ($remainingToAllocate <= 0) {
            break;
        }

        $rowAmount = (float)$row['amount'];
        if ($rowAmount <= 0) {
            continue;
        }

        $consume = min($remainingToAllocate, $rowAmount);
        $newPendingAmount = $rowAmount - $consume;

        if ($newPendingAmount <= 0.0001) {
            $deletePendingStmt->execute([$row['id']]);
        } else {
            $updatePendingAmountStmt->execute([$newPendingAmount, $row['id']]);
        }

        $newId = 'p' . bin2hex(random_bytes(8));
        $insertPaidStmt->execute([
            $newId,
            $row['booking_id'],
            $session['id'],
            $student['name'] ?? null,
            $student['student_id'] ?? null,
            $consume,
            $method,
            $payDate,
            $row['pay_type'] ?: 'Monthly Rent',
            $txnId,
            $ref,
            'self-service',
        ]);

        if ($insertedPaymentId === null) {
            $insertedPaymentId = $newId;
        }

        $remainingToAllocate -= $consume;
    }

    $remainingDueStmt = $pdo->prepare('SELECT COALESCE(SUM(amount),0) AS due_total FROM payments WHERE student_id = ? AND status = "pending"');
    $remainingDueStmt->execute([$session['id']]);
    $remainingDue = (float)($remainingDueStmt->fetch()['due_total'] ?? 0);

    audit_log(
        $pdo,
        'payment_submit',
        'success',
        'payment',
        $insertedPaymentId,
        'Student payment submitted. Requested=' . $amount . ', applied=' . $payAmount . ', remaining=' . $remainingDue
    );

    $pdo->commit();

    json_response([
        'success' => true,
        'transactionId' => $txnId,
        'paidAmount' => $payAmount,
        'remainingDue' => $remainingDue,
    ]);
} catch (Exception $e) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    if (isset($pdo) && $pdo instanceof PDO) {
        audit_log($pdo, 'payment_submit', 'failed', 'payment', null, 'Payment processing failed');
    }

    json_response(['success' => false, 'error' => 'Payment processing failed'], 500);
}
