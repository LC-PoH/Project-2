<?php

function ensure_twofa_schema(PDO $pdo): void {
    static $done = false;
    if ($done) {
        return;
    }

    try {
        $pdo->exec('ALTER TABLE users ADD COLUMN twofa_enabled TINYINT(1) NOT NULL DEFAULT 0');
    } catch (Throwable $e) {
        // Column may already exist.
    }

    try {
        $pdo->exec('ALTER TABLE users ADD COLUMN twofa_secret VARCHAR(64) NULL');
    } catch (Throwable $e) {
        // Column may already exist.
    }

    try {
        // Backward compatibility: rename legacy table if it exists.
        $pdo->exec('RENAME TABLE twofa_recovery_codes TO `2fa_recovery_codes`');
    } catch (Throwable $e) {
        // Either legacy table does not exist, or new table already exists.
    }

    try {
        $pdo->exec('CREATE TABLE IF NOT EXISTS `2fa_recovery_codes` (
            id BIGINT AUTO_INCREMENT PRIMARY KEY,
            user_id VARCHAR(30) NOT NULL,
            code_hash CHAR(64) NOT NULL,
            used_at DATETIME NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_twofa_recovery_user (user_id),
            INDEX idx_twofa_recovery_used (used_at)
        )');
    } catch (Throwable $e) {
        // Some environments disallow CREATE TABLE on app login requests.
        // Keep login functional even if recovery table bootstrap is blocked.
    }

    $done = true;
}

function normalize_otp_code(?string $code): string {
    $value = is_string($code) ? $code : '';
    return preg_replace('/\D+/', '', $value) ?? '';
}

function base32_encode_binary(string $binary): string {
    $alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    $bits = '';
    $length = strlen($binary);

    for ($i = 0; $i < $length; $i++) {
        $bits .= str_pad(decbin(ord($binary[$i])), 8, '0', STR_PAD_LEFT);
    }

    $encoded = '';
    $bitLength = strlen($bits);
    for ($i = 0; $i < $bitLength; $i += 5) {
        $chunk = substr($bits, $i, 5);
        if (strlen($chunk) < 5) {
            $chunk = str_pad($chunk, 5, '0', STR_PAD_RIGHT);
        }
        $encoded .= $alphabet[bindec($chunk)];
    }

    return $encoded;
}

function base32_decode_string(string $value): string {
    $alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    $clean = strtoupper(preg_replace('/[^A-Z2-7]/', '', $value) ?? '');
    if ($clean === '') {
        return '';
    }

    $bits = '';
    $length = strlen($clean);
    for ($i = 0; $i < $length; $i++) {
        $idx = strpos($alphabet, $clean[$i]);
        if ($idx === false) {
            return '';
        }
        $bits .= str_pad(decbin($idx), 5, '0', STR_PAD_LEFT);
    }

    $binary = '';
    $bitLength = strlen($bits);
    for ($i = 0; $i + 8 <= $bitLength; $i += 8) {
        $binary .= chr(bindec(substr($bits, $i, 8)));
    }

    return $binary;
}

function generate_totp_secret(int $bytes = 20): string {
    return base32_encode_binary(random_bytes($bytes));
}

function generate_totp_code(string $base32Secret, ?int $timeSlice = null): string {
    $secret = base32_decode_string($base32Secret);
    if ($secret === '') {
        return '';
    }

    $slice = $timeSlice ?? (int)floor(time() / 30);
    $counter = pack('N*', 0, $slice);
    $hash = hash_hmac('sha1', $counter, $secret, true);
    $offset = ord(substr($hash, -1)) & 0x0F;

    $binary = ((ord($hash[$offset]) & 0x7F) << 24)
        | ((ord($hash[$offset + 1]) & 0xFF) << 16)
        | ((ord($hash[$offset + 2]) & 0xFF) << 8)
        | (ord($hash[$offset + 3]) & 0xFF);

    $otp = $binary % 1000000;
    return str_pad((string)$otp, 6, '0', STR_PAD_LEFT);
}

function verify_totp_code(string $base32Secret, string $code, int $window = 1): bool {
    $normalized = normalize_otp_code($code);
    if (!preg_match('/^\d{6}$/', $normalized)) {
        return false;
    }

    $slice = (int)floor(time() / 30);
    for ($i = -$window; $i <= $window; $i++) {
        $expected = generate_totp_code($base32Secret, $slice + $i);
        if ($expected !== '' && hash_equals($expected, $normalized)) {
            return true;
        }
    }

    return false;
}

function build_otpauth_uri(string $issuer, string $accountName, string $secret): string {
    $label = rawurlencode($issuer . ':' . $accountName);
    $issuerParam = rawurlencode($issuer);
    return "otpauth://totp/{$label}?secret={$secret}&issuer={$issuerParam}&digits=6&period=30";
}

function normalize_recovery_code(?string $code): string {
    $value = strtoupper((string)($code ?? ''));
    return preg_replace('/[^A-Z0-9]/', '', $value) ?? '';
}

function format_recovery_code(string $normalized): string {
    $clean = normalize_recovery_code($normalized);
    if (strlen($clean) !== 10) {
        return $clean;
    }
    return substr($clean, 0, 5) . '-' . substr($clean, 5, 5);
}

function generate_recovery_code(): string {
    $alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    $max = strlen($alphabet) - 1;
    $raw = '';
    for ($i = 0; $i < 10; $i++) {
        $raw .= $alphabet[random_int(0, $max)];
    }
    return format_recovery_code($raw);
}

function replace_recovery_codes(PDO $pdo, string $userId, int $count = 8): array {
    $pdo->beginTransaction();
    try {
        $del = $pdo->prepare('DELETE FROM `2fa_recovery_codes` WHERE user_id = ?');
        $del->execute([$userId]);

        $insert = $pdo->prepare('INSERT INTO `2fa_recovery_codes` (user_id, code_hash) VALUES (?, ?)');
        $plainCodes = [];
        for ($i = 0; $i < $count; $i++) {
            $plain = generate_recovery_code();
            $plainCodes[] = $plain;
            $normalized = normalize_recovery_code($plain);
            $insert->execute([$userId, hash('sha256', $normalized)]);
        }
        $pdo->commit();
        return $plainCodes;
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw $e;
    }
}

function count_unused_recovery_codes(PDO $pdo, string $userId): int {
    $stmt = $pdo->prepare('SELECT COUNT(*) AS c FROM `2fa_recovery_codes` WHERE user_id = ? AND used_at IS NULL');
    $stmt->execute([$userId]);
    $row = $stmt->fetch();
    return (int)($row['c'] ?? 0);
}

function consume_recovery_code(PDO $pdo, string $userId, string $candidate): bool {
    $normalized = normalize_recovery_code($candidate);
    if (strlen($normalized) !== 10) {
        return false;
    }

    $hash = hash('sha256', $normalized);
    $update = $pdo->prepare('UPDATE `2fa_recovery_codes` SET used_at = NOW() WHERE user_id = ? AND code_hash = ? AND used_at IS NULL LIMIT 1');
    $update->execute([$userId, $hash]);
    return $update->rowCount() > 0;
}
