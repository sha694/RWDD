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

// Navigation Setup
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
    if (targetSection !== 'workspaces')