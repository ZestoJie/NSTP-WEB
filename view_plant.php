<?php
// view_plant.php
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
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($plant['name']) ?> - Plant Info Card</title>
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Montserrat:wght@300;400;500&family=Product+Sans:wght@400;500;600&display=swap" rel="stylesheet">

    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: "Montserrat", sans-serif; 
            background: url("background.png") center / cover no-repeat fixed;
            min-height: 100vh;
        }
        h1, h2, h3 { font-family: "Archivo Black", sans-serif; }
        strong, .app-name { font-family: "Product Sans", sans-serif; }

        /* HEADER */
        .header {
            background: rgba(84, 107, 65, 0.92);
            color: white;
            padding: 14px 30px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: relative;
            z-index: 100;
        }
        .logo-area { display: flex; align-items: center; gap: 12px; }
        .logo-placeholder {
            width: 36px;
            height: 36px;
            background: #dce8c8;
            border-radius: 50%;
        }
        .nav-links span {
            margin-left: 25px;
            font-size: 15px;
            cursor: pointer;
        }
        .header-search input {
            width: 280px;
            padding: 9px 16px;
            border-radius: 25px;
            border: none;
            outline: none;
            font-size: 15px;
        }

        /* MAIN CONTENT */
        .content {
            display: flex;
            justify-content: center;
            padding: 40px 20px;
            min-height: calc(100vh - 70px);
        }

        .info-card {
            position: relative;
            width: 100%;
            max-width: 1100px;
            display: flex;
            gap: 45px;
            padding: 45px 50px;
            border-radius: 28px;
            background: rgba(255, 255, 255, 0.92);
            backdrop-filter: blur(8px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.15), 0 20px 50px rgba(0,0,0,0.1);
        }

        /* Text Section */
        .text-section {
            flex: 2;
            padding-top: 20px;
        }
        .text-section h2 {
            color: #4d6f3c;
            margin-bottom: 28px;
            font-size: 26px;
        }
        .text-section p {
            margin-bottom: 18px;
            line-height: 1.65;
            color: #444;
            font-size: 15.5px;
        }

        /* Image Section */
        .image-section {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding-top: 30px;
        }
        .fruit-placeholder {
            width: 100%;
            max-width: 320px;
            height: 310px;
            background: #f0f0f0;
            border-radius: 22px;
            overflow: hidden;
            margin-bottom: 18px;
            box-shadow: 0 6px 15px rgba(0,0,0,0.1);
        }
        .fruit-placeholder img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .fruit-name {
            font-size: 24px;
            font-weight: 600;
            color: #4d6f3c;
            text-align: center;
        }

        /* Buttons */
        .animated-button {
            position: absolute;
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 11px 24px;
            font-size: 14px;
            background: inherit;
            border-radius: 50px;
            font-weight: 600;
            color: rgba(84, 107, 65, 0.95);
            box-shadow: 0 0 0 2px rgba(84, 107, 65, 0.95);
            cursor: pointer;
            border: none;
            z-index: 10;
        }
        .animated-button:hover {
            background: rgba(84, 107, 65, 0.95);
            color: white;
        }
        .btn-left { top: 25px; left: 25px; }
        .btn-right { top: 25px; right: 25px; }

        /* Bookmark */
        .bookmark-btn {
            font-size: 34px;
            text-decoration: none;
            position: absolute;
            top: 28px;
            right: 140px;
        }

        /* Video Modal */
        .modal {
            display: none;
            position: fixed;
            z-index: 2000;
            left: 0; top: 0;
            width: 100%; height: 100%;
            background: rgba(0,0,0,0.85);
            align-items: center;
            justify-content: center;
        }
        .modal-content {
            background: white;
            padding: 25px;
            border-radius: 16px;
            width: 90%;
            max-width: 850px;
            position: relative;
        }
        .close {
            position: absolute;
            top: 12px;
            right: 20px;
            font-size: 36px;
            cursor: pointer;
            color: #555;
        }
    </style>
</head>
<body>

<div class="header">
    <div class="logo-area">
        <div class="logo-placeholder"></div>
        <span class="app-name">PlantCare Hub</span>
    </div>
    <div class="header-search">
        <input type="text" placeholder="Search plants..." id="search">
    </div>
    <div class="nav-links">
        <span onclick="window.location.href='index.php'">Home</span>
        <span onclick="window.location.href='my_bookmarks.php'">Bookmarks</span>
    </div>
</div>

<main class="content">
    <section class="info-card">

        <!-- Back Button -->
        <button class="animated-button btn-left" onclick="window.location.href='index.php'">
            <svg viewBox="0 0 24 24" width="18" height="18"><path d="M7.8284 12L13.1924 17.3641L11.7782 18.7783L4 11.9999L11.7782 5.22168L13.1924 6.63589L7.8284 12H20V14H7.8284Z"/></svg>
            Back to Gallery
        </button>

        <!-- Video Button -->
        <button class="animated-button btn-right" onclick="openVideoModal()">
            View Demonstration Video
            <svg viewBox="0 0 24 24" width="18" height="18"><path d="M16.1716 12H4V10H16.1716L12.8076 6.63589L14.2218 5.22168L20 12L14.2218 18.7783L12.8076 17.3641L16.1716 14Z"/></svg>
        </button>

        <!-- Bookmark -->
        <a href="toggle_bookmark.php?id=<?= $plant['id'] ?>" class="bookmark-btn" 
           title="<?= $is_bookmarked ? 'Remove Bookmark' : 'Bookmark this plant' ?>">
            <?= $is_bookmarked ? '❤️' : '♡' ?>
        </a>

        <!-- Text Section -->
        <div class="text-section">
            <h2>STEP BY STEP GUIDE: Planting <?= htmlspecialchars($plant['name']) ?></h2>
            
            <p><strong>Needs:</strong><br><?= nl2br(htmlspecialchars($plant['needs'] ?? 'Not specified')) ?></p>
            <p><strong>Soil:</strong><br><?= nl2br(htmlspecialchars($plant['soil'] ?? 'Not specified')) ?></p>
            <p><strong>Season:</strong><br><?= htmlspecialchars($plant['season'] ?? 'Not specified') ?></p>
            
            <p><strong>What to do (Preparation):</strong><br><?= nl2br(htmlspecialchars($plant['what_to_do'] ?? 'Not specified')) ?></p>
            <p><strong>How to (Step by Step):</strong><br><?= nl2br(htmlspecialchars($plant['how_to'] ?? 'Not specified')) ?></p>
        </div>

        <!-- Image Section -->
        <div class="image-section">
            <div class="fruit-placeholder">
                <img src="<?= !empty($plant['image']) ? 'uploads/' . htmlspecialchars($plant['image']) : 'uploads/no-image.jpg' ?>" 
                     alt="<?= htmlspecialchars($plant['name']) ?>">
            </div>
            <div class="fruit-name"><?= htmlspecialchars($plant['name']) ?></div>
        </div>

    </section>
</main>

<!-- Video Modal -->
<div id="videoModal" class="modal">
    <div class="modal-content">
        <span class="close" onclick="closeVideoModal()">&times;</span>
        <h2 style="text-align:center; margin-bottom:20px; color:#4d6f3c;">Demonstration Video</h2>
        
        <?php if (!empty($plant['video'])): ?>
            <video width="100%" controls controlsList="nodownload">
                <source src="uploads/<?= htmlspecialchars($plant['video']) ?>" type="video/mp4">
                Your browser does not support the video tag.
            </video>
        <?php else: ?>
            <p style="text-align:center; color:#666; padding:40px;">No video uploaded for this plant yet.</p>
        <?php endif; ?>
    </div>
</div>

<script>
// Open Modal
function openVideoModal() {
    document.getElementById('videoModal').style.display = 'flex';
}

// Close Modal
function closeVideoModal() {
    document.getElementById('videoModal').style.display = 'none';
}

// Close when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('videoModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}
</script>

</body>
</html>