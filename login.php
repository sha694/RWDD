<?php
session_start();

// ====== DATABASE CONNECTION ======
$host = "localhost";
$dbname = "proboost";
$username = "root";  // change if needed
$password = "";      // add your DB password if any

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("❌ Database connection failed: " . $e->getMessage());
}

// ====== ADD DEFAULT USERS (if not exist) ======
$users = [
    ["sha123@gmail.com", "Sha123!", "admin"],
    ["sha1@gmail.com", "User123!", "user"],
    ["tian123@gmail.com", "Tian123!", "user"],
    ["feli@gmail.com", "Feli123!", "user"]
];

$check = $pdo->prepare("SELECT COUNT(*) FROM users WHERE email = ?");
$insert = $pdo->prepare("INSERT INTO users (email, password, role) VALUES (?, ?, ?)");

foreach ($users as $user) {
    [$email, $plainPass, $role] = $user;
    $check->execute([$email]);
    if ($check->fetchColumn() == 0) {
        $hashed = password_hash($plainPass, PASSWORD_DEFAULT);
        $insert->execute([$email, $hashed, $role]);
    }
}

// ====== HANDLE LOGIN FORM ======
$error = "";
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $email = trim($_POST["email"] ?? "");
    $passwordInput = $_POST["password"] ?? "";

    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($passwordInput, $user["password"])) {
        $_SESSION["email"] = $user["email"];
        $_SESSION["role"] = $user["role"];

        // redirect based on role
        if ($user["role"] === "admin") {
            header("Location: Admin.html");
            exit();
        } else {
            header("Location: user.html");
            exit();
        }
    } else {
        $error = "Invalid email or password!";
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Login - ProBoost</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #eef3f7;
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 100px;
    }
    form {
      background-color: #fff;
      padding: 25px;
      border-radius: 10px;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
      width: 300px;
    }
    input {
      width: 100%;
      padding: 8px;
      margin: 8px 0;
    }
    button {
      padding: 8px 10px;
      margin-top: 10px;
      cursor: pointer;
    }
    .error { color: red; }
  </style>
</head>
<body>
  <h2>Login</h2>
  <?php if ($error): ?>
    <p class="error">❌ <?= htmlspecialchars($error) ?></p>
  <?php endif; ?>

  <form method="POST">
    <input type="email" name="email" placeholder="Email" required><br>
    <input id="passwordInput" type="password" name="password" placeholder="Password" required>
    <button type="button" id="toggleBtn">🙈</button><br>
    <button type="submit">Login</button>
  </form>

  <script>
    const toggleBtn = document.getElementById("toggleBtn");
    const passwordInput = document.getElementById("passwordInput");
    toggleBtn.addEventListener("click", () => {
      if (passwordInput.type === "password") {
        passwordInput.type = "text";
        toggleBtn.textContent = "🙉";
      } else {
        passwordInput.type = "password";
        toggleBtn.textContent = "🙈";
      }
    });
  </script>
</body>
</html>
