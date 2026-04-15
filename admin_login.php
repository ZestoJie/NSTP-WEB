<?php
// admin_login.php
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = trim($_POST['password'] ?? '');

    // CHANGE THESE AFTER FIRST LOGIN FOR BETTER SECURITY
    if ($username === 'admin' && $password === 'admin123') {
        $_SESSION['admin_logged_in'] = true;
        header("Location: admin_plants.php");
        exit;
    } else {
        $error = "Incorrect username or password!";
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Admin Login - PlantCare Hub</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f4f4f4;
            text-align: center;
            margin-top: 100px;
        }
        form {
            max-width: 400px;
            margin: 0 auto;
            padding: 40px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.1);
        }
        input {
            width: 100%;
            padding: 14px;
            margin: 10px 0;
            font-size: 16px;
            border: 1px solid #ddd;
            border-radius: 6px;
        }
        button {
            padding: 14px 40px;
            background: #4CAF50;
            color: white;
            border: none;
            font-size: 18px;
            cursor: pointer;
            border-radius: 6px;
        }
        .error { color: red; font-weight: bold; margin: 10px 0; }
    </style>
</head>
<body>

<h1>🔑 Admin Login</h1>

<?php if (isset($error)): ?>
    <p class="error"><?= $error ?></p>
<?php endif; ?>

<form method="POST">
    <input type="text" name="username" placeholder="Username" required><br>
    <input type="password" name="password" placeholder="Password" required><br>
    <button type="submit">Login</button>
</form>

<p><small>Default: <strong>admin</strong> / <strong>admin123</strong><br>Change password after first login!</small></p>

</body>
</html>