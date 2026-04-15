<?php
// toggle_bookmark.php
require_once 'config.php';

if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
    header("Location: plants_list.php");
    exit;
}

$plant_id = (int)$_GET['id'];
$session_id = session_id();

if (empty($session_id)) {
    session_regenerate_id(true);
    $session_id = session_id();
}

// Check if already bookmarked
$stmt = $pdo->prepare("SELECT id FROM bookmarks WHERE plant_id = ? AND session_id = ?");
$stmt->execute([$plant_id, $session_id]);
$exists = $stmt->fetch();

if ($exists) {
    // Remove bookmark
    $stmt = $pdo->prepare("DELETE FROM bookmarks WHERE plant_id = ? AND session_id = ?");
    $stmt->execute([$plant_id, $session_id]);
    $msg = "Bookmark removed";
} else {
    // Add bookmark
    $stmt = $pdo->prepare("INSERT INTO bookmarks (plant_id, session_id) VALUES (?, ?)");
    $stmt->execute([$plant_id, $session_id]);
    $msg = "Plant bookmarked!";
}

header("Location: plants_list.php?msg=" . urlencode($msg));
exit;
?>