// manager.js
(function () {
  /* ---------- tiny helpers ---------- */
  const qs = (s, c = document) => c.querySelector(s);
  const qsa = (s, c = document) => [...c.querySelectorAll(s)];
  const setText = (sel, txt) => { const el = qs(sel); if (el) el.textContent = txt; };

  // Expose one function that always shows EXACTLY one page.
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


  /* ---------- minimal demo data so pages won’t look empty ---------- */
  let tasks = JSON.parse(localStorage.getItem("managerTasks") || "[]");
  if (!tasks.length) {
    const iso = (o)=>{const d=new Date();d.setDate(d.getDate()+o);return d.toISOString().slice(0,10);};
    tasks = [
      {id:1,title:"Review Q1 Reports",desc:"Analyze metrics",status:"upcoming",priority:"High",assignee:"John",deadline:iso(2),tags:["reports"]},
      {id:2,title:"Team Sync",desc:"Weekly standup",status:"in-progress",priority:"Medium",assignee:"Sarah",deadline:iso(4),tags:["meeting"]},
      {id:3,title:"Project Planning",desc:"Q4 scope",status:"completed",priority:"Low",assignee:"Mike",deadline:iso(-1),tags:["planning"]},
      {id:4,title:"Budget Review",desc:"Dept budget",status:"pending",priority:"High",assignee:"Alex",deadline:iso(7),tags:["finance"]},
    ];
    localStorage.setItem("managerTasks", JSON.stringify(tasks));
  }

  /* ---------- simple renders so Task/Goals/Calendar show content ---------- */
  function fmt(dateStr){
    return new Date(dateStr).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
  }

  function renderBoard(){
    const cols = qsa(".col");
    cols.forEach(c => c.querySelector(".cards").innerHTML = "");
    const term = (qs("#searchInput")?.value || "").toLowerCase();
    tasks.forEach(t=>{
      const hay = `${t.title} ${t.desc} ${t.assignee} ${(t.tags||[]).join(" ")}`.toLowerCase();
      if (term && !hay.includes(term)) return;
      const el = document.createElement("div");
      el.className = "card";
      el.innerHTML = `
        <h4>${t.title}</h4>
        <p>${t.desc||""}</p>
        <div class="thumb"></div>
        <div class="meta">
          <span class="pill priority-${t.priority.toLowerCase()}">${t.priority}</span>
          <span class="dot"></span>
          <span>${t.assignee}</span>
        </div>
        <div class="card-foot"><span>${fmt(t.deadline)}</span><span>⋯</span></div>`;
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

  /* ---------- calendar (month view + day list like wireframe) ---------- */
  let calDate = new Date();
  function buildCalendar(){
    const y = calDate.getFullYear(), m = calDate.getMonth();
    const first = new Date(y,m,1), last = new Date(y,m+1,0);
    const start = first.getDay(), days = last.getDate();
    setText("#calTitle", first.toLocaleString(undefined,{month:'long',year:'numeric'}));
    const body = qs("#calBody"); if(!body) return;
    body.innerHTML = "";
    let d=1;
    for(let i=0;i<6;i++){
      const tr = document.createElement("tr");
      for(let j=0;j<7;j++){
        const td = document.createElement("td");
        if(i===0 && j<start || d>days){ td.classList.add("pad"); }
        else{
          const cellDate = new Date(y,m,d);
          const iso = cellDate.toISOString().slice(0,10);
          td.textContent = d;
          td.dataset.date = iso;
          td.style.cursor = "pointer";
          td.addEventListener("click", ()=>selectDay(cellDate));
          // select today
          const now = new Date();
          if(d===now.getDate() && m===now.getMonth() && y===now.getFullYear()){
            td.classList.add("is-selected");
            selectDay(cellDate);
          }
          d++;
        }
        tr.appendChild(td);
      }
      body.appendChild(tr);
      if(d>days) break;
    }
    markCalendar();
  }
  function markCalendar(){
    qsa("#calBody td").forEach(td=>{
      const ds = td.dataset.date;
      if(!ds) return td.classList.remove("cal-mark");
      const has = tasks.some(t=>t.deadline===ds);
      td.classList.toggle("cal-mark", has);
    });
  }
  function selectDay(date){
    setText("#dayTitle", date.toLocaleDateString(undefined,{weekday:'long',year:'numeric',month:'long',day:'numeric'}));
    qsa("#calBody td").forEach(td=>td.classList.remove("is-selected"));
    qs(`#calBody td[data-date="${date.toISOString().slice(0,10)}"]`)?.classList.add("is-selected");
    const box = qs("#dayItems"); if(!box) return;
    box.innerHTML = "";
    const list = tasks.filter(t=>t.deadline===date.toISOString().slice(0,10));
    if(!list.length){ box.innerHTML = `<p class="muted">No tasks scheduled for this day</p>`; return; }
    list.forEach(t=>{
      const div = document.createElement("div");
      div.className = "task-item";
      div.innerHTML = `<div><strong>${t.title}</strong><div class="muted">${t.assignee} • ${t.priority}</div></div><span class="pill">${t.status}</span>`;
      box.appendChild(div);
    });
  }
  window.prevMonth = ()=>{ calDate.setMonth(calDate.getMonth()-1); buildCalendar(); };
  window.nextMonth = ()=>{ calDate.setMonth(calDate.getMonth()+1); buildCalendar(); };

  /* ---------- goal page (tables + donut) ---------- */
  let goals = JSON.parse(localStorage.getItem("managerGoals") || "[]");
  if (!goals.length){
    goals = [
      {id:101,title:"Increase Team Productivity",type:"team",timeframe:"Q4 2025",progress:60,status:"in-progress",target:"20% improvement"},
      {id:102,title:"Leadership Training",type:"personal",timeframe:"Oct 2025",progress:40,status:"in-progress",target:"Certification"},
      {id:103,title:"Ship v1.2",type:"team",timeframe:"Nov 2025",progress:100,status:"completed",target:"Release"},
    ];
    localStorage.setItem("managerGoals", JSON.stringify(goals));
  }

  function renderGoals(){
    const pbody = qs("#personalGoals tbody");
    const tbody = qs("#teamGoals tbody");
    if (pbody) pbody.innerHTML = "";
    if (tbody) tbody.innerHTML = "";

    goals.filter(g=>g.type==="personal").forEach(g=>{
      pbody?.insertAdjacentHTML("beforeend",
        `<tr><td>${g.title}</td><td>${g.type}</td><td>${g.timeframe}</td><td>${g.target}</td><td><span class="pill">${g.status}</span></td></tr>`);
    });
    goals.filter(g=>g.type==="team").forEach(g=>{
      tbody?.insertAdjacentHTML("beforeend",
        `<tr><td>${g.title}</td><td>${g.type}</td><td>${g.timeframe}</td>
         <td><div class="progress"><span style="width:${g.progress||0}%"></span></div><small>${g.progress||0}%</small></td>
         <td><span class="pill">${g.status}</span></td></tr>`);
    });

    const achieved = goals.filter(g=>g.status==="completed").length;
    const total = goals.length, pct = total? Math.round(achieved/total*100):0;
    const donut = qs("#donut");
    setText("#donutLabel", `${achieved}/${total} Goals Achieved`);
    setText("#donutSub", `${pct}% Complete`);
    if (donut){
      donut.style.background = `
        radial-gradient(closest-side, transparent 66%, rgba(255,255,255,.6) 67%, rgba(255,255,255,.6) 70%, transparent 71%),
        conic-gradient(#3498DB 0% ${pct}%, rgba(180,215,241,.5) ${pct}% 100%)`;
    }
  }

  // Minimal modal placeholders
  window.openTaskModal = ()=>alert("Task modal (placeholder)");
  window.openGoalModal = ()=>alert("Goal modal (placeholder)");
  window.openProgressModal = ()=>alert("Progress modal (placeholder)");

  /* ---------- init once DOM is ready ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    // show ONLY the task page by default
    const start = localStorage.getItem("manager.activePage") || "taskPage";
    showPage(start === "userPage" ? "taskPage" : start);

    // header profile labels
    const email = sessionStorage.getItem("userEmail") || "manager@example.com";
    const name = email.split("@")[0];
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