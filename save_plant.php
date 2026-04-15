<?php
// save_plant.php - Fixed & Complete Version
session_start();

// Security: Redirect to login if not logged in as admin
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header("Location: admin_login.php");
    exit;
}

require_once 'config.php';

$id = $_POST['id'] ?? null;
$uploadDir = 'uploads/';

// ==================== IMAGE UPLOAD ====================
$imageName = null;
if (!empty($_FILES['image']['name'])) {
    $file = $_FILES['image'];
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $allowed = ['jpg', 'jpeg', 'png', 'webp'];

    if (in_array($ext, $allowed) && $file['size'] < 5000000) { // 5MB
        $imageName = time() . '_img_' . preg_replace("/[^a-zA-Z0-9._-]/", "", $file['name']);
        if (!move_uploaded_file($file['tmp_name'], $uploadDir . $imageName)) {
            $imageName = null; // upload failed
        }
    }
}

// ==================== VIDEO UPLOAD + DELETE LOGIC ====================
$videoName = null;
$deleteVideo = isset($_POST['delete_video']) && $_POST['delete_video'] == 1;

if ($deleteVideo && $id) {
    // Delete old video file
    $stmt = $pdo->prepare("SELECT video FROM plants WHERE id = ?");
    $stmt->execute([$id]);
    $oldVideo = $stmt->fetchColumn();
    if ($oldVideo && file_exists($uploadDir . $oldVideo)) {
        unlink($uploadDir . $oldVideo);
    }
    $videoName = null; // remove video from record
} 
elseif (!empty($_FILES['video']['name'])) {
    $file = $_FILES['video'];
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $allowed = ['mp4', 'webm', 'ogg', 'mov'];

    if (in_array($ext, $allowed) && $file['size'] < 1000000000) { // 1GB
        $videoName = time() . '_vid_' . preg_replace("/[^a-zA-Z0-9._-]/", "", $file['name']);
        if (!move_uploaded_file($file['tmp_name'], $uploadDir . $videoName)) {
            $videoName = null;
        }
    } else {
        die("Error: Video file is too large. Maximum allowed size is 1GB.");
    }
}

// ==================== PREPARE DATA ====================
$data = [
    'category'       => $_POST['category'] ?? null,
    'name'           => $_POST['name'] ?? null,
    'scientific_name'=> $_POST['scientific_name'] ?? null,
    'lifespan'       => $_POST['lifespan'] ?? null,
    'season'         => $_POST['season'] ?? null,
    'origin'         => $_POST['origin'] ?? null,
    'habitat'        => $_POST['habitat'] ?? null,
    'sunlight'       => $_POST['sunlight'] ?? null,
    'water'          => $_POST['water'] ?? null,
    'soil'           => $_POST['soil'] ?? null,
    'size_height'    => $_POST['size_height'] ?? null,
    'size_width'     => $_POST['size_width'] ?? null,
    'bloom_season'   => $_POST['bloom_season'] ?? null,
    'bloom_color'    => $_POST['bloom_color'] ?? null,
    'uses'           => $_POST['uses'] ?? null,
    'notes'          => $_POST['notes'] ?? null,
    'needs'          => $_POST['needs'] ?? null,
    'what_to_do'     => $_POST['what_to_do'] ?? null,
    'how_to'         => $_POST['how_to'] ?? null,
    'when_plant'     => $_POST['when_plant'] ?? null,
    'where_plant'    => $_POST['where_plant'] ?? null,
];

if ($id) {
    // ==================== UPDATE ====================
    $sql = "UPDATE plants SET 
                category = :category,
                name = :name,
                scientific_name = :scientific_name,
                lifespan = :lifespan,
                season = :season,
                origin = :origin,
                habitat = :habitat,
                sunlight = :sunlight,
                water = :water,
                soil = :soil,
                size_height = :size_height,
                size_width = :size_width,
                bloom_season = :bloom_season,
                bloom_color = :bloom_color,
                uses = :uses,
                notes = :notes,
                needs = :needs,
                what_to_do = :what_to_do,
                how_to = :how_to,
                when_plant = :when_plant,
                where_plant = :where_plant";

    if ($imageName) {
        $sql .= ", image = :image";
        $data['image'] = $imageName;
    }
    if ($videoName !== null || $deleteVideo) {
        $sql .= ", video = :video";
        $data['video'] = $videoName;
    }

    $sql .= ", updated_at = NOW() WHERE id = :id";
    $data['id'] = $id;

} else {
    // ==================== INSERT ====================
    $extraFields = "";
    $extraValues = "";
    if ($imageName) { 
        $extraFields .= ", image"; 
        $extraValues .= ", :image"; 
    }
    if ($videoName) { 
        $extraFields .= ", video"; 
        $extraValues .= ", :video"; 
    }

    $sql = "INSERT INTO plants 
            (category, name, scientific_name, lifespan, season, origin, habitat, sunlight, water, 
             soil, size_height, size_width, bloom_season, bloom_color, uses, notes, needs, 
             what_to_do, how_to, when_plant, where_plant" . $extraFields . ")
            VALUES 
            (:category, :name, :scientific_name, :lifespan, :season, :origin, :habitat, :sunlight, :water, 
             :soil, :size_height, :size_width, :bloom_season, :bloom_color, :uses, :notes, :needs, 
             :what_to_do, :how_to, :when_plant, :where_plant" . $extraValues . ")";

    if ($imageName) $data['image'] = $imageName;
    if ($videoName) $data['video'] = $videoName;
}

$stmt = $pdo->prepare($sql);
$stmt->execute($data);

$action = $id ? 'updated' : 'added';
header("Location: admin_plants.php?msg=Plant successfully $action&type=success");
exit;
?>