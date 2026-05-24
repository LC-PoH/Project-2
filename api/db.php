<?php

function env_value(string $key, ?string $default = null): ?string {
    $value = getenv($key);
    if ($value === false) {
        return $default;
    }
    $value = trim((string)$value);
    return $value === '' ? $default : $value;
}

define('APP_ENV', strtolower((string)env_value('APP_ENV', 'development')));
define('DB_HOST', env_value('DB_HOST', 'localhost'));
define('DB_NAME', env_value('DB_NAME', 'hostel_management'));
define('DB_USER', env_value('DB_USER', 'root'));
define('DB_PASS', env_value('DB_PASS', ''));

if (APP_ENV === 'production') {
    $hasUnsafeDefaults = (DB_USER === 'root' && DB_PASS === '')
        || DB_HOST === 'localhost'
        || DB_NAME === 'hostel_management';

    if ($hasUnsafeDefaults) {
        error_log('Refusing to start with insecure DB defaults in production. Configure DB_HOST, DB_NAME, DB_USER, DB_PASS.');
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'error' => 'Internal server error']);
        exit;
    }
}

function getDB(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $pdo = new PDO(
                'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
                DB_USER, DB_PASS,
                [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false,
                ]
            );
        } catch (PDOException $e) {
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode(['success' => false, 'error' => 'Internal server error']);
            exit;
        }
    }
    return $pdo;
}
