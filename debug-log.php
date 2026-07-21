<?php
// Debug session log sink (same-origin, avoids CORS)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Debug-Session-Id');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); exit; }
$raw = file_get_contents('php://input');
if ($raw) {
    file_put_contents(__DIR__ . '/.cursor/debug-f25e99.log', $raw . "\n", FILE_APPEND | LOCK_EX);
}
http_response_code(204);
