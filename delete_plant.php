<?php
session_start();

require_once 'config.php';

if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
    header("Location: admin_plants.php");
    exit;
}

$id = (int)$_GET['id'];

// Get file names before deleting record
$stmt = $pdo->prepare("SELECT image, video FROM plants WHERE id = ?");
$stmt->execute([$id]);
$files = $stmt->fetch(PDO::FETCH_ASSOC);

if ($files) {
    // Delete image file if exists
    if (!empty($files['image']) && file_exists('uploads/' . $files['image'])) {
        unlink('uploads/' . $files['image']);
    }
    // Delete video file if exists
    if (!empty($files['video']) && file_exists('uploads/' . $files['video'])) {
        unlink('uploads/' . $files['video']);
    }

    // Delete the plant record
    $stmt = $pdo->prepare("DELETE FROM plants WHERE id = ?");
    $stmt->execute([$id]);

    header("Location: admin_plants.php?msg=Plant deleted successfully");
    exit;
}

header("Location: admin_plants.php");
exit;
?>