<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
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

// Optional: load single profile by slug
if (!empty($_GET['slug'])) {
    $slug = $db->real_escape_string($_GET['slug']);
    $result = $db->query("SELECT id, namevi, slugvi, properties, parametervi, date_created, date_updated
        FROM table_product WHERE slugvi = '$slug' AND type = 'san-pham' LIMIT 1");

    if ($result && $row = $result->fetch_assoc()) {
        $config = json_decode($row['properties'], true) ?: [];
        $params = json_decode($row['parametervi'], true) ?: [];
        echo json_encode([
            'success' => true,
            'profile' => [
                'id'       => (int)$row['id'],
                'name'     => $row['namevi'],
                'slug'     => $row['slugvi'],
                'shapeId'  => $config['shapeId'] ?? '',
                'material' => $config['material'] ?? 'steel',
                'params'   => $params ?: ($config['params'] ?? []),
                'date'     => $row['date_updated'] ?: $row['date_created']
            ]
        ], JSON_UNESCAPED_UNICODE);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Profile not found']);
    }
    $db->close();
    exit;
}

// List all profiles
$result = $db->query("SELECT id, namevi, slugvi, properties, date_created, date_updated
    FROM table_product WHERE type = 'san-pham' AND `status` = 'hienthi' ORDER BY date_updated DESC LIMIT 50");

$profiles = [];
while ($row = $result->fetch_assoc()) {
    $config = json_decode($row['properties'], true) ?: [];
    $profiles[] = [
        'id'       => (int)$row['id'],
        'name'     => $row['namevi'],
        'slug'     => $row['slugvi'],
        'shapeId'  => $config['shapeId'] ?? '',
        'material' => $config['material'] ?? 'steel',
        'date'     => $row['date_updated'] ?: $row['date_created']
    ];
}

echo json_encode(['success' => true, 'profiles' => $profiles], JSON_UNESCAPED_UNICODE);
$db->close();
