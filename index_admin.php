<?php
// index_admin.php - Admin Homepage
session_start();
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header("Location: admin_login.php");
    exit;
}

require_once 'config.php';

// Fetch all plants
$stmt = $pdo->query("SELECT id, name, category, image FROM plants ORDER BY name ASC");
$plants = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Plant Nursery - Admin</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; background: #f8f9fa; }

        header {
            background: #2e7d32;
            color: white;
            padding: 15px 30px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .logo { font-size: 28px; font-weight: bold; }
        .nav-buttons a {
            color: white;
            text-decoration: none;
            margin-left: 25px;
            padding: 10px 18px;
            border-radius: 6px;
        }
        .nav-buttons a:hover { background: rgba(255,255,255,0.25); }

        .search-container {
            text-align: center;
            padding: 40px 20px;
            background: white;
            box-shadow: 0 3px 10px rgba(0,0,0,0.1);
        }
        #searchInput {
            width: 60%;
            max-width: 650px;
            padding: 15px 25px;
            font-size: 18px;
            border: 2px solid #4caf50;
            border-radius: 50px;
            outline: none;
        }

        .autocomplete-list {
            width: 60%;
            max-width: 650px;
            margin: 8px auto 0;
            background: white;
            border: 1px solid #ddd;
            border-radius: 10px;
            max-height: 320px;
            overflow-y: auto;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            display: none;
        }
        .autocomplete-item {
            padding: 14px 20px;
            cursor: pointer;
        }
        .autocomplete-item:hover { background: #e8f5e9; }

        .categories { padding: 50px 30px; text-align: center; }
        .category-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
            max-width: 1100px;
            margin: 0 auto;
        }
        .category-box {
            background: white;
            border-radius: 15px;
            padding: 40px 20px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.1);
            position: relative;
            min-height: 220px;
        }
        .category-box:hover { transform: translateY(-10px); }
        .category-box h2 { font-size: 28px; margin-bottom: 20px; color: #2e7d32; }

        .season-options {
            display: none;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255,255,255,0.95);
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            width: 85%;
        }
        .category-box:hover .season-options { display: block; }
        .season-btn {
            display: block;
            width: 100%;
            padding: 14px;
            margin: 10px 0;
            background: #4caf50;
            color: white;
            text-decoration: none;
            border-radius: 8px;
        }

        .results { padding: 40px 30px; background: #f1f8e9; }
        .results-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
            gap: 25px;
            max-width: 1200px;
            margin: 0 auto;
        }
        .plant-card {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            transition: 0.3s;
            text-align: center;
        }
        .plant-card:hover { transform: translateY(-8px); }
        .plant-card img {
            width: 100%;
            height: 200px;
            object-fit: cover;
        }
        .plant-card h3 { padding: 15px 10px 20px; color: #2e7d32; font-size: 19px; }

        .add-btn {
            display: inline-block;
            background: #4CAF50;
            color: white;
            padding: 14px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-size: 18px;
            margin: 20px 0;
        }
        .add-btn:hover {
            background: #388e3c;
        }
    </style>
</head>
<body>

<header>
    <div class="logo">🌱 PlantCare Hub (Admin)</div>
    <div class="nav-buttons">
        <a href="admin_plants.php">Manage Plants</a>
        <a href="admin_logout.php" style="color:#ffcccc;">Logout</a>
    </div>
</header>

<!-- Add Plant Button -->
<p style="text-align: center;">
    <a href="plant_form.php" class="add-btn">➕ Add New Plant</a>
</p>

<div class="search-container">
    <input type="text" id="searchInput" placeholder="Search plants..." autocomplete="off">
    <div id="autocompleteList" class="autocomplete-list"></div>
</div>

<div class="categories">
    <h1 style="margin-bottom: 40px; color: #2e7d32;">Browse by Category & Season</h1>
    <div class="category-grid">
        <div class="category-box">
            <h2>🌿 Herbs</h2>
            <div class="season-options">
                <a href="?category=HERBS&season=Wet" class="season-btn">🌧 Wet Season</a>
                <a href="?category=HERBS&season=Dry" class="season-btn">☀️ Dry Season</a>
            </div>
        </div>
        <div class="category-box">
            <h2>🍎 Fruits</h2>
            <div class="season-options">
                <a href="?category=FRUIT&season=Wet" class="season-btn">🌧 Wet Season</a>
                <a href="?category=FRUIT&season=Dry" class="season-btn">☀️ Dry Season</a>
            </div>
        </div>
        <div class="category-box">
            <h2>🥕 Vegetables</h2>
            <div class="season-options">
                <a href="?category=VEGETABLES&season=Wet" class="season-btn">🌧 Wet Season</a>
                <a href="?category=VEGETABLES&season=Dry" class="season-btn">☀️ Dry Season</a>
            </div>
        </div>
    </div>
</div>

<div class="results">
    <?php if (isset($_GET['category']) && isset($_GET['season'])): ?>
        <?php
        $category = $_GET['category'];
        $season = $_GET['season'];
        $stmt = $pdo->prepare("SELECT id, name, image FROM plants WHERE category = ? AND (season = ? OR season = 'Both') ORDER BY name");
        $stmt->execute([$category, $season]);
        $filteredPlants = $stmt->fetchAll(PDO::FETCH_ASSOC);
        ?>
        <h2 style="text-align:center; margin-bottom:30px;"><?= htmlspecialchars($category) ?> — <?= htmlspecialchars($season) ?> Season</h2>
        <div class="results-grid">
            <?php foreach ($filteredPlants as $p): ?>
                <a href="view_plant.php?id=<?= $p['id'] ?>" style="text-decoration:none; color:inherit;">
                    <div class="plant-card">
                        <img src="<?= !empty($p['image']) ? 'uploads/' . htmlspecialchars($p['image']) : 'uploads/no-image.jpg' ?>" 
                             alt="<?= htmlspecialchars($p['name']) ?>">
                        <h3><?= htmlspecialchars($p['name']) ?></h3>
                    </div>
                </a>
            <?php endforeach; ?>
        </div>
    <?php else: ?>
        <h2 style="text-align:center; margin-bottom:30px;">All Plants</h2>
        <div class="results-grid">
            <?php foreach ($plants as $p): ?>
                <a href="view_plant.php?id=<?= $p['id'] ?>" style="text-decoration:none; color:inherit;">
                    <div class="plant-card">
                        <img src="<?= !empty($p['image']) ? 'uploads/' . htmlspecialchars($p['image']) : 'uploads/no-image.jpg' ?>" 
                             alt="<?= htmlspecialchars($p['name']) ?>">
                        <h3><?= htmlspecialchars($p['name']) ?></h3>
                    </div>
                </a>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>
</div>

<script>
// Autocomplete
const searchInput = document.getElementById('searchInput');
const autocompleteList = document.getElementById('autocompleteList');

searchInput.addEventListener('input', function() {
    const query = this.value.trim();
    if (query.length < 2) {
        autocompleteList.style.display = 'none';
        return;
    }
    fetch(`search_suggestions.php?q=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => {
            autocompleteList.innerHTML = '';
            data.forEach(plant => {
                const div = document.createElement('div');
                div.className = 'autocomplete-item';
                div.innerHTML = `<strong>${plant.name}</strong> <small>(${plant.category})</small>`;
                div.onclick = () => window.location.href = `view_plant.php?id=${plant.id}`;
                autocompleteList.appendChild(div);
            });
            autocompleteList.style.display = 'block';
        });
});

document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target)) autocompleteList.style.display = 'none';
});
</script>

</body>
</html>