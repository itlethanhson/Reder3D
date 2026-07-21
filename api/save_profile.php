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
    echo json_encode(['error' => 'DB connection failed: ' . $db->connect_error]);
    exit;
}
$db->set_charset('utf8mb4');

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit;
}

$name    = $db->real_escape_string($data['name'] ?? 'CAD Profile');
$shapeId = $db->real_escape_string($data['shapeId'] ?? '');
$material= $db->real_escape_string($data['material'] ?? 'steel');
$params  = $db->real_escape_string(json_encode($data['params'] ?? [], JSON_UNESCAPED_UNICODE));
$slug    = 'cad-' . time() . '-' . substr(md5($name . time()), 0, 6);

// Store full config in properties column as JSON
$config = $db->real_escape_string(json_encode([
    'shapeId'  => $data['shapeId'] ?? '',
    'material' => $data['material'] ?? 'steel',
    'params'   => $data['params'] ?? [],
    'version'  => '1.0'
], JSON_UNESCAPED_UNICODE));

$time = time();

// Check if updating existing (by slug)
if (!empty($data['slug'])) {
    $existingSlug = $db->real_escape_string($data['slug']);
    $sql = "UPDATE table_product SET
        namevi = '$name',
        properties = '$config',
        parametervi = '$params',
        type = 'san-pham',
        date_updated = '$time'
        WHERE slugvi = '$existingSlug' AND type = 'san-pham'";
} else {
    $sql = "INSERT INTO table_product SET
        namevi = '$name',
        slugvi = '$slug',
        slugen = '$slug',
        properties = '$config',
        parametervi = '$params',
        type = 'san-pham',
        numb = 0,
        `status` = 'hienthi',
        date_created = '$time',
        date_updated = '$time',
        `number` = 0";
}

if ($db->query($sql)) {
    $id = $db->insert_id;
    if (empty($data['slug'])) {
        echo json_encode([
            'success' => true,
            'id' => $id,
            'slug' => $slug,
            'message' => 'Đã lưu profile'
        ]);
    } else {
        echo json_encode([
            'success' => true,
            'id' => $id,
            'slug' => $existingSlug,
            'message' => 'Đã cập nhật profile'
        ]);
    }
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Query failed: ' . $db->error]);
}

$db->close();
