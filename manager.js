(function () {

  /* ---------- helpers ---------- */
  const qs = (s, c = document) => c.querySelector(s);
  const qsa = (s, c = document) => [...c.querySelectorAll(s)];
  const setText = (sel, txt) => { const el = qs(sel); if (el) el.textContent = txt; };

  function showPage(id) {
    qsa(".section, .page").forEach(s => s.classList.remove("active")); // hide all
    qs("#" + id)?.classList.add("active");                               // show selected
    // Save + set title
    localStorage.setItem("manager.activePage", id);
    const title = qs("#" + id)?.getAttribute("data-title") || "Manager";
    document.title = `ProBoost – ${title}`;
  }

  // Backward-compat for older HTML that calls showSection(...)
  window.showPage = showPage;
  window.showSection = showPage;

  /* ---------- header actions (settings / user menu / logout) ---------- */
  window.toggleUserMenu = () => qs("#userMenu")?.classList.toggle("show");
  window.logoutUser = () => { qs("#logoutModal").style.display = "flex"; };
  window.confirmLogout = () => { sessionStorage.clear(); window.location.href = "Landing Page.html"; };
  window.cancelLogout = () => { qs("#logoutModal").style.display = "none"; };
  window.goToMainMenu = () => { window.location.href = "main menu.html"; };

  /* ---------- FAB ---------- */
  let fabOpen = false;
  window.toggleCircularNav = function () {
    fabOpen = !fabOpen;
    const nav = qs("#circularNav");
    nav?.classList.toggle("open");
    nav?.querySelector(".fab-main")?.classList.toggle("rotated");
  };

  // open a page from the circular nav and then close the menu
  window.navigateToSection = function (id) {
    const target = document.getElementById(id);

    if (target) {
      showPage(id);                         // reuse your existing page switcher
    } else {
      // optional: avoid silent clicks for pages you haven't built yet
      console.warn(`No section with id="${id}"`);
      alert('This section is not available yet.');
    }

    // close the FAB menu / un-rotate the main button
    const nav = document.getElementById('circularNav');
    nav?.classList.remove('open');
    nav?.querySelector('.fab-main')?.classList.remove('rotated');
  };

  /* ---------- TASK MANAGEMENT FUNCTIONALITY ---------- */
  let tasks = JSON.parse(localStorage.getItem("managerTasks") || "[]");
  
  // Initialize demo data if empty
  if (!tasks.length) {
    const iso = (o)=>{
      const d = new Date();
      d.setDate(d.getDate() + o);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    tasks = [
      {id:1,title:"Review Q1 Reports",desc:"Analyze metrics and prepare summary",status:"upcoming",priority:"High",assignee:"John",deadline:iso(2),tags:["reports"],image:null,createdAt:new Date().toISOString()},
      {id:2,title:"Team Sync",desc:"Weekly standup meeting",status:"in-progress",priority:"Medium",assignee:"Sarah",deadline:iso(4),tags:["meeting"],image:null,createdAt:new Date().toISOString()},
      {id:3,title:"Project Planning",desc:"Q4 scope definition",status:"completed",priority:"Low",assignee:"Mike",deadline:iso(-1),tags:["planning"],image:null,createdAt:new Date().toISOString()},
      {id:4,title:"Budget Review",desc:"Department budget analysis",status:"pending",priority:"High",assignee:"Alex",deadline:iso(7),tags:["finance"],image:null,createdAt:new Date().toISOString()},
    ];
    localStorage.setItem("managerTasks", JSON.stringify(tasks));
  }

  // Helper function to format dates consistently for storage
  function formatDateForStorage(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Helper function to parse stored dates
  function parseStoredDate(dateString) {
    if (!dateString) return null;
    const parts = dateString.split('-');
    if (parts.length !== 3) return null;
    return new Date(parts[0], parts[1] - 1, parts[2]); // Month is 0-indexed
  }

  // Helper function to compare dates (ignoring time)
  function areDatesEqual(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  // Update the date formatting function to be consistent
  function fmt(dateStr){
    // Parse the stored date and format it for display
    const date = parseStoredDate(dateStr);
    if (!date) return 'Invalid Date';
    return date.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
  }

  /* ---------- TASK DETAIL VIEW FUNCTIONALITY ---------- */
  window.showTaskDetails = function(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    
    // Determine file type for appropriate display
    let fileContent = '';
    if (task.image) {
      if (task.image.startsWith('data:image/')) {
        // It's an image
        fileContent = `
          <div class="task-image-preview">
            <img src="${task.image}" alt="Task attachment" class="task-detail-image">
            <div class="image-actions">
              <button class="btn-primary" onclick="downloadFile('${task.image}', '${task.title}.png', 'image/png')">📥 Download Image</button>
              <button class="btn-secondary" onclick="viewImage('${task.image}')">👀 View Full Size</button>
            </div>
          </div>
        `;
      } else if (task.image.includes('application/pdf')) {
        // It's a PDF
        fileContent = `
          <div class="file-preview">
            <div class="file-icon pdf">📄</div>
            <div class="file-info">
              <strong>PDF Document</strong>
              <p>Attached file</p>
            </div>
            <button class="btn-primary" onclick="downloadFile('${task.image}', '${task.title}.pdf', 'application/pdf')">📥 Download PDF</button>
          </div>
        `;
      } else if (task.image.includes('application/msword') || task.image.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
        // It's a Word document
        fileContent = `
          <div class="file-preview">
            <div class="file-icon doc">📝</div>
            <div class="file-info">
              <strong>Word Document</strong>
              <p>Attached file</p>
            </div>
            <button class="btn-primary" onclick="downloadFile('${task.image}', '${task.title}.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')">📥 Download Document</button>
          </div>
        `;
      } else {
        // Generic file
        fileContent = `
          <div class="file-preview">
            <div class="file-icon generic">📎</div>
            <div class="file-info">
              <strong>Attached File</strong>
              <p>Download to view</p>
            </div>
            <button class="btn-primary" onclick="downloadFile('${task.image}', '${task.title}_attachment', 'application/octet-stream')">📥 Download File</button>
          </div>
        `;
      }
    }

    modal.innerHTML = `
      <div class="modal-content" style="max-width: 600px;">
        <div class="task-detail-header">
          <h3>Task Details</h3>
          <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
        </div>
        
        <div class="task-detail-content">
          <div class="task-detail-section">
            <h4>${task.title}</h4>
            <p class="task-description">${task.desc || 'No description provided'}</p>
          </div>

          <div class="task-detail-grid">
            <div class="detail-item">
              <label>Status</label>
              <span class="pill">${task.status}</span>
            </div>
            <div class="detail-item">
              <label>Priority</label>
              <span class="pill priority-${task.priority.toLowerCase()}">${task.priority}</span>
            </div>
            <div class="detail-item">
              <label>Assignee</label>
              <span>${task.assignee}</span>
            </div>
            <div class="detail-item">
              <label>Deadline</label>
              <span>${fmt(task.deadline)}</span>
            </div>
          </div>

          ${task.tags && task.tags.length > 0 ? `
            <div class="task-detail-section">
              <label>Tags</label>
              <div class="tags-container">
                ${task.tags.map(tag => `<span class="pill">${tag}</span>`).join('')}
              </div>
            </div>
          ` : ''}

          ${task.image ? `
            <div class="task-detail-section">
              <label>Attachment</label>
              ${fileContent}
            </div>
          ` : ''}

          <div class="task-detail-section">
            <label>Created</label>
            <span>${new Date(task.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div class="task-detail-actions">
          <button class="btn-primary" onclick="editTask(${task.id}); this.closest('.modal').remove();">✏️ Edit Task</button>
          <button class="btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  };

  // Download file function
  window.downloadFile = function(dataUrl, filename, mimeType) {
    try {
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = filename;
      link.type = mimeType;
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Error downloading file. Please try again.');
    }
  };

  function renderBoard(){
    const cols = qsa(".col");
    cols.forEach(c => c.querySelector(".cards").innerHTML = "");
    const term = (qs("#searchInput")?.value || "").toLowerCase();
    
    tasks.forEach(t=>{
      const hay = `${t.title} ${t.desc} ${t.assignee} ${(t.tags||[]).join(" ")}`.toLowerCase();
      if (term && !hay.includes(term)) return;
      
      const el = document.createElement("div");
      el.className = "card";
      el.draggable = true;
      el.dataset.taskId = t.id;
      
      // Make the entire card clickable for details (except action buttons)
      el.style.cursor = 'pointer';
      el.addEventListener('click', (e) => {
        // Don't trigger if clicking on action buttons
        if (!e.target.closest('.card-actions')) {
          showTaskDetails(t.id);
        }
      });
      
      // Only show image box if there's an image - REMOVED REMOVE BUTTON
      const imageHTML = t.image ? 
        `<div class="thumb">
          <img src="${t.image}" alt="Task attachment" onclick="event.stopPropagation(); viewImage('${t.image}')">
        </div>` : '';
      
      el.innerHTML = `
        <h4>${t.title}</h4>
        <p>${t.desc||""}</p>
        ${imageHTML}
        <div class="meta">
          <span class="pill priority-${t.priority.toLowerCase()}">${t.priority}</span>
          <span class="dot"></span>
          <span>${t.assignee}</span>
        </div>
        <div class="card-foot">
          <span>${fmt(t.deadline)}</span>
          <div class="card-actions">
            <button class="ghost" onclick="event.stopPropagation(); editTask(${t.id})">✏️</button>
            <button class="ghost" onclick="event.stopPropagation(); deleteTask(${t.id})">🗑️</button>
          </div>
        </div>`;
      
      qs(`.col[data-status="${t.status}"] .cards`)?.appendChild(el);
    });

    // overview table
    const tbody = qs("#overviewTable tbody");
    if (tbody){
      tbody.innerHTML = "";
      tasks.forEach(t=>{
        tbody.insertAdjacentHTML("beforeend", `
          <tr>
            <td>${t.title}</td>
            <td><span class="pill">${t.status}</span></td>
            <td>${t.assignee}</td>
            <td>${fmt(t.deadline)}</td>
            <td>${(t.tags||[]).map(x=>`<span class="pill">${x}</span>`).join(" ")}</td>
          </tr>`);
      });
    }

    markCalendar();
    setupDragAndDrop();
  }

  // Sort / filter hooks from HTML
  window.sortBoard = function(){
    const by = qs("#sortSelect")?.value;
    if (!by) return;
    tasks.sort((a,b)=>{
      if(by==="deadline") return (a.deadline||"").localeCompare(b.deadline||"");
      if(by==="assignee") return (a.assignee||"").localeCompare(b.assignee||"");
      const pr = {High:0,Medium:1,Low:2};
      return (pr[a.priority]??9) - (pr[b.priority]??9);
    });
    localStorage.setItem("managerTasks", JSON.stringify(tasks));
    renderBoard();
  };
  
  window.filterBoard = renderBoard;

  // Drag and Drop functionality
  function setupDragAndDrop() {
    const cards = qsa('.card');
    const columns = qsa('.col');
    
    cards.forEach(card => {
      card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', card.dataset.taskId);
        setTimeout(() => card.classList.add('dragging'), 0);
      });
      
      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
      });
    });
    
    columns.forEach(col => {
      col.addEventListener('dragover', (e) => {
        e.preventDefault();
        col.classList.add('drag-over');
      });
      
      col.addEventListener('dragleave', () => {
        col.classList.remove('drag-over');
      });
      
      col.addEventListener('drop', (e) => {
        e.preventDefault();
        col.classList.remove('drag-over');
        
        const taskId = parseInt(e.dataTransfer.getData('text/plain'));
        const newStatus = col.dataset.status;
        
        const task = tasks.find(t => t.id === taskId);
        if (task && task.status !== newStatus) {
          task.status = newStatus;
          localStorage.setItem("managerTasks", JSON.stringify(tasks));
          renderBoard();
        }
      });
    });
  }

  // Task CRUD Operations - UPDATED MODAL WITH REMOVE IMAGE OPTION
  window.openTaskModal = function(taskId = null, defaultStatus = 'upcoming') {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    
    const task = taskId ? tasks.find(t => t.id === taskId) : null;
    
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 500px;">
        <h3>${task ? 'Edit Task' : 'Add New Task'}</h3>
        <form id="taskForm" class="form-container" style="margin: 0;">
          <div class="input-group">
            <label for="taskTitle">Title</label>
            <input type="text" id="taskTitle" value="${task?.title || ''}" required>
          </div>
          <div class="input-group">
            <label for="taskDesc">Description</label>
            <textarea id="taskDesc" rows="3">${task?.desc || ''}</textarea>
          </div>
          <div class="row-2">
            <div class="input-group">
              <label for="taskPriority">Priority</label>
              <select id="taskPriority">
                <option value="High" ${task?.priority === 'High' ? 'selected' : ''}>High</option>
                <option value="Medium" ${task?.priority === 'Medium' ? 'selected' : ''}>Medium</option>
                <option value="Low" ${task?.priority === 'Low' ? 'selected' : ''}>Low</option>
              </select>
            </div>
            <div class="input-group">
              <label for="taskAssignee">Assignee</label>
              <input type="text" id="taskAssignee" value="${task?.assignee || ''}" required>
            </div>
          </div>
          <div class="row-2">
            <div class="input-group">
              <label for="taskDeadline">Deadline</label>
              <input type="date" id="taskDeadline" value="${task?.deadline || ''}" required>
            </div>
            <div class="input-group">
              <label for="taskStatus">Status</label>
              <select id="taskStatus">
                <option value="upcoming" ${(task?.status || defaultStatus) === 'upcoming' ? 'selected' : ''}>Upcoming</option>
                <option value="in-progress" ${(task?.status || defaultStatus) === 'in-progress' ? 'selected' : ''}>In Progress</option>
                <option value="completed" ${(task?.status || defaultStatus) === 'completed' ? 'selected' : ''}>Completed</option>
                <option value="pending" ${(task?.status || defaultStatus) === 'pending' ? 'selected' : ''}>Pending</option>
              </select>
            </div>
          </div>
          <div class="input-group">
            <label for="taskTags">Tags (comma separated)</label>
            <input type="text" id="taskTags" value="${task?.tags?.join(', ') || ''}" placeholder="reports, meeting, planning">
          </div>
          <div class="input-group">
            <label for="taskImage">Attach Image/File</label>
            <input type="file" id="taskImage" accept="image/*,.pdf,.doc,.docx" onchange="previewTaskImage(this)">
            <div id="imagePreview" style="margin-top: 10px;">
              ${task?.image ? `
                <div class="existing-file-preview">
                  <img src="${task.image}" style="max-width: 100px; max-height: 100px; border-radius: 8px;">
                  <button type="button" class="btn-remove-file" onclick="removeExistingImage()">Remove File</button>
                </div>
              ` : ''}
            </div>
          </div>
          <div class="modal-actions" style="margin-top: 20px;">
            <button type="submit" class="btn-primary">${task ? 'Update Task' : 'Create Task'}</button>
            <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
          </div>
        </form>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    const form = modal.querySelector('#taskForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      saveTask(taskId);
    });
    
    // Store task ID for remove function
    if (taskId) {
      modal.dataset.taskId = taskId;
    }
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  };

  // Remove existing image from task (only available in edit mode)
  window.removeExistingImage = function() {
    const modal = document.querySelector('.modal');
    const taskId = modal?.dataset.taskId;
    
    if (taskId && confirm('Are you sure you want to remove the attached file?')) {
      const taskIndex = tasks.findIndex(t => t.id === parseInt(taskId));
      if (taskIndex !== -1) {
        tasks[taskIndex].image = null;
        // Update the preview immediately
        const preview = document.getElementById('imagePreview');
        preview.innerHTML = '';
        // Clear the file input
        const fileInput = document.getElementById('taskImage');
        fileInput.value = '';
      }
    }
  };

  // Preview image before uploading
  window.previewTaskImage = function(input) {
    const preview = document.getElementById('imagePreview');
    preview.innerHTML = '';
    
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      
      reader.onload = function(e) {
        const img = document.createElement('img');
        img.src = e.target.result;
        img.style.maxWidth = '100px';
        img.style.maxHeight = '100px';
        img.style.borderRadius = '8px';
        img.style.marginTop = '10px';
        preview.appendChild(img);
      }
      
      reader.readAsDataURL(input.files[0]);
    }
  };

  function saveTask(taskId) {
    const imageInput = document.getElementById('taskImage');
    let imageData = null;
    
    // Handle image upload
    if (imageInput.files && imageInput.files[0]) {
      const reader = new FileReader();
      reader.onload = function(e) {
        imageData = e.target.result;
        completeSave(taskId, imageData);
      };
      reader.readAsDataURL(imageInput.files[0]);
    } else {
      // No new image, keep existing one if editing
      const existingTask = taskId ? tasks.find(t => t.id === taskId) : null;
      imageData = existingTask?.image || null;
      completeSave(taskId, imageData);
    }
  }

  function completeSave(taskId, imageData) {
    // Get the date input value and ensure it's stored consistently
    const deadlineInput = document.getElementById('taskDeadline').value;
    
    const formData = {
      title: document.getElementById('taskTitle').value,
      desc: document.getElementById('taskDesc').value,
      priority: document.getElementById('taskPriority').value,
      assignee: document.getElementById('taskAssignee').value,
      deadline: deadlineInput, // Store as YYYY-MM-DD directly from input
      status: document.getElementById('taskStatus').value,
      tags: document.getElementById('taskTags').value.split(',').map(tag => tag.trim()).filter(tag => tag),
      image: imageData
    };
    
    if (taskId) {
      // Update existing task
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        tasks[taskIndex] = { ...tasks[taskIndex], ...formData };
      }
    } else {
      // Create new task
      const newTask = {
        id: Date.now(),
        ...formData,
        createdAt: new Date().toISOString()
      };
      tasks.push(newTask);
    }
    
    localStorage.setItem("managerTasks", JSON.stringify(tasks));
    document.querySelector('.modal').remove();
    renderBoard();
    buildCalendar(); // Rebuild calendar to reflect new task dates
    markCalendar();
  }

  // View image in full size
  window.viewImage = function(imageSrc) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 90vw; max-height: 90vh; background: transparent; border: none;">
        <button class="close-full-image" onclick="this.closest('.modal').remove()" style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%; width: 40px; height: 40px; font-size: 20px; cursor: pointer;">×</button>
        <img src="${imageSrc}" style="max-width: 100%; max-height: 100%; border-radius: 8px;">
      </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  };

  window.editTask = function(taskId) {
    window.openTaskModal(taskId);
  };

  window.deleteTask = function(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
      tasks = tasks.filter(t => t.id !== taskId);
      localStorage.setItem("managerTasks", JSON.stringify(tasks));
      renderBoard();
      buildCalendar(); // Rebuild calendar to reflect removed tasks
      markCalendar();
    }
  };

  /* ---------- CALENDAR FUNCTIONALITY ---------- */
  let calDate = new Date();
  
  function buildCalendar(){
    const y = calDate.getFullYear(), m = calDate.getMonth();
    const first = new Date(y, m, 1), last = new Date(y, m + 1, 0);
    const start = first.getDay(), days = last.getDate();
    setText("#calTitle", first.toLocaleString(undefined,{month:'long',year:'numeric'}));
    const body = qs("#calBody"); 
    if(!body) return;
    
    body.innerHTML = "";
    let d = 1;
    
    for(let i = 0; i < 6; i++){
      const tr = document.createElement("tr");
      for(let j = 0; j < 7; j++){
        const td = document.createElement("td");
        if(i === 0 && j < start || d > days){ 
          td.classList.add("pad"); 
        } else {
          // Create date without timezone issues - use local date
          const cellDate = new Date(y, m, d);
          const iso = formatDateForStorage(cellDate); // Use consistent date formatting
          
          td.textContent = d;
          td.dataset.date = iso;
          td.style.cursor = "pointer";
          td.addEventListener("click", () => selectDay(cellDate));
          
          // Check if this date has tasks using consistent date comparison
          const hasTasks = tasks.some(t => {
            const taskDate = parseStoredDate(t.deadline);
            return taskDate && areDatesEqual(taskDate, cellDate);
          });
          
          if (hasTasks) {
            td.classList.add("has-task");
          }
          
          // Select today by default - using local date comparison
          const now = new Date();
          if(d === now.getDate() && m === now.getMonth() && y === now.getFullYear()){
            td.classList.add("is-selected");
            if (!qs("#dayTitle").textContent.includes('—')) {
              selectDay(cellDate);
            }
          }
          d++;
        }
        tr.appendChild(td);
      }
      body.appendChild(tr);
      if(d > days) break;
    }
  }

  function markCalendar(){
    qsa("#calBody td").forEach(td => {
      const ds = td.dataset.date;
      if(!ds) return;
      
      const has = tasks.some(t => {
        const taskDate = parseStoredDate(t.deadline);
        const cellDate = parseStoredDate(ds);
        return taskDate && cellDate && areDatesEqual(taskDate, cellDate);
      });
      
      td.classList.toggle("has-task", has);
    });
  }

  function selectDay(date){
    const dateString = formatDateForStorage(date);
    setText("#dayTitle", date.toLocaleDateString(undefined,{weekday:'long',year:'numeric',month:'long',day:'numeric'}));
    
    qsa("#calBody td").forEach(td => td.classList.remove("is-selected"));
    qs(`#calBody td[data-date="${dateString}"]`)?.classList.add("is-selected");
    
    const box = qs("#dayItems"); 
    if(!box) return;
    
    box.innerHTML = "";
    
    // Find tasks for this specific date using consistent comparison
    const dayTasks = tasks.filter(t => {
      const taskDate = parseStoredDate(t.deadline);
      return taskDate && areDatesEqual(taskDate, date);
    });
    
    if(!dayTasks.length){ 
      box.innerHTML = `<p class="muted">No tasks scheduled for this day</p>`; 
      box.parentElement.classList.remove('has-task');
      box.parentElement.classList.add('empty');
      return; 
    }
    
    box.parentElement.classList.add('has-task');
    box.parentElement.classList.remove('empty');
    
    dayTasks.forEach(t => {
      const div = document.createElement("div");
      div.className = "task-item";
      div.innerHTML = `
        <div>
          <strong>${t.title}</strong>
          <div class="muted">${t.assignee} • ${t.priority}</div>
        </div>
        <span class="pill">${t.status}</span>`;
      div.addEventListener('click', () => editTask(t.id));
      box.appendChild(div);
    });
  }

  window.prevMonth = () => { 
    calDate.setMonth(calDate.getMonth() - 1); 
    buildCalendar(); 
    markCalendar();
  };
  
  window.nextMonth = () => { 
    calDate.setMonth(calDate.getMonth() + 1); 
    buildCalendar(); 
    markCalendar();
  };

  /* ---------- GOAL MANAGEMENT FUNCTIONALITY ---------- */
  let goals = JSON.parse(localStorage.getItem("managerGoals") || "[]");
  if (!goals.length){
    // goals = [
    //   {id:101,title:"Increase Team Productivity",type:"team",timeframe:"Q4 2025",progress:60,status:"in-progress",target:"",trackingMethod:"progress",createdAt:new Date().toISOString()},
    //   {id:102,title:"Leadership Training",type:"personal",timeframe:"Oct 2025",progress:40,status:"in-progress",target:"Certification",trackingMethod:"outcome",createdAt:new Date().toISOString()},
    //   {id:103,title:"Ship v1.2",type:"team",timeframe:"Nov 2025",progress:100,status:"completed",target:"",trackingMethod:"progress",createdAt:new Date().toISOString()},
    // ];
    localStorage.setItem("managerGoals", JSON.stringify(goals));
  }

  function renderGoals(){
    const pbody = qs("#personalGoals tbody");
    const tbody = qs("#teamGoals tbody");
    if (pbody) pbody.innerHTML = "";
    if (tbody) tbody.innerHTML = "";

    // Filter out archived goals for display
    const activeGoals = goals.filter(g => !g.archived);

    activeGoals.filter(g=>g.type==="personal").forEach(g=>{
      pbody?.insertAdjacentHTML("beforeend",
        `<tr onclick="editGoal(${g.id})" style="cursor:pointer;">
          <td>${g.title}</td>
          <td>${g.type}</td>
          <td>${g.timeframe}</td>
          <td>${g.target || '—'}</td>
          <td><span class="pill">${g.status}</span></td>
        </tr>`);
    });
    
    activeGoals.filter(g=>g.type==="team").forEach(g=>{
      let progressCell;
      if (g.trackingMethod === 'progress') {
        // Create circular progress indicator for progress-based goals
        progressCell = `
          <td style="text-align: center;">
            <div class="circular-progress" style="--progress: ${g.progress}%">
              ${g.progress}%
            </div>
          </td>
        `;
      } else {
        // Show target/outcome for outcome-based goals
        progressCell = `<td>${g.target || '—'}</td>`;
      }
      
      tbody?.insertAdjacentHTML("beforeend",
        `<tr onclick="editGoal(${g.id})" style="cursor:pointer;">
          <td>${g.title}</td>
          <td>${g.type}</td>
          <td>${g.timeframe}</td>
          ${progressCell}
          <td><span class="pill">${g.status}</span></td>
        </tr>`);
    });

    const activeAchieved = activeGoals.filter(g=>g.status==="completed").length;
    const totalActive = activeGoals.length, pct = totalActive? Math.round(activeAchieved/totalActive*100):0;
    const donut = qs("#donut");
    setText("#donutLabel", `${activeAchieved}/${totalActive} Goals Achieved`);
    setText("#donutSub", `${pct}% Complete`);
    if (donut){
      donut.style.background = `
        radial-gradient(closest-side, transparent 66%, rgba(255,255,255,.6) 67%, rgba(255,255,255,.6) 70%, transparent 71%),
        conic-gradient(#3498DB 0% ${pct}%, rgba(180,215,241,.5) ${pct}% 100%)`;
    }

    // Render progress log
    renderProgressLog();
  }

  // UPDATED GOAL MODAL FUNCTION WITH SLIDER AND DELETE OPTION
  window.openGoalModal = function(type = 'personal', goalId = null) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    
    const goal = goalId ? goals.find(g => g.id === goalId) : null;
    const trackingMethod = goal?.trackingMethod || (type === 'team' ? 'progress' : 'outcome');
    
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 500px;">
        <h3>${goal ? 'Edit Goal' : 'Add New Goal'}</h3>
        <form id="goalForm" class="form-container" style="margin: 0;">
          <div class="input-group">
            <label for="goalTitle">Title</label>
            <input type="text" id="goalTitle" value="${goal?.title || ''}" required>
          </div>
          <div class="row-2">
            <div class="input-group">
              <label for="goalType">Type</label>
              <select id="goalType">
                <option value="personal" ${(goal?.type || type) === 'personal' ? 'selected' : ''}>Personal</option>
                <option value="team" ${(goal?.type || type) === 'team' ? 'selected' : ''}>Team</option>
              </select>
            </div>
            <div class="input-group">
              <label for="goalTimeframe">Timeframe</label>
              <input type="text" id="goalTimeframe" value="${goal?.timeframe || ''}" placeholder="Q4 2025" required>
            </div>
          </div>
          <div class="input-group">
            <label for="goalTracking">Tracking Method</label>
            <select id="goalTracking">
              <option value="outcome" ${trackingMethod === 'outcome' ? 'selected' : ''}>Goal Outcome</option>
              <option value="progress" ${trackingMethod === 'progress' ? 'selected' : ''}>Progress Percentage</option>
            </select>
          </div>
          <div id="outcomeField" class="input-group" style="display: ${trackingMethod === 'outcome' ? 'block' : 'none'}">
            <label for="goalTarget">Target/Outcome</label>
            <input type="text" id="goalTarget" value="${goal?.target || ''}" placeholder="What you want to achieve">
          </div>
          <div id="progressField" class="input-group" style="display: ${trackingMethod === 'progress' ? 'block' : 'none'}">
            <label for="goalProgress">Progress</label>
            <div class="slider-container">
              <input type="range" id="goalProgress" class="slider" min="0" max="100" value="${goal?.progress || 0}">
              <span id="goalProgressValue" class="slider-value">${goal?.progress || 0}%</span>
            </div>
          </div>
          <div class="input-group">
            <label for="goalStatus">Status</label>
            <select id="goalStatus">
              <option value="in-progress" ${goal?.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
              <option value="completed" ${goal?.status === 'completed' ? 'selected' : ''}>Completed</option>
              <option value="pending" ${goal?.status === 'pending' ? 'selected' : ''}>Pending</option>
            </select>
          </div>
          <div class="modal-actions">
            <div class="left-actions">
              ${goal ? `
                <button type="button" class="btn-danger" onclick="deleteGoal(${goal.id}, this.closest('.modal'))">
                  🗑️ Delete Goal
                </button>
              ` : ''}
            </div>
            <div class="right-actions">
              <button type="submit" class="btn-primary">${goal ? 'Update Goal' : 'Create Goal'}</button>
              <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
            </div>
          </div>
        </form>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listener for tracking method change
    const trackingSelect = modal.querySelector('#goalTracking');
    const outcomeField = modal.querySelector('#outcomeField');
    const progressField = modal.querySelector('#progressField');
    
    trackingSelect.addEventListener('change', function() {
      if (this.value === 'outcome') {
        outcomeField.style.display = 'block';
        progressField.style.display = 'none';
      } else {
        outcomeField.style.display = 'none';
        progressField.style.display = 'block';
      }
    });
    
    // Add slider functionality
    const progressSlider = modal.querySelector('#goalProgress');
    const progressValue = modal.querySelector('#goalProgressValue');
    
    if (progressSlider) {
      progressSlider.addEventListener('input', function() {
        progressValue.textContent = `${this.value}%`;
      });
    }
    
    const form = modal.querySelector('#goalForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      saveGoal(goalId);
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  };

  // Add deleteGoal function
  window.deleteGoal = function(goalId, modalElement) {
    if (confirm('Are you sure you want to delete this goal? This action cannot be undone.')) {
      // Remove goal from array
      goals = goals.filter(g => g.id !== goalId);
      
      // Update localStorage
      localStorage.setItem("managerGoals", JSON.stringify(goals));
      
      // Close modal
      if (modalElement) {
        modalElement.remove();
      }
      
      // Refresh goals display
      renderGoals();
      
      // Show confirmation message
      showNotification('Goal deleted successfully', 'success');
    }
  };

  function saveGoal(goalId) {
    const trackingMethod = document.getElementById('goalTracking').value;
    
    const formData = {
      title: document.getElementById('goalTitle').value,
      type: document.getElementById('goalType').value,
      timeframe: document.getElementById('goalTimeframe').value,
      status: document.getElementById('goalStatus').value,
      trackingMethod: trackingMethod // Store tracking method
    };
    
    // Set either target or progress based on tracking method
    if (trackingMethod === 'outcome') {
      formData.target = document.getElementById('goalTarget').value;
      formData.progress = 0; // Reset progress for outcome-based goals
    } else {
      formData.progress = parseInt(document.getElementById('goalProgress').value) || 0;
      formData.target = ''; // Clear target for progress-based goals
    }
    
    if (goalId) {
      // Update existing goal
      const goalIndex = goals.findIndex(g => g.id === goalId);
      if (goalIndex !== -1) {
        goals[goalIndex] = { ...goals[goalIndex], ...formData };
      }
    } else {
      // Create new goal
      const newGoal = {
        id: Date.now(),
        ...formData,
        createdAt: new Date().toISOString()
      };
      goals.push(newGoal);
    }
    
    localStorage.setItem("managerGoals", JSON.stringify(goals));
    document.querySelector('.modal').remove();
    renderGoals();
    showNotification(goalId ? 'Goal updated successfully' : 'Goal created successfully', 'success');
  }

  window.editGoal = function(goalId) {
    window.openGoalModal(null, goalId);
  };

  /* ---------- PROGRESS LOG FUNCTIONALITY ---------- */
  function renderProgressLog() {
    const progressLogContent = qs("#progressLogContent");
    if (!progressLogContent) return;

    // Get all progress-based goals (both in-progress and completed) that are not archived
    const progressGoals = goals.filter(g => g.trackingMethod === 'progress' && !g.archived);
    
    // Sort by last updated date (most recent first)
    progressGoals.sort((a, b) => {
      const dateA = new Date(a.lastUpdated || a.createdAt);
      const dateB = new Date(b.lastUpdated || b.createdAt);
      return dateB - dateA;
    });

    if (progressGoals.length === 0) {
      progressLogContent.innerHTML = `
        <div class="progress-log-empty">
          <div class="icon">📊</div>
          <h3>No Progress Goals Yet</h3>
          <p>Create goals with progress tracking to see them here. Progress goals allow you to track completion percentage over time.</p>
          <button class="btn-primary" onclick="openGoalModal('team')">
            + Create Progress Goal
          </button>
        </div>
      `;
      return;
    }

    // Create progress log cards
    let progressLogHTML = `
      <div class="progress-log-cards">
        ${progressGoals.map(goal => {
          const lastUpdate = goal.lastUpdated || goal.createdAt;
          const updateDate = new Date(lastUpdate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });
          
          const statusClass = `status-${goal.status}`;
          
          return `
            <div class="progress-log-card">
              <div class="progress-log-header">
                <div>
                  <h3 class="progress-log-title">${goal.title}</h3>
                  <div class="progress-log-date">Timeframe: ${goal.timeframe}</div>
                </div>
                <div class="progress-log-meta">
                  <span class="status-badge ${statusClass}">${goal.status}</span>
                  <div class="progress-log-date">Updated: ${updateDate}</div>
                </div>
              </div>
              
              <div class="progress-log-progress">
                <div class="progress progress-lg">
                  <span style="width: ${goal.progress}%"></span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 8px;">
                  <span class="muted">Current Progress</span>
                  <span style="font-weight: 600; color: #3498DB;">${goal.progress}%</span>
                </div>
              </div>
              
              ${goal.lastNote ? `
                <div class="progress-log-note">
                  <p class="progress-log-note-text">${goal.lastNote}</p>
                  <div class="progress-log-note-date">Last note: ${new Date(goal.lastUpdated).toLocaleDateString()}</div>
                </div>
              ` : ''}
              
              <div class="progress-log-actions">
                <button class="btn-primary" onclick="openComprehensiveProgressModal(${goal.id})">
                  📈 Update Progress
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    progressLogContent.innerHTML = progressLogHTML;
  }

  // COMPREHENSIVE PROGRESS MODAL - COMBINES ALL FUNCTIONALITIES
  window.openComprehensiveProgressModal = function(goalId) {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 600px;">
        <h3>Manage Progress - ${goal.title}</h3>
        <form id="comprehensiveProgressForm" class="form-container" style="margin: 0;">
          <div class="input-group">
            <label for="progressUpdate">Progress Update Note</label>
            <textarea 
              id="progressUpdate" 
              rows="3" 
              placeholder="Describe what you've accomplished, challenges faced, or next steps..."
            >${goal.lastNote || ''}</textarea>
          </div>
          
          <div class="input-group">
            <label for="newProgress">Update Progress</label>
            <div class="slider-container">
              <input type="range" id="newProgress" class="slider" min="0" max="100" value="${goal.progress}">
              <span id="newProgressValue" class="slider-value">${goal.progress}%</span>
            </div>
          </div>
          
          <div class="progress-actions-grid">
            <button type="button" class="btn-primary" onclick="saveComprehensiveProgress(${goal.id})">
              💾 Save Progress & Note
            </button>
            
            ${goal.status !== 'completed' ? `
              <button type="button" class="btn-complete" onclick="markGoalCompleteFromModal(${goal.id}, this.closest('.modal'))">
                ✅ Mark Complete
              </button>
            ` : `
              <div class="completed-management">
                <button type="button" class="btn-archive" onclick="archiveGoalFromModal(${goal.id}, this.closest('.modal'))">
                  📁 Archive Goal
                </button>
                <button type="button" class="btn-danger" onclick="deleteGoalFromModal(${goal.id}, this.closest('.modal'))">
                  🗑️ Delete Goal
                </button>
              </div>
            `}
          </div>
          
          <div class="modal-actions" style="margin-top: 20px;">
            <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
          </div>
        </form>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add slider functionality
    const progressSlider = modal.querySelector('#newProgress');
    const progressValue = modal.querySelector('#newProgressValue');
    
    progressSlider.addEventListener('input', function() {
      progressValue.textContent = `${this.value}%`;
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  };

  // Save comprehensive progress function
  window.saveComprehensiveProgress = function(goalId) {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const progressSlider = document.getElementById('newProgress');
    const progressNote = document.getElementById('progressUpdate');
    const newProgress = parseInt(progressSlider.value);
    const note = progressNote.value;
    
    goal.progress = newProgress;
    goal.lastNote = note;
    goal.lastUpdated = new Date().toISOString();
    
    if (newProgress === 100) {
      goal.status = 'completed';
    } else if (goal.status === 'completed' && newProgress < 100) {
      goal.status = 'in-progress';
    }
    
    localStorage.setItem("managerGoals", JSON.stringify(goals));
    renderGoals();
    showNotification('Progress updated successfully!', 'success');
    
    // Close the modal
    const modal = document.querySelector('.modal');
    if (modal) modal.remove();
  };

  // Mark goal complete from modal
  window.markGoalCompleteFromModal = function(goalId, modalElement) {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    goal.progress = 100;
    goal.status = 'completed';
    goal.lastUpdated = new Date().toISOString();
    
    const progressNote = document.getElementById('progressUpdate');
    if (progressNote.value) {
      goal.lastNote = progressNote.value;
    } else if (!goal.lastNote) {
      goal.lastNote = 'Goal marked as completed.';
    }
    
    localStorage.setItem("managerGoals", JSON.stringify(goals));
    renderGoals();
    showNotification('Goal marked as completed!', 'success');
    
    if (modalElement) {
      modalElement.remove();
    }
  };

  // Archive goal from modal
  window.archiveGoalFromModal = function(goalId, modalElement) {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    goal.archived = true;
    goal.archivedAt = new Date().toISOString();
    
    localStorage.setItem("managerGoals", JSON.stringify(goals));
    renderGoals();
    showNotification('Goal archived successfully!', 'success');
    
    if (modalElement) {
      modalElement.remove();
    }
  };

  // Delete goal from modal
  window.deleteGoalFromModal = function(goalId, modalElement) {
    if (confirm('Are you sure you want to delete this goal? This action cannot be undone.')) {
      goals = goals.filter(g => g.id !== goalId);
      localStorage.setItem("managerGoals", JSON.stringify(goals));
      renderGoals();
      showNotification('Goal deleted successfully!', 'success');
      
      if (modalElement) {
        modalElement.remove();
      }
    }
  };

  // Add notification function
  function showNotification(message, type = 'info') {
    // Remove any existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
      existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-message">${message}</span>
        <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);
  }

  /* ---------- init once DOM is ready ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    // show ONLY the task page by default
    const start = localStorage.getItem("manager.activePage") || "taskPage";
    showPage(start === "userPage" ? "taskPage" : start);

    // header profile labels
    const email = sessionStorage.getItem("userEmail") || "manager@example.com";
    const name = sessionStorage.getItem("fullname") || email.split("@")[0];
    setText("#userNameDisplay", name);
    setText("#userNameMenu", name);
    setText("#userEmailMenu", email);

    // initial renders
    renderBoard();
    buildCalendar();
    renderGoals();

    // close menus when clicking outside
    window.addEventListener("click", (e)=>{
      if(!e.target.closest(".user-profile") && !e.target.closest(".user-menu")){
        qs("#userMenu")?.classList.remove("show");
      }
      const modal = qs("#logoutModal");
      if(e.target===modal) modal.style.display = "none";
    });
  });
})();