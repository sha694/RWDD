<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "ProBoost";

// Connect to MySQL
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

// Handle POST data safely
if ($_SERVER["REQUEST_METHOD"] == "POST") {
  $email = trim($_POST['signupEmail'] ?? '');
  $password = trim($_POST['signupPassword'] ?? '');
  $confirmPassword = trim($_POST['confirmPassword'] ?? '');

  // ✅ Validation
  if (empty($email) || empty($password) || empty($confirmPassword)) {
    echo "<script>alert('⚠️ Please fill in all fields.'); window.history.back();</script>";
    exit;
  }

  if (!preg_match("/^[a-zA-Z0-9._%+-]+@gmail\.com$/", $email)) {
    echo "<script>alert('⚠️ Please enter a valid Gmail address.'); window.history.back();</script>";
    exit;
  }

  if ($password !== $confirmPassword) {
    echo "<script>alert('❌ Passwords do not match.'); window.history.back();</script>";
    exit;
  }

  // ✅ Check if email already exists
  $checkEmail = $conn->query("SELECT * FROM user_database WHERE email='$email'");
  if ($checkEmail->num_rows > 0) {
    echo "<script>alert('⚠️ Email already exists. Please login instead.'); window.location.href='Login Page.html';</script>";
    exit;
  }

  // ✅ Encrypt password
  $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

  // ✅ Insert into DB
  $sql = "INSERT INTO user_database (email, password) VALUES ('$email', '$hashedPassword')";
  if ($conn->query($sql) === TRUE) {
    echo "<script>
            alert('✅ User registered successfully!');
            window.location.href = 'Login Page.html';
          </script>";
  } else {
    echo "<script>alert('❌ Error: Unable to register user.'); window.history.back();</script>";
  }
}

$conn->close();
?>
