<?php
// Debugging script — do NOT keep this in production
echo "<h2>DEBUG: signup_debug.php</h2>";

// show request method
echo "<p><strong>Request method:</strong> " . htmlspecialchars($_SERVER['REQUEST_METHOD']) . "</p>";

// show raw POST keys
echo "<h3>_POST (keys and values)</h3>";
echo "<pre>";
var_dump($_POST);
echo "</pre>";

// show raw php input (in case body not parsed)
echo "<h3>php://input (raw body)</h3>";
$raw = file_get_contents('php://input');
echo "<pre>" . htmlspecialchars($raw) . "</pre>";

// show headers (useful when using fetch/ajax)
echo "<h3>Request Headers</h3>";
echo "<pre>";
foreach (getallheaders() as $k=>$v) {
    echo htmlspecialchars("$k: $v") . "\n";
}
echo "</pre>";

// quick helpful message
echo "<p>If you see an empty array for <code>_POST</code>, your form likely used GET, JS prevented submission, or the action points to a different URL.</p>";
?>
