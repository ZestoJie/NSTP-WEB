 <?php
// search_suggestions.php
require_once 'config.php';

if (!isset($_GET['q']) || empty($_GET['q'])) {
    echo json_encode([]);
    exit;
}

$q = '%' . $_GET['q'] . '%';

$stmt = $pdo->prepare("
    SELECT id, name, category 
    FROM plants 
    WHERE name LIKE ? OR scientific_name LIKE ? 
    ORDER BY name ASC 
    LIMIT 10
");
$stmt->execute([$q, $q]);

$results = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($results);
?>
