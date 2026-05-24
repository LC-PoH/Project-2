<?php
require_once __DIR__ . '/auth.php';

require_method('GET');
$user = require_auth();

json_response([
    'success' => true,
    'user' => $user,
    'csrfToken' => $_SESSION['csrf_token'] ?? new_csrf_token(),
]);
