(function () {
  const PAGE_IDS = [
    "userPage",
    "taskPage",
    "goalPage",
  ];

  function qs(sel, ctx = document) { return ctx.querySelector(sel); }
  function qsa(sel, ctx = document) { return [...ctx.querySelectorAll(sel)]; }

  function showPage(id) {
    // Guard: fall back to first available page
    if (!PAGE_IDS.includes(id)) id = PAGE_IDS.find(x => qs("#" + x)) || PAGE_IDS[0];

    // Toggle sections
    qsa(".page").forEach(p => p.classList.remove("active"));
    const active = qs("#" + id);
    if (active) active.classList.add("active");

    // Toggle active dot
    qsa(".menu-dot").forEach(d => d.classList.remove("active"));
    const activeDot = qsa(`.menu-dot[data-target="${id}"]`)[0];
    if (activeDot) {
      activeDot.classList.add("active");
      activeDot.setAttribute("aria-current", "page");
    }

    // Title sync
    const nice = active?.getAttribute("data-title") || active?.querySelector(".h1")?.textContent || "Manager";
    document.title = `ProBoost – ${nice}`;

    // Persist
    localStorage.setItem("manager.activePage", id);
  }

  function bindNav() {
    qsa(".menu-dot").forEach(dot => {
      const tgt = dot.getAttribute("data-target");
      dot.addEventListener("click", () => showPage(tgt));
    });
  }

  function ensurePagesExist() {
    // Create minimal placeholders if a page section is missing.
    PAGE_IDS.forEach(id => {
      if (!qs("#" + id)) {
        const sec = document.createElement("section");
        sec.id = id;
        sec.className = "page";
        sec.setAttribute("data-title", id.replace(/Page$/, "").replace(/([A-Z])/g, " $1").trim());
        sec.innerHTML = `
          <h1 class="h1">${sec.getAttribute("data-title")}</h1>
          <div class="panel" style="margin:16px 6px">
            This page ("${id}") wasn't in the HTML, so I created a placeholder for you.
          </div>`;
        qs(".app").appendChild(sec);
      }
    });
  }

  // === User Settings ===
  function initUserSettingsPage() {
    const page = qs("#userPage");
    if (!page) return;        // nothing to do if that section doesn't exist

    // lightweight toast (uses a container with id="toasts" if present)
    const toastBox = qs("#toasts");
    function toast(msg, type = "success") {
      if (!toastBox) return;
      const div = document.createElement("div");
      div.className = "message " + (type === "error" ? "error" : "success");
      div.textContent = msg;
      toastBox.appendChild(div);
      setTimeout(() => div.remove(), 2500);
    }

    // ----- Avatar preview -----
    const avatar = qs("#avatar");
    const preview = qs("#avatarPreview");
    avatar?.addEventListener("change", (e) => {
      const f = e.target.files?.[0];
      if (!f) return;
      const url = URL.createObjectURL(f);
      if (preview) preview.src = url;
    });

    // ----- Save Profile -----
    qs("#saveProfile")?.addEventListener("click", () => {
      const data = {
        fullName: qs("#fullName")?.value || "",
        email: qs("#email")?.value || "",
        jobTitle: qs("#jobTitle")?.value || "",
        phone: qs("#phone")?.value || "",
      };
      localStorage.setItem("pb.profile", JSON.stringify(data));
      toast("Profile saved");
    });

    // ----- Save Preferences -----
    qs("#savePrefs")?.addEventListener("click", () => {
      const data = {
        theme: qs("#theme")?.value,
        lang: qs("#lang")?.value,
        notifEmail: !!qs("#notifEmail")?.checked,
        notifPush: !!qs("#notifPush")?.checked,
        weekly: !!qs("#weekly")?.checked,
      };
      localStorage.setItem("pb.prefs", JSON.stringify(data));
      toast("Preferences saved");
    });

    // ----- Save Team -----
    qs("#saveTeam")?.addEventListener("click", () => {
      const data = {
        role: qs("#role")?.value,
        workspace: qs("#workspace")?.value,
        mentions: !!qs("#mentions")?.checked,
        shareStatus: !!qs("#shareStatus")?.checked,
      };
      localStorage.setItem("pb.team", JSON.stringify(data));
      toast("Team settings saved");
    });

    // ----- Data export -----
    qs("#downloadData")?.addEventListener("click", () => {
      const bundle = {
        profile: JSON.parse(localStorage.getItem("pb.profile") || "{}"),
        prefs: JSON.parse(localStorage.getItem("pb.prefs") || "{}"),
        team: JSON.parse(localStorage.getItem("pb.team") || "{}"),
      };
      const blob = new Blob([JSON.stringify(bundle, null, 2)], {
        type: "application/json",
      });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "proboost-my-data.json";
      a.click();
      toast("Data exported");
    });

    // ----- Delete account (local clean-up) -----
    qs("#deleteAccount")?.addEventListener("click", () => {
      if (
        confirm(
          "This will remove your saved settings on this browser. Continue?"
        )
      ) {
        ["pb.profile", "pb.prefs", "pb.team"].forEach((k) =>
          localStorage.removeItem(k)
        );
        toast("Account data deleted", "error");
      }
    });

    // ----- Load saved values now (manager.js boot runs after DOMContentLoaded) -----
    const p = JSON.parse(localStorage.getItem("pb.profile") || "{}");
    if (p.fullName && qs("#fullName")) qs("#fullName").value = p.fullName;
    if (p.email && qs("#email")) qs("#email").value = p.email;
    if (p.jobTitle && qs("#jobTitle")) qs("#jobTitle").value = p.jobTitle;
    if (p.phone && qs("#phone")) qs("#phone").value = p.phone;

    const pr = JSON.parse(localStorage.getItem("pb.prefs") || "{}");
    if (pr.theme && qs("#theme")) qs("#theme").value = pr.theme;
    if (pr.lang && qs("#lang")) qs("#lang").value = pr.lang;
    if (typeof pr.notifEmail === "boolean" && qs("#notifEmail"))
      qs("#notifEmail").checked = pr.notifEmail;
    if (typeof pr.notifPush === "boolean" && qs("#notifPush"))
      qs("#notifPush").checked = pr.notifPush;
    if (typeof pr.weekly === "boolean" && qs("#weekly"))
      qs("#weekly").checked = pr.weekly;

    const t = JSON.parse(localStorage.getItem("pb.team") || "{}");
    if (t.role && qs("#role")) qs("#role").value = t.role;
    if (t.workspace && qs("#workspace")) qs("#workspace").value = t.workspace;
    if (typeof t.mentions === "boolean" && qs("#mentions"))
      qs("#mentions").checked = t.mentions;
    if (typeof t.shareStatus === "boolean" && qs("#shareStatus"))
      qs("#shareStatus").checked = t.shareStatus;
  }

  // === Task Management == //
  // Cards
  function tasksSeed() {
    return [
      {id:1,title:'Task Title',desc:'Description',status:'upcoming',priority:'High',assignee:'Alex',deadline:dateStr(2),tags:['UI']},
      {id:2,title:'Task Title',desc:'Description',status:'in-progress',priority:'Medium',assignee:'Sara',deadline:dateStr(4),tags:['API']},
      {id:3,title:'Task Title',desc:'Description',status:'completed',priority:'Low',assignee:'Me',deadline:dateStr(-1),tags:['Docs']},
      {id:4,title:'Task Title',desc:'Description',status:'pending',priority:'High',assignee:'Alex',deadline:dateStr(7),tags:['QA']}
    ];
  }
  function dateStr(offset){ const d=new Date(); d.setDate(d.getDate()+offset); return d.toISOString().slice(0,10); }

  // renderers only run if the relevant page exists
  function initTaskPage(){
    const page = qs("#taskPage"); if(!page) return;
    const state = { tasks: tasksSeed(), calCurrent: new Date() };

    function renderBoard(){
      qsa(".col .cards", page).forEach(c=>c.innerHTML='');
      const term = (qs("#searchInput", page)?.value || "").toLowerCase();
      state.tasks.forEach(t=>{
        if(term && !(`${t.title} ${t.desc} ${t.assignee}`.toLowerCase().includes(term))) return;
        const el = document.createElement('div'); el.className='card';
        el.innerHTML = `
          <div class="pill">${t.priority}</div>
          <div style="font-weight:700">${t.title}</div>
          <div class="muted">${t.desc||''}</div>
          <div class="thumb"></div>
          <div class="meta"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>
          <div class="card-foot">
            <span>${t.assignee||'-'}</span>
            <span class="pill">${t.deadline||'-'}</span>
          </div>`;
        const col = qs(`.col[data-status='${t.status}'] .cards`, page);
        if(col) col.appendChild(el);
      });
      updateOverview(); markCalendar();
    }

    function updateOverview(){
      const tb = qs('#overviewTable tbody', page);
      if(!tb) return;
      tb.innerHTML='';
      state.tasks.slice(0,5).forEach(t=>{
        const tr=document.createElement('tr');
        tr.innerHTML = `<td>${t.title}</td><td><span class='pill'>${t.status}</span></td><td>${t.assignee||'-'}</td><td>${t.deadline||'-'}</td><td>${(t.tags||[]).join(', ')}</td>`;
        tb.appendChild(tr);
      });
    }

    // Calendar
    function buildCalendar(){
      const y = state.calCurrent.getFullYear();
      const m = state.calCurrent.getMonth();
      const first = new Date(y, m, 1);
      const last  = new Date(y, m + 1, 0);
      
      const title = qs('#calTitle', page);
      if (title) title.textContent = `${first.toLocaleString('default', { month: 'long' })} ${y}`;
      
      const body = qs('#calBody', page);
      if (!body) return;
      body.innerHTML = '';
      
      const startDow = first.getDay();
      const lastDow  = last.getDay();   
      
      let day = 1;
      
      {
        const tr = document.createElement('tr');
        
        if (startDow > 0) {
          const pad = document.createElement('td');
          pad.className = 'pad';
          pad.colSpan = startDow;
          tr.appendChild(pad);
        }
        
        for (let c = startDow; c < 7 && day <= last.getDate(); c++) {
          tr.appendChild(dayCell(new Date(y, m, day++)));
        }
        body.appendChild(tr);
      }
      
      while (day + 6 <= last.getDate()) {
        const tr = document.createElement('tr');
        for (let c = 0; c < 7; c++) tr.appendChild(dayCell(new Date(y, m, day++)));
        body.appendChild(tr);
      }
      
      if (day <= last.getDate()) {
        const tr = document.createElement('tr');
        
        let c = 0;
        while (day <= last.getDate()) {
          tr.appendChild(dayCell(new Date(y, m, day++)));
          c++;
        }
        
        const rightPad = 7 - c;
        if (rightPad > 0) {
          const pad = document.createElement('td');
          pad.className = 'pad';
          pad.colSpan = rightPad;
          tr.appendChild(pad);
        }
        
        body.appendChild(tr);
      }
      
      markCalendar();
      function dayCell(date){
        const td = document.createElement('td');
        td.textContent = date.getDate();
        td.style.cursor = 'pointer';
        td.dataset.date = date.toISOString().slice(0,10);
        td.addEventListener('click', () => selectDay(date));
        return td;
      }
    }

    function selectDay(d){
      const label = d.toLocaleDateString(undefined,{day:'numeric',month:'long',year:'numeric'});
      const dayTitle = qs('#dayTitle', page); 
      if(dayTitle) dayTitle.textContent = label;
      // NEW: move selection to the clicked cell only
      qsa('#calBody td', page).forEach(td => td.classList.remove('is-selected'));
      const sel = qs(`#calBody td[data-date="${d.toISOString().slice(0,10)}"]`, page);
      sel?.classList.add('is-selected');
      
      const cont = qs('#dayItems', page);
      if(!cont) return;
      cont.innerHTML='';
      state.tasks
      .filter(t => t.deadline === d.toISOString().slice(0,10))
      .forEach(t=>{
        const div=document.createElement('div');
        div.className='panel'; 
        div.style.padding='10px';
        div.innerHTML = `<strong>${t.title}</strong><div class='muted'>${t.desc||''}</div>`;
        cont.appendChild(div);
      });
    }

    // wire controls
    const prevBtn = qsa("button.ghost", qs(".calendar header", page))[0];
    const nextBtn = qsa("button.ghost", qs(".calendar header", page))[1];
    prevBtn?.addEventListener("click", () => { state.calCurrent.setMonth(state.calCurrent.getMonth()-1); buildCalendar(); });
    nextBtn?.addEventListener("click", () => { state.calCurrent.setMonth(state.calCurrent.getMonth()+1); buildCalendar(); });

    qs("#sortSelect", page)?.addEventListener("change", ()=>{
      const by=qs("#sortSelect", page).value;
      state.tasks.sort((a,b)=>{
        if(by==='deadline') return (a.deadline||'').localeCompare(b.deadline||'');
        if(by==='assignee') return (a.assignee||'').localeCompare(b.assignee||'');
        const prio={High:0,Medium:1,Low:2}; return (prio[a.priority]??9)-(prio[b.priority]??9);
      });
      renderBoard();
    });
    qs("#searchInput", page)?.addEventListener("input", renderBoard);

    // boot
    renderBoard(); buildCalendar();
  }

  function initGoalPage(){
    const page = qs("#goalPage"); if(!page) return;
    const goals = {
      personal: [
        {title:'Learn New Software Skill', type:'Skill', timeframe:'2 Months', outcome:'Course completion certificate (Adobe Illustrator)', status:'Active'},
        {title:'Fitness Goal', type:'Health', timeframe:'3 Months', outcome:'Improve health and energy for work.', status:'Active'},
        {title:'Productivity Habit', type:'Habit', timeframe:'Weekly', outcome:'Align weekly tasks with long-term goals', status:'Active'}
      ],
      team: [
        {title:'Career Growth', type:'Development', timeframe:'1 Months', progress:50, status:'On Track'},
        {title:'Skill Development', type:'Training', timeframe:'3 Months', progress:80, status:'On Track'},
        {title:'Innovation & Creativity', type:'Culture', timeframe:'5 Months', progress:60, status:'At Risk'}
      ]
    };

    function renderGoals(){
      const pbody = qs('#personalGoals tbody', page); if(pbody){ pbody.innerHTML='';
        goals.personal.forEach(g=>{
          const tr=document.createElement('tr');
          tr.innerHTML = `<td>${g.title}</td><td>${g.type}</td><td>${g.timeframe}</td><td>${g.outcome}</td><td>${g.status}</td>`;
          pbody.appendChild(tr);
        });
      }
      const tbody = qs('#teamGoals tbody', page); if(tbody){ tbody.innerHTML='';
        goals.team.forEach(g=>{
          const tr=document.createElement('tr');
          tr.innerHTML = `<td>${g.title}</td><td>${g.type}</td><td>${g.timeframe}</td>
            <td><div class='progress'><span style='width:${g.progress || 0}%'></span></div></td>
            <td>${g.status}</td>`;
          tbody.appendChild(tr);
        });
      }
      const achieved = goals.personal.filter(x=>x.status==='Done').length + goals.team.filter(x=>x.progress===100).length;
      const total = goals.personal.length + goals.team.length;
      const donutLabel = qs('#donutLabel', page), donutSub = qs('#donutSub', page);
      if(donutLabel) donutLabel.textContent = `${achieved}/${total} Goals Achieved`;
      if(donutSub) donutSub.textContent = `${achieved}/${total} Goals Achieved`;
    }
    renderGoals();
  }

  // ===== Boot
  document.addEventListener("DOMContentLoaded", () => {
    ensurePagesExist();
    bindNav();
    initTaskPage();
    initGoalPage();

    const stored = localStorage.getItem("manager.activePage");
    showPage(stored || "taskPage");
  });
})();
