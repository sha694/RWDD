<?php
session_start();

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "ProBoost"; // your database name

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
  $email = trim($_POST['email'] ?? '');
  $password = trim($_POST['password'] ?? '');

  if (empty($email) || empty($password)) {
    echo "<script>alert('⚠️ Please fill in all fields.'); window.history.back();</script>";
    exit;
  }

  // Check if email exists
  $sql = "SELECT * FROM user_database WHERE email='$email'";
  $result = $conn->query($sql);

  if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();

    // Check password (if hashed)
    if (password_verify($password, $row['password'])) {
      $_SESSION['email'] = $email;
      header("Location: User.html");
      exit;
    } 
    // if not hashed, check plain text
    elseif ($row['password'] === $password) {
      $_SESSION['email'] = $email;
      header("Location: User.html");
      exit;
    } 
    else {
      echo "<script>alert('❌ Incorrect password.'); window.history.back();</script>";
    }
  } else {
    echo "<script>alert('❌ Email not found. Please sign up first.'); window.location.href='Sign up Page.html';</script>";
  }
}

$conn->close();
?>
