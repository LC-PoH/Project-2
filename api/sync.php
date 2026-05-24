<?php
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/db.php';

require_method('GET');
$session = require_auth(['student', 'receptionist', 'admin']);

try {
    $pdo = getDB();

    $isStudent = $session['role'] === 'student';

    if ($isStudent) {
        $usersStmt = $pdo->prepare(
            'SELECT id, username, role, name, email, phone,
                    student_id AS studentId, room_id AS roomId, status,
                    blood_group AS bloodGroup, emergency_contact AS emergencyContact,
                    course, year_of_study AS year, father_name AS fatherName, address
             FROM users
             WHERE id = ?'
        );
        $usersStmt->execute([$session['id']]);
        $users = $usersStmt->fetchAll();

        $roomsStmt = $pdo->prepare(
            'SELECT id, number, floor, type, beds, occupied, bathrooms, rent, status, amenities
             FROM rooms
             WHERE id IN (SELECT room_id FROM users WHERE id = ? LIMIT 1)'
        );
        $roomsStmt->execute([$session['id']]);
        $rooms = $roomsStmt->fetchAll();
    } else {
        $users = $pdo->query(
            'SELECT id, username, role, name, email, phone,
                    student_id AS studentId, room_id AS roomId, status,
                    blood_group AS bloodGroup, emergency_contact AS emergencyContact,
                    course, year_of_study AS year, father_name AS fatherName, address
             FROM users'
        )->fetchAll();

        $rooms = $pdo->query(
            'SELECT id, number, floor, type, beds, occupied, bathrooms, rent, status, amenities FROM rooms'
        )->fetchAll();
    }

    foreach ($rooms as &$r) {
        $r['amenities'] = json_decode($r['amenities'] ?? '[]', true) ?: [];
        $r['rent']      = (float)$r['rent'];
        $r['beds']      = (int)$r['beds'];
        $r['occupied']  = (int)$r['occupied'];
    }
    unset($r);

    if ($isStudent) {
        $bookingsStmt = $pdo->prepare(
            'SELECT id, student_id AS studentId, student_name AS studentName,
                    student_sid AS studentSid, room_id AS roomId,
                    check_in AS checkIn, check_out AS checkOut, amount, status
             FROM bookings
             WHERE student_id = ?'
        );
        $bookingsStmt->execute([$session['id']]);
        $bookings = $bookingsStmt->fetchAll();
    } else {
        $bookings = $pdo->query(
            'SELECT id, student_id AS studentId, student_name AS studentName,
                    student_sid AS studentSid, room_id AS roomId,
                    check_in AS checkIn, check_out AS checkOut, amount, status
             FROM bookings'
        )->fetchAll();
    }
    foreach ($bookings as &$b) { $b['amount'] = (float)$b['amount']; }
    unset($b);

    if ($isStudent) {
        $paymentsStmt = $pdo->prepare(
            'SELECT id, booking_id AS bookingId, student_id AS studentId,
                    student_name AS studentName, student_sid AS studentSid,
                    amount, method, pay_date AS date, status, pay_type AS type, txn_id AS txnId,
                    reference_no AS reference, collected_by AS collectedBy, collected_at AS collectedAt
             FROM payments
             WHERE student_id = ?'
        );
        $paymentsStmt->execute([$session['id']]);
        $payments = $paymentsStmt->fetchAll();
    } else {
        $payments = $pdo->query(
            'SELECT id, booking_id AS bookingId, student_id AS studentId,
                    student_name AS studentName, student_sid AS studentSid,
                    amount, method, pay_date AS date, status, pay_type AS type, txn_id AS txnId,
                    reference_no AS reference, collected_by AS collectedBy, collected_at AS collectedAt
             FROM payments'
        )->fetchAll();
    }
    foreach ($payments as &$p) { $p['amount'] = (float)$p['amount']; }
    unset($p);

    if ($isStudent) {
        $requestsStmt = $pdo->prepare(
            'SELECT id, student_id AS studentId, req_type AS type,
                    description, req_date AS date, status, response,
                    resolved_at AS resolvedAt, resolved_by AS resolvedBy
             FROM requests
             WHERE student_id = ?'
        );
        $requestsStmt->execute([$session['id']]);
        $requests = $requestsStmt->fetchAll();

        $attendanceStmt = $pdo->prepare(
            'SELECT id, student_id AS studentId, att_date AS date,
                    status, check_in AS checkIn, check_out AS checkOut
             FROM attendance
             WHERE student_id = ?'
        );
        $attendanceStmt->execute([$session['id']]);
        $attendance = $attendanceStmt->fetchAll();
        $visitors = [];
    } else {
        $requests = $pdo->query(
            'SELECT id, student_id AS studentId, req_type AS type,
                    description, req_date AS date, status, response,
                    resolved_at AS resolvedAt, resolved_by AS resolvedBy
             FROM requests'
        )->fetchAll();

        $visitors = $pdo->query(
            'SELECT id, name, student_id AS studentId, phone,
                    relation, id_proof AS idProof,
                    check_in AS checkIn, check_out AS checkOut, status, purpose
             FROM visitors'
        )->fetchAll();

        $attendance = $pdo->query(
            'SELECT id, student_id AS studentId, att_date AS date,
                    status, check_in AS checkIn, check_out AS checkOut
             FROM attendance'
        )->fetchAll();
    }

    $notices = $pdo->query(
        'SELECT id, title, body, notice_date AS date, type, author FROM notices'
    )->fetchAll();

    $outpasses = [];
    try {
        if ($isStudent) {
            $outpassesStmt = $pdo->prepare(
                'SELECT id, student_id AS studentId, student_name AS studentName,
                        student_sid AS studentSid, room_id AS roomId,
                        reason, destination, return_date_time AS returnDateTime,
                        remarks, issued_at AS issuedAt, issued_by AS issuedBy,
                        status, returned_at AS returnedAt
                 FROM outpasses
                 WHERE student_id = ?'
            );
            $outpassesStmt->execute([$session['id']]);
            $outpasses = $outpassesStmt->fetchAll();
        } else {
            $outpasses = $pdo->query(
                'SELECT id, student_id AS studentId, student_name AS studentName,
                        student_sid AS studentSid, room_id AS roomId,
                        reason, destination, return_date_time AS returnDateTime,
                        remarks, issued_at AS issuedAt, issued_by AS issuedBy,
                        status, returned_at AS returnedAt
                 FROM outpasses'
            )->fetchAll();
        }
    } catch (Exception $e) { /* Table may not exist yet – safe to skip */ }

    json_response([
        'success' => true,
        'data'    => compact('users','rooms','bookings','payments','requests','visitors','attendance','notices','outpasses'),
    ]);
} catch (Exception $e) {
    json_response(['success' => false, 'error' => 'Server error'], 500);
}
