<?php
// admin_plants.php

require_once 'config.php';

$msg = $_GET['msg'] ?? '';
$msg_type = $_GET['type'] ?? 'success';
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Admin - All Plants</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f9f9f9; }
        h1 { color: #2e7d32; }
        .message {
            padding: 15px 20px;
            margin-bottom: 25px;
            border-radius: 8px;
            font-weight: bold;
        }
        .message.success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .message.error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        table { width: 100%; border-collapse: collapse; background: white; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        th, td { padding: 12px; border: 1px solid #ddd; text-align: left; }
        th { background: #4caf50; color: white; }
        img { max-width: 80px; height: auto; border-radius: 4px; }
        .video-icon { color: #e91e63; font-size: 22px; }
        .actions a, .actions button {
            margin-right: 8px;
            padding: 7px 14px;
            border-radius: 5px;
            text-decoration: none;
            color: white;
            border: none;
            cursor: pointer;
        }
        .view-btn   { background: #2196F3; }
        .edit-btn   { background: #FF9800; }
        .bookmark-btn { background: #ff5722; }
        .delete-btn { background: #f44336; }
        .delete-btn:hover { background: #d32f2f; }
    </style>
</head>
<body>

<h1>🌱 Admin - All Plants Management</h1>

<?php if ($msg): ?>
    <div class="message <?= $msg_type === 'error' ? 'error' : 'success' ?>">
        <?= htmlspecialchars($msg) ?>
    </div>
<?php endif; ?>

<p>
    <a href="index_admin.php">← Back to Homepage</a> &nbsp;&nbsp;|&nbsp;&nbsp;
    <a href="plant_form.php">+ Add New Plant</a> &nbsp;&nbsp;|&nbsp;&nbsp;
    <a href="my_bookmarks.php">⭐ My Bookmarks</a>
    <a href="admin_logout.php" style="color:red; float:right;">Logout</a>
</p>

<table>
    <tr>
        <th>Image</th>
        <th>Plant Name</th>
        <th>Category</th>
        <th>Scientific Name</th>
        <th>Season</th>
        <th>Video</th>
        <th>Actions</th>
    </tr>
    <?php 
    $stmt = $pdo->query("SELECT id, category, name, scientific_name, image, video, season FROM plants ORDER BY name ASC");
    $plants = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $session_id = session_id();
    $stmt = $pdo->prepare("SELECT plant_id FROM bookmarks WHERE session_id = ?");
    $stmt->execute([$session_id]);
    $bookmarked_ids = $stmt->fetchAll(PDO::FETCH_COLUMN);

    foreach ($plants as $p): 
        $is_bookmarked = in_array($p['id'], $bookmarked_ids);
    ?>
    <tr>
        <td>
            <img src="<?= !empty($p['image']) ? 'uploads/' . htmlspecialchars($p['image']) : 'uploads/no-image.jpg' ?>" 
                 alt="<?= htmlspecialchars($p['name']) ?>">
        </td>
        <td><strong><?= htmlspecialchars($p['name']) ?></strong></td>
        <td><?= htmlspecialchars($p['category']) ?></td>
        <td><?= htmlspecialchars($p['scientific_name'] ?? '—') ?></td>
        <td><strong><?= htmlspecialchars($p['season'] ?? 'Not set') ?></strong></td>
        <td>
            <?php if (!empty($p['video'])): ?>
                <span class="video-icon" title="Has tutorial video">📹</span>
            <?php else: ?>
                —
            <?php endif; ?>
        </td>
        <td class="actions">
            <a href="view_plant_admin.php?id=<?= $p['id'] ?>" class="view-btn">View</a>
            <a href="plant_form.php?id=<?= $p['id'] ?>" class="edit-btn">Edit</a>
            <a href="toggle_bookmark.php?id=<?= $p['id'] ?>" class="bookmark-btn">
                <?= $is_bookmarked ? '★ Remove' : '☆ Bookmark' ?>
            </a>
            <button onclick="confirmDelete(<?= $p['id'] ?>, '<?= addslashes(htmlspecialchars($p['name'])) ?>')" class="delete-btn">Delete</button>
        </td>
    </tr>
    <?php endforeach; ?>
</table>

<?php if (empty($plants)): ?>
    <p style="text-align:center; margin-top:40px; font-size:18px;">
        No plants added yet. <a href="plant_form.php">Add your first plant</a>
    </p>
<?php endif; ?>

<script>
function confirmDelete(id, name) {
    if (confirm('Are you sure you want to permanently delete "' + name + '"?\n\nAll images and videos will be deleted.\nThis action cannot be undone.')) {
        window.location.href = 'delete_plant.php?id=' + id;
    }
}
</script>

</body>
</html>