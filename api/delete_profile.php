<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$db = new mysqli('localhost', 'root', '', 'cad-viewer');
if ($db->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'DB connection failed']);
    exit;
}
$db->set_charset('utf8mb4');

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
$slug = $db->real_escape_string($data['slug'] ?? '');

if (empty($slug)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing slug']);
    exit;
}

$db->query("UPDATE table_product SET `status` = 'an', deleted_at = NOW() WHERE slugvi = '$slug' AND type = 'san-pham'");

if ($db->affected_rows > 0) {
    echo json_encode(['success' => true, 'message' => 'Đã xóa profile']);
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Profile not found']);
}

$db->close();
