<?php

require_once 'config.php';

$id = $_GET['id'] ?? 0;

$stmt = $pdo->prepare("SELECT * FROM plants WHERE id = ?");
$stmt->execute([$id]);
$plant = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$plant) {
    die("Plant not found.");
}

// Bookmark check
$session_id = session_id();
$stmt = $pdo->prepare("SELECT id FROM bookmarks WHERE plant_id = ? AND session_id = ?");
$stmt->execute([$id, $session_id]);
$is_bookmarked = $stmt->fetch() ? true : false;
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title><?= htmlspecialchars($plant['name']) ?> - Plant Info Card (Admin)</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            max-width: 950px; 
            margin: 40px auto; 
            line-height: 1.6; 
            padding: 20px;
        }
        img, video { 
            max-width: 100%; 
            border-radius: 12px; 
            margin: 15px 0;
        }
        .section { 
            margin: 30px 0; 
            padding: 25px; 
            background: #f9f9f9; 
            border-radius: 12px; 
        }
        h2 { 
            color: #2e7d32; 
            margin-bottom: 15px; 
        }
        .bookmark-btn { 
            font-size: 32px; 
            text-decoration: none; 
            transition: 0.3s;
        }
        .bookmark-btn:hover { 
            transform: scale(1.3); 
        }
        .header { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            flex-wrap: wrap;
            gap: 15px;
            margin-bottom: 20px;
        }
        .video-container {
            background: #fff;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .admin-notice {
            background: #fff3cd;
            color: #856404;
            padding: 10px 15px;
            border-radius: 6px;
            font-size: 14px;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>

<div class="admin-notice">
    👷 You are viewing this as Administrator
</div>

<div class="header">
    <h1>🌱 <?= htmlspecialchars($plant['name']) ?></h1>
    <a href="toggle_bookmark.php?id=<?= $plant['id'] ?>" class="bookmark-btn" 
       title="<?= $is_bookmarked ? 'Remove Bookmark' : 'Bookmark this plant' ?>">
        <?= $is_bookmarked ? '❤️' : '♡' ?>
    </a>
</div>

<!-- Image with Dummy Fallback -->
<div style="text-align:center; margin:25px 0;">
    <img src="<?= !empty($plant['image']) ? 'uploads/' . htmlspecialchars($plant['image']) : 'uploads/no-image.jpg' ?>" 
         alt="<?= htmlspecialchars($plant['name']) ?>">
</div>

<p><strong>Category:</strong> <?= htmlspecialchars($plant['category']) ?></p>

<div class="section">
    <h2>Plant Information</h2>
    <p><strong>Scientific Name:</strong> <?= htmlspecialchars($plant['scientific_name'] ?? 'N/A') ?></p>
    <p><strong>Lifespan:</strong> <?= htmlspecialchars($plant['lifespan'] ?? 'N/A') ?></p>
    <p><strong>Origin:</strong> <?= htmlspecialchars($plant['origin'] ?? 'N/A') ?></p>
    <p><strong>Habitat:</strong> <?= nl2br(htmlspecialchars($plant['habitat'] ?? 'N/A')) ?></p>
    <p><strong>Sunlight:</strong> <?= htmlspecialchars($plant['sunlight'] ?? 'N/A') ?></p>
    <p><strong>Water:</strong> <?= htmlspecialchars($plant['water'] ?? 'N/A') ?></p>
    <p><strong>Soil:</strong> <?= htmlspecialchars($plant['soil'] ?? 'N/A') ?></p>
    <p><strong>Size:</strong> <?= htmlspecialchars($plant['size_height'] ?? 'N/A') ?> × <?= htmlspecialchars($plant['size_width'] ?? 'N/A') ?></p>
    <p><strong>Bloom:</strong> <?= htmlspecialchars($plant['bloom_season'] ?? 'N/A') ?> (<?= htmlspecialchars($plant['bloom_color'] ?? 'N/A') ?>)</p>
    <p><strong>Uses:</strong> <?= nl2br(htmlspecialchars($plant['uses'] ?? 'N/A')) ?></p>
    <p><strong>Notes:</strong> <?= nl2br(htmlspecialchars($plant['notes'] ?? 'N/A')) ?></p>
</div>

<!-- Video Section - Properly Styled -->
<?php if (!empty($plant['video'])): ?>
<div class="section">
    <h2>📹 Tutorial Video</h2>
    <div class="video-container">
        <video width="100%" controls controlsList="nodownload">
            <source src="uploads/<?= htmlspecialchars($plant['video']) ?>" type="video/mp4">
            Your browser does not support the video tag.
        </video>
    </div>
</div>
<?php endif; ?>

<div class="section">
    <h2>🌱 Step-by-Step Planting Guide</h2>
    <p><strong>Needs:</strong> <?= nl2br(htmlspecialchars($plant['needs'] ?? 'N/A')) ?></p>
    <p><strong>Preparation:</strong> <?= nl2br(htmlspecialchars($plant['what_to_do'] ?? 'N/A')) ?></p>
    <p><strong>How to:</strong> <?= nl2br(htmlspecialchars($plant['how_to'] ?? 'N/A')) ?></p>
    <p><strong>When:</strong> <?= nl2br(htmlspecialchars($plant['when_plant'] ?? 'N/A')) ?></p>
    <p><strong>Where:</strong> <?= nl2br(htmlspecialchars($plant['where_plant'] ?? 'N/A')) ?></p>
</div>

<br>
<a href="admin_plants.php">← Back to Admin Plants</a> | 
<a href="index_admin.php">🏠 Back to Admin Homepage</a> | 
<a href="my_bookmarks.php">⭐ My Bookmarks</a>

</body>
</html>