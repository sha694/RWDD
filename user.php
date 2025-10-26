<?php
session_start();
if (!isset($_SESSION['email']) || $_SESSION['role'] !== 'user') {
    header("Location: login.php");
    exit();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>User Dashboard - ProBoost</title>
  <link rel="stylesheet" href="user.css">
</head>
<body>
  <!-- Top Navigation Bar -->
  <header class="top-navbar">
    <div class="navbar-left">
      <div class="logo">
        <img src="Logo.png" alt="ProBoost Logo">
        <span>ProBoost</span>
      </div>
      <button class="nav-button home-btn" onclick="goToMainMenu()">Home</button>
      <div class="search-container">
        <input type="text" placeholder="Search..." class="search-input">
        <button class="search-btn" aria-label="Search">🔍</button>
      </div>
    </div>
    
    <div class="navbar-right">
      <button class="icon-btn" title="Add New" aria-label="Add New">➕</button>
      <button class="icon-btn" title="Notifications" aria-label="Notifications">🔔</button>
      <div class="user-profile" onclick="toggleUserMenu()">
        <div class="user-avatar" id="userAvatar">👤</div>
        <span id="userNameDisplay">User</span>
      </div>
      <button class="icon-btn" title="Settings" onclick="openSettings()" aria-label="Settings">⚙</button>
    </div>
  </header>

  <!-- Circular Navigation FAB -->
  <div class="circular-nav" id="circularNav">
    <div class="fab-main" onclick="toggleCircularNav()">
      <div class="fab-icon">☰</div>
    </div>
    <div class="fab-options" id="fabOptions">
      <div class="fab-option" onclick="navigateToSection('collaboration')" title="Team Collaboration">🤝</div>
      <div class="fab-option" onclick="navigateToSection('time')" title="Time Tracking">⏳</div>
      <div class="fab-option" onclick="navigateToSection('analytics')" title="Analytics">📊</div>
      <div class="fab-option" onclick="navigateToSection('goals')" title="Goals">🎯</div>
      <div class="fab-option" onclick="navigateToSection('tasks')" title="Tasks">📝</div>
      <div class="fab-option" onclick="navigateToSection('countdown')" title="Countdown">⏰</div>
      <div class="fab-option logout-fab" onclick="logoutUser()" title="Logout">🚪</div>
    </div>
  </div>

  <!-- Main Content -->
  <main class="main-content">
    <!-- Team Collaboration Section -->
    <section id="collaboration" class="section active">
      <div class="section-header">
        <h1>🤝 Team Collaboration</h1>
        <p>Work with your team seamlessly</p>
      </div>
      <div class="collaboration-board">
        <div class="board-column">
          <div class="column-header">
            <h3>📝 To Do</h3>
            <button class="add-card-btn" onclick="addCard('todo')">+ Add Card</button>
          </div>
          <div class="card-container" id="todo-cards"></div>
        </div>
        <div class="board-column">
          <div class="column-header">
            <h3>⚡ In Progress</h3>
            <button class="add-card-btn" onclick="addCard('progress')">+ Add Card</button>
          </div>
          <div class="card-container" id="progress-cards"></div>
        </div>
        <div class="board-column">
          <div class="column-header">
            <h3>✅ Completed</h3>
            <button class="add-card-btn" onclick="addCard('completed')">+ Add Card</button>
          </div>
          <div class="card-container" id="completed-cards"></div>
        </div>
      </div>
    </section>

    <!-- Time Tracking Section -->
    <section id="time" class="section">
      <div class="section-header">
        <h1>⏳ Time Tracking</h1>
        <p>Log and monitor your hours</p>
      </div>
      <div class="time-tracking-container">
        <div class="time-input-section">
          <div class="input-group">
            <input type="text" id="taskName" placeholder="Task name" class="input-field">
            <input type="number" id="taskHours" placeholder="Hours" class="input-field hours-input">
            <button class="btn-primary" onclick="addTimeEntry()">Add Entry</button>
          </div>
        </div>
        <div class="time-table-container">
          <table class="time-table" id="timeTable">
            <thead>
              <tr>
                <th>Date</th>
                <th>Task</th>
                <th>Hours</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
          <div class="total-hours">
            <strong>Total Hours:</strong> <span id="totalHours">0 hrs</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Goals Section -->
    <section id="goals" class="section">
      <div class="section-header">
        <h1>🎯 Goals</h1>
        <p>Set and track your personal goals</p>
      </div>
      <div class="goals-container">
        <div class="input-group">
          <input type="text" id="newGoal" placeholder="Enter a new goal..." class="input-field">
          <button class="btn-primary" onclick="addGoal()">Add Goal</button>
        </div>
        <div class="goals-list" id="goalList"></div>
      </div>
    </section>

    <!-- Tasks Section -->
    <section id="tasks" class="section">
      <div class="section-header">
        <h1>📝 Tasks</h1>
        <p>Manage your daily tasks</p>
      </div>
      <div class="tasks-container">
        <div class="input-group">
          <input type="text" id="newTask" placeholder="Enter a new task..." class="input-field">
          <button class="btn-primary" onclick="addTask()">Add Task</button>
        </div>
        <div class="tasks-list" id="taskList"></div>
      </div>
    </section>

    <!-- Countdown Section -->
    <section id="countdown" class="section">
      <div class="section-header">
        <h1>⏰ Countdown</h1>
        <p>Track important deadlines</p>
      </div>
      <div class="countdown-container">
        <div class="countdown-display">
          <h2>New Year 2026 Countdown</h2>
          <div class="countdown-timer" id="countdown-timer"></div>
        </div>
      </div>
    </section>

    <!-- User Menu -->
    <div id="userMenu" class="user-menu">
      <div class="user-info">
        <div class="user-avatar-large">👤</div>
        <div>
          <div class="user-name" id="userNameMenu">User</div>
          <div class="user-role" id="userEmailMenu"><?php echo $_SESSION['email']; ?></div>
        </div>
      </div>
      <a href="#" class="menu-item" onclick="openSettings(); return false;">⚙ Settings</a>
      <a href="#" class="menu-item logout-item" onclick="logoutUser(); return false;">🚪 Logout</a>
    </div>

    <!-- Logout Modal -->
    <div id="logoutModal" class="modal">
      <div class="modal-content">
        <h3>Confirm Logout</h3>
        <p>Are you sure you want to logout?</p>
        <div class="modal-actions">
          <button class="btn-primary" onclick="confirmLogout()">Yes, Logout</button>
          <button class="btn-secondary" onclick="cancelLogout()">Cancel</button>
        </div>
      </div>
    </div>

  </main>

  <script>
    // Save login session from PHP to sessionStorage for JS
    sessionStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('role', 'user');
    sessionStorage.setItem('userEmail', '<?php echo $_SESSION['email']; ?>');

    // All your JS functions stay exactly the same
    let circularNavOpen = false;

    document.addEventListener('DOMContentLoaded', function() {
      displayUserInfo();
      updateTotalHours();
      setInterval(updateCountdown, 1000);
      updateCountdown();
    });

    function displayUserInfo() {
      const userEmail = sessionStorage.getItem('userEmail') || 'user@example.com';
      const userName = userEmail.split('@')[0];
      document.getElementById('userNameDisplay').textContent = userName;
      document.getElementById('userNameMenu').textContent = userName;
      document.getElementById('userEmailMenu').textContent = userEmail;
    }

    function logoutUser() { 
      document.getElementById('logoutModal').style.display='flex'; 
    }

    function confirmLogout() {
      sessionStorage.clear();
      window.location.href='Login Page.html';
    }

    function cancelLogout() { 
      document.getElementById('logoutModal').style.display='none'; 
    }

    function goToMainMenu() {
      window.location.href = "main menu.html";
    }

    function toggleCircularNav() {
      circularNavOpen = !circularNavOpen;
      const nav = document.getElementById('circularNav');
      nav.classList.toggle('open');
      nav.querySelector('.fab-main').classList.toggle('rotated');
    }

    function toggleUserMenu() {
      document.getElementById('userMenu').classList.toggle('show');
    }

    function navigateToSection(sectionId) { 
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      document.getElementById(sectionId).classList.add('active'); 
      if (circularNavOpen) toggleCircularNav();
    }

    // Remaining JS (addCard, addTimeEntry, addTask, addGoal, updateCountdown etc.) remains unchanged
  </script>
</body>
</html>
