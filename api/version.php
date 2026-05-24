<?php
header('Content-Type: application/json');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

$root = realpath(__DIR__ . '/..');
if ($root === false) {
    http_response_code(500);
    echo json_encode(['success' => false]);
    exit;
}

$files = [
    $root . DIRECTORY_SEPARATOR . 'script.js',
    $root . DIRECTORY_SEPARATOR . 'styles.css',
    $root . DIRECTORY_SEPARATOR . 'login.html',
    $root . DIRECTORY_SEPARATOR . 'owner-dashboard.html',
    $root . DIRECTORY_SEPARATOR . 'student-dashboard.html',
    $root . DIRECTORY_SEPARATOR . 'receptionist-dashboard.html',
];

$latest = 0;
foreach ($files as $file) {
    if (is_file($file)) {
        $mtime = filemtime($file);
        if ($mtime !== false && $mtime > $latest) {
            $latest = $mtime;
        }
    }
}

if ($latest <= 0) {
    $latest = time();
}

echo json_encode([
    'success' => true,
    'version' => (string)$latest,
]);
