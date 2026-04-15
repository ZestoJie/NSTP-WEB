<?php
// my_bookmarks.php
require_once 'config.php';

$session_id = session_id();

$stmt = $pdo->prepare("
    SELECT p.* 
    FROM plants p 
    JOIN bookmarks b ON p.id = b.plant_id 
    WHERE b.session_id = ? 
    ORDER BY p.name ASC
");
$stmt->execute([$session_id]);
$bookmarked_plants = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My Bookmarked Plants</title>
    <style>
        .card { 
            border: 1px solid #ddd; 
            padding: 20px; 
            margin: 15px 0; 
            border-radius: 10px; 
            background: #f9f9f9;
        }
        img { max-width: 100%; border-radius: 8px; margin-bottom: 15px; }
        .remove-btn {
            color: #d32f2f;
            text-decoration: none;
            font-weight: bold;
        }
        .remove-btn:hover { text-decoration: underline; }
    </style>
</head>
<body>

<h1>⭐ My Bookmarked Plants (<?= count($bookmarked_plants) ?>)</h1>
<a href="admin_plants.php">← Back to All Plants</a><br><br>

<?php if (empty($bookmarked_plants)): ?>
    <p>You haven't bookmarked any plants yet. Go to the plant list and click the heart icon ❤️</p>
<?php else: ?>
    <?php foreach ($bookmarked_plants as $plant): ?>
        <div class="card">
            <?php if ($plant['image']): ?>
                <img src="uploads/<?= htmlspecialchars($plant['image']) ?>" alt="<?= htmlspecialchars($plant['name']) ?>">
            <?php endif; ?>
            
            <h2><?= htmlspecialchars($plant['name']) ?> 
                <small>(<?= htmlspecialchars($plant['category']) ?>)</small>
            </h2>
            
            <p><strong>Scientific Name:</strong> <?= htmlspecialchars($plant['scientific_name'] ?? 'N/A') ?></p>
            
            <a href="view_plant.php?id=<?= $plant['id'] ?>">View Full Info Card →</a> &nbsp;&nbsp;|&nbsp;&nbsp;
            <a href="toggle_bookmark.php?id=<?= $plant['id'] ?>" class="remove-btn">🗑 Remove Bookmark</a>
        </div>
    <?php endforeach; ?>
<?php endif; ?>

</body>
</html>