<?php
$servername = "localhost";
$username = "root";      // default for XAMPP
$password = "";          // leave empty unless you set one
$dbname = "ProBoost";    // your database name

// Connect to MySQL
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get form data
$fullname = $_POST['fullname'];
$email = $_POST['email'];
$password = $_POST['password'];

// Encrypt password before storing
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// Insert into table
$sql = "INSERT INTO user_database (fullname, email, password) VALUES ('$fullname', '$email', '$hashedPassword')";

if ($conn->query($sql) === TRUE) {
    echo "✅ User registered successfully!";
} else {
    echo "❌ Error: " . $sql . "<br>" . $conn->error;
}

$conn->close();
?>