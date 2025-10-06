// Workspace Management System JavaScript

// In-memory storage for workspaces
let workspaces = [
    {
        id: 1,
        name: "Marketing Team",
        description: "Marketing campaigns and strategies",
        type: "team",
        createdAt: new Date("2024-01-15")
    },
    {
        id: 2,
        name: "Product Development",
        description: "Product roadmap and feature development",
        type: "private",
        createdAt: new Date("2024-02-10")
    },
    {
        id: 3,
        name: "Design System",
        description: "UI/UX design guidelines and components",
        type: "public",
        createdAt: new Date("2024-03-05")
    }
];

let nextId = 4;

// DOM Elements
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section');
const createBtn = document.getElementById('createBtn');
const viewBtn = document.getElementById('viewBtn');
const deleteBtn = document.getElementById('deleteBtn');
const createForm = document.getElementById('createForm');
const workspaceList = document.getElementById('workspaceList');
const deleteForm = document.getElementById('deleteForm');
const workspaceForm = document.getElementById('workspaceForm');
const deleteWorkspaceForm = document.getElementById('deleteWorkspaceForm');
const cancelCreate = document.getElementById('cancelCreate');
const cancelDelete = document.getElementById('cancelDelete');
const messageContainer = document.getElementById('messageContainer');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Set up navigation
    setupNavigation();

    // Set up event listeners
    setupEventListeners();

    // Update delete dropdown
    updateDeleteDropdown();
});

// ---------------------- Navigation ----------------------
function setupNavigation() {
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetSection = this.getAttribute('data-section');
            switchSection(targetSection);
        });
    });
}

function switchSection(targetSection) {
    // Hide all sections
    sections.forEach(section => {
        section.classList.remove('active');
    });

    // Remove active class from all nav links
    navLinks.forEach(link => {
        link.classList.remove('active');
    });

    // Show target section
    document.getElementById(targetSection).classList.add('active');

    // Add active class to clicked nav link
    document.querySelector(`[data-section="${targetSection}"]`).classList.add('active');

    // Reset workspace view when switching away
    if (targetSection !== 'workspaces') {
        workspaceList.innerHTML = ''; // Clear list if not on workspaces section
    }
}

// ---------------------- Event Listeners ----------------------
function setupEventListeners() {
    if (createBtn) {
        createBtn.addEventListener('click', () => {
            createForm.style.display = 'block';
        });
    }

    if (cancelCreate) {
        cancelCreate.addEventListener('click', () => {
            createForm.style.display = 'none';
        });
    }

    if (workspaceForm) {
        workspaceForm.addEventListener('submit', createWorkspace);
    }

    if (viewBtn) {
        viewBtn.addEventListener('click', viewWorkspaces);
    }

    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            deleteForm.style.display = 'block';
        });
    }

    if (cancelDelete) {
        cancelDelete.addEventListener('click', () => {
            deleteForm.style.display = 'none';
        });
    }

    if (deleteWorkspaceForm) {
        deleteWorkspaceForm.addEventListener('submit', deleteWorkspace);
    }
}

// ---------------------- Workspace Functions ----------------------
function createWorkspace(event) {
    event.preventDefault();

    const name = document.getElementById('workspaceName').value;
    const description = document.getElementById('workspaceDesc').value;
    const type = document.getElementById('workspaceType').value;

    const newWorkspace = {
        id: nextId++,
        name,
        description,
        type,
        createdAt: new Date()
    };

    workspaces.push(newWorkspace);
    updateDeleteDropdown();

    showMessage(`✅ Workspace "${name}" created successfully!`, "success");
    workspaceForm.reset();
    createForm.style.display = 'none';
}

function viewWorkspaces() {
    workspaceList.innerHTML = '';

    if (workspaces.length === 0) {
        workspaceList.innerHTML = '<p>No workspaces found.</p>';
        return;
    }

    const ul = document.createElement('ul');
    workspaces.forEach(ws => {
        const li = document.createElement('li');
        li.textContent = `${ws.id}. ${ws.name} (${ws.type}) - Created on ${ws.createdAt.toDateString()}`;
        ul.appendChild(li);
    });

    workspaceList.appendChild(ul);
}

function deleteWorkspace(event) {
    event.preventDefault();

    const workspaceId = parseInt(document.getElementById('deleteWorkspaceSelect').value, 10);
    const index = workspaces.findIndex(ws => ws.id === workspaceId);

    if (index > -1) {
        const deleted = workspaces.splice(index, 1)[0];
        updateDeleteDropdown();
        showMessage(`🗑 Workspace "${deleted.name}" deleted successfully.`, "error");
    }

    deleteForm.style.display = 'none';
}

// ---------------------- Helpers ----------------------
function updateDeleteDropdown() {
    const select = document.getElementById('deleteWorkspaceSelect');
    if (!select) return;

    select.innerHTML = '<option value="">Select workspace</option>';
    workspaces.forEach(ws => {
        const option = document.createElement('option');
        option.value = ws.id;
        option.textContent = ws.name;
        select.appendChild(option);
    });
}

function showMessage(message, type = "info") {
    if (!messageContainer) return;

    messageContainer.textContent = message;
    messageContainer.className = type;

    setTimeout(() => {
        messageContainer.textContent = '';
        messageContainer.className = '';
    }, 3000);
}
