<?php
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/db.php';

require_method('POST');
$session = require_auth(['student', 'receptionist', 'admin']);
require_csrf();
// Release the PHP session file lock so concurrent persist() calls don't queue.
session_write_close();

$input  = read_json_input();
$jsKey  = (string)($input['table']  ?? '');
$action = (string)($input['action'] ?? '');
$data   = is_array($input['data'] ?? null) ? $input['data'] : [];

// Map JS camelCase keys → SQL table/column names
// CHANGED: Added 'status' to users map so active/inactive toggle writes to DB
// CHANGED: Added student_name + student_sid to bookings map
// CHANGED: Added student_sid to payments map
$tableMap = [
    'users' => [
        'table'   => 'users',
        'columns' => [
            'username' => 'username', 'role' => 'role', 'name' => 'name',
            'email' => 'email', 'phone' => 'phone',
            // ADDED: status allows admin to toggle student active/inactive and persist to DB
            'studentId' => 'student_id', 'roomId' => 'room_id', 'status' => 'status',
            'bloodGroup' => 'blood_group', 'emergencyContact' => 'emergency_contact',
            'course' => 'course', 'year' => 'year_of_study',
            'fatherName' => 'father_name', 'address' => 'address',
        ],
    ],
    'rooms' => [
        'table'   => 'rooms',
        'columns' => [
            'number' => 'number', 'floor' => 'floor', 'type' => 'type',
            'beds' => 'beds', 'occupied' => 'occupied', 'bathrooms' => 'bathrooms',
            'rent' => 'rent', 'status' => 'status',
        ],
    ],
    // ADDED: student_name + student_sid stored in bookings so phpMyAdmin shows readable info
    'bookings' => [
        'table'   => 'bookings',
        'columns' => [
            'studentId' => 'student_id', 'studentName' => 'student_name',
            'studentSid' => 'student_sid', 'roomId' => 'room_id',
            'checkIn' => 'check_in', 'checkOut' => 'check_out',
            'amount' => 'amount', 'status' => 'status',
        ],
    ],
    // ADDED: student_sid stored in payments as fallback for student ID display
    'payments' => [
        'table'   => 'payments',
        'columns' => [
            'bookingId' => 'booking_id', 'studentId' => 'student_id',
            'studentName' => 'student_name', 'studentSid' => 'student_sid',
            'amount' => 'amount', 'method' => 'method', 'date' => 'pay_date',
            'status' => 'status', 'type' => 'pay_type', 'txnId' => 'txn_id',
            'reference' => 'reference_no', 'collectedBy' => 'collected_by', 'collectedAt' => 'collected_at',
        ],
    ],
    'requests' => [
        'table'   => 'requests',
        'columns' => [
            'studentId' => 'student_id', 'type' => 'req_type',
            'description' => 'description', 'date' => 'req_date',
            'status' => 'status', 'response' => 'response',
            'resolvedAt' => 'resolved_at', 'resolvedBy' => 'resolved_by',
        ],
    ],
    'visitors' => [
        'table'   => 'visitors',
        'columns' => [
            'name' => 'name', 'studentId' => 'student_id', 'phone' => 'phone',
            'relation' => 'relation', 'idProof' => 'id_proof',
            'checkIn' => 'check_in', 'checkOut' => 'check_out',
            'status' => 'status', 'purpose' => 'purpose',
        ],
    ],
    'attendance' => [
        'table'   => 'attendance',
        'columns' => [
            'studentId' => 'student_id', 'date' => 'att_date',
            'status' => 'status', 'checkIn' => 'check_in', 'checkOut' => 'check_out',
        ],
    ],
    'notices' => [
        'table'   => 'notices',
        'columns' => [
            'title' => 'title', 'body' => 'body', 'date' => 'notice_date',
            'type' => 'type', 'author' => 'author',
        ],
    ],
    'outpasses' => [
        'table'   => 'outpasses',
        'columns' => [
            'studentId' => 'student_id', 'studentName' => 'student_name',
            'studentSid' => 'student_sid', 'roomId' => 'room_id',
            'reason' => 'reason', 'destination' => 'destination',
            'returnDateTime' => 'return_date_time', 'remarks' => 'remarks',
            'issuedAt' => 'issued_at', 'issuedBy' => 'issued_by',
            'status' => 'status', 'returnedAt' => 'returned_at',
        ],
    ],
];

if (!isset($tableMap[$jsKey]) || !in_array($action, ['add','update','remove'])) {
    json_response(['success' => false, 'error' => 'Invalid request'], 400);
}

function can_mutate(string $role, string $table, string $action): bool {
    if ($role === 'admin') {
        return true;
    }

    if ($role === 'receptionist') {
        $allowed = [
            'rooms' => ['update'],
            'bookings' => ['add', 'update'],
            'payments' => ['add', 'update'],
            'requests' => ['update'],
            'visitors' => ['add', 'update', 'remove'],
            'attendance' => ['add', 'update', 'remove'],
            'outpasses' => ['add', 'update', 'remove'],
        ];
        return in_array($action, $allowed[$table] ?? [], true);
    }

    if ($role === 'student') {
        if ($table === 'users' && $action === 'update') {
            return true;
        }
        if ($table === 'requests' && $action === 'add') {
            return true;
        }
    }

    return false;
}

if (!can_mutate($session['role'], $jsKey, $action)) {
    json_response(['success' => false, 'error' => 'Forbidden'], 403);
}

function sanitize_data_payload(string $tableKey, array $payload): array {
    $textFields = [
        'username', 'name', 'email', 'phone', 'studentId', 'roomId', 'status', 'bloodGroup', 'emergencyContact',
        'course', 'year', 'fatherName', 'address', 'number', 'floor', 'type', 'bathrooms', 'studentName',
        'studentSid', 'checkIn', 'checkOut', 'method', 'date', 'txnId', 'reference', 'collectedBy', 'collectedAt',
        'destination', 'returnDateTime', 'remarks', 'reason', 'relation', 'idProof', 'title', 'body', 'author',
    ];

    $clean = [];
    foreach ($payload as $k => $v) {
        if ($k === 'id' && is_string($v)) {
            $clean['id'] = mb_substr(trim($v), 0, 40);
            continue;
        }
        if (in_array($k, $textFields, true)) {
            $clean[$k] = clean_text(is_scalar($v) ? (string)$v : null, $k === 'body' || $k === 'address' || $k === 'description' || $k === 'remarks' ? 1000 : 150);
            continue;
        }
        if (in_array($k, ['amount', 'rent'], true)) {
            $num = is_numeric($v) ? (float)$v : 0.0;
            $clean[$k] = max(0, min($num, 1000000));
            continue;
        }
        if (in_array($k, ['beds', 'occupied'], true)) {
            $num = is_numeric($v) ? (int)$v : 0;
            $clean[$k] = max(0, min($num, 100));
            continue;
        }
        if ($k === 'amenities' && is_array($v)) {
            $clean[$k] = array_values(array_filter(array_map(static fn($a) => clean_text(is_scalar($a) ? (string)$a : null, 40), $v)));
            continue;
        }
        if ($k === 'description') {
            $clean[$k] = clean_text(is_scalar($v) ? (string)$v : null, 1000);
            continue;
        }

        if (is_scalar($v)) {
            $clean[$k] = clean_text((string)$v, 255);
        }
    }

    return $clean;
}

$data = sanitize_data_payload($jsKey, $data);

$cfg       = $tableMap[$jsKey];
$tableName = $cfg['table'];
$colMap    = $cfg['columns'];

try {
    $pdo = getDB();

    if (($action === 'update' || $action === 'remove') && empty($data['id'])) {
        json_response(['success' => false, 'error' => 'Missing id'], 400);
    }

    if ($session['role'] === 'student') {
        if ($jsKey === 'users') {
            if (($data['id'] ?? '') !== $session['id']) {
                json_response(['success' => false, 'error' => 'Forbidden'], 403);
            }

            $allowedProfileFields = ['id','name','email','phone','bloodGroup','emergencyContact','course','year','fatherName','address'];
            $data = array_intersect_key($data, array_flip($allowedProfileFields));
        }

        if ($jsKey === 'requests') {
            $data['studentId'] = $session['id'];
            $data['date'] = $data['date'] ?? date('Y-m-d');
            $data['status'] = 'pending';
            $data['response'] = null;
        }

        if ($jsKey === 'payments') {
            if ($action === 'add') {
                $data['studentId'] = $session['id'];
                $data['status'] = 'paid';
                if (empty($data['txnId'])) {
                    $data['txnId'] = 'TXN' . time() . random_int(100, 999);
                }
            }

            if ($action === 'update') {
                $ownerCheck = $pdo->prepare('SELECT student_id FROM payments WHERE id = ? LIMIT 1');
                $ownerCheck->execute([$data['id']]);
                $rowOwner = $ownerCheck->fetch();
                if (!$rowOwner || ($rowOwner['student_id'] ?? '') !== $session['id']) {
                    json_response(['success' => false, 'error' => 'Forbidden'], 403);
                }
            }
        }
    }

    if ($action === 'remove') {
        $pdo->prepare("DELETE FROM $tableName WHERE id = ?")->execute([$data['id']]);
        audit_log($pdo, 'data_remove', 'success', $tableName, (string)$data['id'], 'Removed row from ' . $tableName, $session);
        json_response(['success' => true]);
    }

    // Build db row from JS data
    $row = ['id' => $data['id']];
    foreach ($colMap as $jsCol => $dbCol) {
        if (array_key_exists($jsCol, $data)) {
            $row[$dbCol] = $data[$jsCol] === '' ? null : $data[$jsCol];
        }
    }

    // Handle amenities array → JSON
    if ($jsKey === 'rooms' && isset($data['amenities'])) {
        $row['amenities'] = json_encode($data['amenities']);
    }

    // Hash password when adding/updating users
    if ($jsKey === 'users' && isset($data['password']) && is_string($data['password']) && $data['password'] !== '') {
        $row['password_hash'] = password_hash($data['password'], PASSWORD_DEFAULT);
    }

    if ($action === 'add') {
        $cols  = array_keys($row);
        $ph    = implode(',', array_map(fn($c) => ":$c", $cols));
        $colsQ = implode(',', $cols);
        $pdo->prepare("INSERT IGNORE INTO $tableName ($colsQ) VALUES ($ph)")->execute($row);
        audit_log($pdo, 'data_add', 'success', $tableName, (string)($row['id'] ?? ''), 'Added row to ' . $tableName, $session);
    } else {
        // update – only set non-id columns
        $id = $row['id'];
        unset($row['id']);
        if (empty($row)) { json_response(['success' => true]); }
        $sets = implode(',', array_map(fn($c) => "$c=:$c", array_keys($row)));
        $row['id'] = $id;
        $pdo->prepare("UPDATE $tableName SET $sets WHERE id=:id")->execute($row);
        audit_log($pdo, 'data_update', 'success', $tableName, (string)$id, 'Updated row in ' . $tableName, $session);
    }

    json_response(['success' => true]);
} catch (Exception $e) {
    json_response(['success' => false, 'error' => 'Server error'], 500);
}
