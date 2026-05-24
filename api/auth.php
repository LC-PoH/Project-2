<?php
// Shared auth/security helpers for API endpoints.

if (!headers_sent()) {
    header('Content-Type: application/json');
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: DENY');
    header('Referrer-Policy: no-referrer');
    header('Permissions-Policy: geolocation=(), microphone=(), camera=()');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
}

$https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'domain' => '',
        'secure' => $https,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}

function json_response(array $payload, int $status = 200): void {
    http_response_code($status);
    echo json_encode($payload);
    exit;
}

function read_json_input(): array {
    $raw = file_get_contents('php://input');
    if ($raw === false || $raw === '') {
        return [];
    }

    $decoded = json_decode($raw, true);
    if (json_last_error() !== JSON_ERROR_NONE || !is_array($decoded)) {
        json_response(['success' => false, 'error' => 'Invalid JSON payload'], 400);
    }

    return $decoded;
}

function require_method(string $method): void {
    if (strtoupper($_SERVER['REQUEST_METHOD'] ?? '') !== strtoupper($method)) {
        json_response(['success' => false, 'error' => 'Method not allowed'], 405);
    }
}

function require_auth(?array $allowedRoles = null): array {
    $user = $_SESSION['user'] ?? null;
    if (!is_array($user) || empty($user['id']) || empty($user['role'])) {
        json_response(['success' => false, 'error' => 'Authentication required'], 401);
    }

    if ($allowedRoles !== null && !in_array($user['role'], $allowedRoles, true)) {
        json_response(['success' => false, 'error' => 'Forbidden'], 403);
    }

    return $user;
}

function require_csrf(): void {
    $sessionToken = $_SESSION['csrf_token'] ?? '';
    $headerToken = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';

    if (!is_string($sessionToken) || $sessionToken === '' || !is_string($headerToken) || $headerToken === '') {
        json_response(['success' => false, 'error' => 'CSRF validation failed'], 403);
    }

    if (!hash_equals($sessionToken, $headerToken)) {
        json_response(['success' => false, 'error' => 'CSRF validation failed'], 403);
    }
}

function new_csrf_token(): string {
    $token = bin2hex(random_bytes(32));
    $_SESSION['csrf_token'] = $token;
    return $token;
}

function get_client_ip(): string {
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    return is_string($ip) ? $ip : 'unknown';
}

function get_user_agent(): string {
    $ua = $_SERVER['HTTP_USER_AGENT'] ?? '';
    if (!is_string($ua)) {
        return '';
    }
    return mb_substr($ua, 0, 255);
}

function check_login_rate_limit(int $maxAttempts = 8, int $windowSeconds = 900): void {
    if (!isset($_SESSION['login_attempts']) || !is_array($_SESSION['login_attempts'])) {
        $_SESSION['login_attempts'] = [];
    }

    $ip = get_client_ip();
    $now = time();
    $attempts = $_SESSION['login_attempts'][$ip] ?? [];
    $attempts = array_values(array_filter($attempts, static fn($ts) => is_int($ts) && ($now - $ts) < $windowSeconds));

    if (count($attempts) >= $maxAttempts) {
        json_response([
            'success' => false,
            'error' => 'Too many failed login attempts. Please try again later.',
        ], 429);
    }

    $_SESSION['login_attempts'][$ip] = $attempts;
}

function record_login_failure(): void {
    if (!isset($_SESSION['login_attempts']) || !is_array($_SESSION['login_attempts'])) {
        $_SESSION['login_attempts'] = [];
    }

    $ip = get_client_ip();
    if (!isset($_SESSION['login_attempts'][$ip]) || !is_array($_SESSION['login_attempts'][$ip])) {
        $_SESSION['login_attempts'][$ip] = [];
    }

    $_SESSION['login_attempts'][$ip][] = time();
}

function clear_login_failures(): void {
    $ip = get_client_ip();
    if (isset($_SESSION['login_attempts'][$ip])) {
        unset($_SESSION['login_attempts'][$ip]);
    }
}

function clean_text(?string $value, int $maxLen = 255): ?string {
    if ($value === null) {
        return null;
    }

    $trimmed = trim($value);
    if ($trimmed === '') {
        return null;
    }

    $noTags = strip_tags($trimmed);
    return mb_substr($noTags, 0, $maxLen);
}

function audit_log(PDO $pdo, string $action, string $status = 'success', ?string $targetType = null, ?string $targetId = null, ?string $details = null, ?array $actor = null): void {
    try {
        $actorData = $actor ?? ($_SESSION['user'] ?? null);
        $actorId = is_array($actorData) ? (string)($actorData['id'] ?? '') : '';
        $actorRole = is_array($actorData) ? (string)($actorData['role'] ?? '') : '';

        $stmt = $pdo->prepare(
            'INSERT INTO audit_logs (actor_user_id, actor_role, action_name, target_type, target_id, status, details, ip_address, user_agent)
             VALUES (:actor_user_id, :actor_role, :action_name, :target_type, :target_id, :status, :details, :ip_address, :user_agent)'
        );

        $stmt->execute([
            'actor_user_id' => $actorId !== '' ? mb_substr($actorId, 0, 30) : null,
            'actor_role'    => $actorRole !== '' ? mb_substr($actorRole, 0, 30) : null,
            'action_name'   => mb_substr($action, 0, 100),
            'target_type'   => $targetType !== null ? mb_substr($targetType, 0, 50) : null,
            'target_id'     => $targetId !== null ? mb_substr($targetId, 0, 50) : null,
            'status'        => mb_substr($status, 0, 20),
            'details'       => $details !== null ? mb_substr($details, 0, 1000) : null,
            'ip_address'    => mb_substr(get_client_ip(), 0, 64),
            'user_agent'    => get_user_agent(),
        ]);
    } catch (Throwable $e) {
        // Never fail a request because audit logging failed.
    }
}
