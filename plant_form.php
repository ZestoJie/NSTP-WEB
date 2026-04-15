<?php


// plant_form.php
require_once 'config.php';

$id = $_GET['id'] ?? null;
$plant = null;

if ($id) {
    $stmt = $pdo->prepare("SELECT * FROM plants WHERE id = ?");
    $stmt->execute([$id]);
    $plant = $stmt->fetch(PDO::FETCH_ASSOC);
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title><?= $plant ? 'Edit' : 'Add New' ?> Plant</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 1000px; margin: 40px auto; }
        label { display: block; margin: 12px 0 5px; font-weight: bold; }
        input[type="text"], select, textarea { width: 100%; padding: 10px; box-sizing: border-box; }
        .section { margin: 30px 0; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background: #f9f9f9; }
        button { padding: 12px 25px; background: #4CAF50; color: white; border: none; font-size: 16px; cursor: pointer; }
        .current-image, .current-video { max-width: 300px; margin: 10px 0; border: 1px solid #ccc; }
        .upload-limit {
            font-size: 14px;
            color: #666;
            margin-top: -8px;
            margin-bottom: 15px;
        }
        .delete-checkbox {
            color: #d32f2f;
            font-weight: bold;
        }
    </style>
</head>
<body>

<h1>🌱 <?= $plant ? 'Edit' : 'Add New' ?> Plant Info Card</h1>

<form action="save_plant.php" method="POST" enctype="multipart/form-data">
    <input type="hidden" name="id" value="<?= htmlspecialchars($plant['id'] ?? '') ?>">

    <!-- CATEGORY -->
    <div class="section">
        <h2>🌱 CATEGORY PER PLANT</h2>
        <label>Category:</label>
        <select name="category" required>
            <option value="">-- Select --</option>
            <option value="HERBS" <?= ($plant['category'] ?? '') == 'HERBS' ? 'selected' : '' ?>>HERBS</option>
            <option value="FRUIT" <?= ($plant['category'] ?? '') == 'FRUIT' ? 'selected' : '' ?>>FRUIT</option>
            <option value="VEGETABLES" <?= ($plant['category'] ?? '') == 'VEGETABLES' ? 'selected' : '' ?>>VEGETABLES</option>
        </select>
    </div>

    <!-- PLANT INFO CARD -->
    <div class="section">
        <h2>🌱 Plant Info Card</h2>
        
        <label>Common Name *</label>
        <input type="text" name="name" value="<?= htmlspecialchars($plant['name'] ?? '') ?>" required>

        <label>Scientific Name</label>
        <input type="text" name="scientific_name" value="<?= htmlspecialchars($plant['scientific_name'] ?? '') ?>">

        <label>Lifespan</label>
        <select name="lifespan">
            <option value="">-- Select --</option>
            <option value="Annual" <?= ($plant['lifespan'] ?? '') == 'Annual' ? 'selected' : '' ?>>Annual</option>
            <option value="Biennial" <?= ($plant['lifespan'] ?? '') == 'Biennial' ? 'selected' : '' ?>>Biennial</option>
            <option value="Perennial" <?= ($plant['lifespan'] ?? '') == 'Perennial' ? 'selected' : '' ?>>Perennial</option>
        </select>

        <label>Best Planting Season</label>
        <select name="season">
            <option value="">-- Select Season --</option>
            <option value="Wet"  <?= ($plant['season'] ?? '') == 'Wet' ? 'selected' : '' ?>>Wet Season</option>
            <option value="Dry"  <?= ($plant['season'] ?? '') == 'Dry' ? 'selected' : '' ?>>Dry Season</option>
            <option value="Both" <?= ($plant['season'] ?? '') == 'Both' ? 'selected' : '' ?>>Both Seasons</option>
        </select>

        <label>Origin</label>
        <input type="text" name="origin" value="<?= htmlspecialchars($plant['origin'] ?? '') ?>">

        <label>Habitat</label>
        <textarea name="habitat" rows="3"><?= htmlspecialchars($plant['habitat'] ?? '') ?></textarea>

        <label>Sunlight</label>
        <input type="text" name="sunlight" value="<?= htmlspecialchars($plant['sunlight'] ?? '') ?>">

        <label>Water</label>
        <input type="text" name="water" value="<?= htmlspecialchars($plant['water'] ?? '') ?>">

        <label>Soil</label>
        <input type="text" name="soil" value="<?= htmlspecialchars($plant['soil'] ?? '') ?>">

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div><label>Height</label><input type="text" name="size_height" value="<?= htmlspecialchars($plant['size_height'] ?? '') ?>" placeholder="e.g. 1-2 meters"></div>
            <div><label>Width</label><input type="text" name="size_width" value="<?= htmlspecialchars($plant['size_width'] ?? '') ?>" placeholder="e.g. 0.5-1 meter"></div>
        </div>

        <label>Bloom Season</label>
        <input type="text" name="bloom_season" value="<?= htmlspecialchars($plant['bloom_season'] ?? '') ?>">

        <label>Bloom Color</label>
        <input type="text" name="bloom_color" value="<?= htmlspecialchars($plant['bloom_color'] ?? '') ?>">

        <label>Uses</label>
        <textarea name="uses" rows="4"><?= htmlspecialchars($plant['uses'] ?? '') ?></textarea>

        <label>Notes (Toxicity / Fun fact)</label>
        <textarea name="notes" rows="4"><?= htmlspecialchars($plant['notes'] ?? '') ?></textarea>

        <!-- Image Upload -->
        <label>Plant Image</label>
        <div class="upload-limit">Maximum size: 5 MB (JPG, PNG, WebP)</div>
        <?php if (!empty($plant['image'])): ?>
            <p>Current Image:</p>
            <img src="uploads/<?= htmlspecialchars($plant['image']) ?>" class="current-image" alt="Current Image">
        <?php endif; ?>
        <input type="file" name="image" accept="image/*">

        <!-- Video Upload -->
        <label>Tutorial Video (optional)</label>
        <div class="upload-limit">Maximum size: <strong>1 GB</strong> (MP4, WebM, OGG, MOV)</div>
        
        <?php if (!empty($plant['video'])): ?>
            <p>Current Video:</p>
            <video width="300" controls>
                <source src="uploads/<?= htmlspecialchars($plant['video']) ?>" type="video/mp4">
                Your browser does not support the video tag.
            </video>
            <br>
            <label class="delete-checkbox">
                <input type="checkbox" name="delete_video" value="1"> 
                Delete current video
            </label>
        <?php endif; ?>
        
        <input type="file" name="video" accept="video/mp4,video/webm,video/ogg,video/mov">
    </div>

    <!-- STEP BY STEP GUIDE -->
    <div class="section">
        <h2>🌱 STEP BY STEP GUIDE</h2>
        
        <label>Needs</label>
        <textarea name="needs" rows="4"><?= htmlspecialchars($plant['needs'] ?? '') ?></textarea>

        <label>What to do (prep ng mga gamit)</label>
        <textarea name="what_to_do" rows="4"><?= htmlspecialchars($plant['what_to_do'] ?? '') ?></textarea>

        <label>How to (step by step)</label>
        <textarea name="how_to" rows="6"><?= htmlspecialchars($plant['how_to'] ?? '') ?></textarea>

        <label>When (right weather)</label>
        <textarea name="when_plant" rows="3"><?= htmlspecialchars($plant['when_plant'] ?? '') ?></textarea>

        <label>Where (where to plant)</label>
        <textarea name="where_plant" rows="3"><?= htmlspecialchars($plant['where_plant'] ?? '') ?></textarea>
    </div>

    <button type="submit">Save Plant Information</button>
</form>

</body>
</html>