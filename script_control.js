// script_control.js - control por IP para Emson
// Guarda dispositivos en localStorage, envía comandos /encender o /on, /apagar o /off

(() => {
  const LS_KEY = "simi_emsons_v1";

  // DOM
  const devicesRow = document.getElementById("devicesRow");
  const emptyState = document.getElementById("emptyState");
  const addBtn = document.getElementById("addBtn");
  const addFirstBtn = document.getElementById("addFirstBtn");
  const modalBackdrop = document.getElementById("modalBackdrop");
  let deviceForm, deviceNameInput, deviceIPInput, cancelBtn;

  // App state
  let devices = []; // { id, name, ip, primary }

  // Utils
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,6); }
  function save() { localStorage.setItem(LS_KEY, JSON.stringify(devices)); }
  function load() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      devices = raw ? JSON.parse(raw) : [];
    } catch(e) { devices = []; }
  }

  // Build card
  function renderDevices() {
    devicesRow.innerHTML = "";
    if (devices.length === 0) {
      emptyState.style.display = "block";
    } else {
      emptyState.style.display = "none";
      devices.forEach(d => {
        const card = document.createElement("div");
        card.className = "device-card";
        card.innerHTML = `
          <div class="device-row-top">
            <div>
              <div class="device-name">${escapeHtml(d.name)}</div>
              <div class="device-ip">${escapeHtml(d.ip)}</div>
            </div>
            <div style="text-align:right">
              <div class="kv">${d.primary ? "Principal" : ""}</div>
            </div>
          </div>

          <div style="display:flex;gap:10px;align-items:center;justify-content:flex-start;margin-top:6px;">
            <div id="status-${d.id}" class="status-pill status-off">Desconocido</div>
            <div style="flex:1"></div>
            <div class="kv">IP</div>
          </div>

          <div class="controls">
            <button class="btn primary" data-action="on" data-id="${d.id}">Encender</button>
            <button class="btn" data-action="off" data-id="${d.id}">Apagar</button>
          </div>

          <div class="actions-row">
            <button class="small-btn" data-action="setPrimary" data-id="${d.id}">${d.primary ? "★ Principal" : "☆ Hacer principal"}</button>
            <div>
              <button class="small-btn" data-action="edit" data-id="${d.id}">Editar</button>
              <button class="small-btn" data-action="delete" data-id="${d.id}">Eliminar</button>
            </div>
          </div>
        `;
        devicesRow.appendChild(card);

        // quick status check
        checkDeviceStatus(d).then(status => showStatus(d.id, status));
      });
    }
    // attach event listeners
    devicesRow.querySelectorAll("[data-action]").forEach(btn => {
      btn.onclick = handleDeviceAction;
    });
  }

  function escapeHtml(str = "") {
    return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[s]);
  }

  function showStatus(id, ok) {
    const el = document.getElementById(`status-${id}`);
    if (!el) return;
    if (ok === true) {
      el.className = "status-pill status-on";
      el.textContent = "Conectado";
    } else if (ok === false) {
      el.className = "status-pill status-off";
      el.textContent = "No responde";
    } else {
      el.className = "status-pill status-off";
      el.textContent = "Desconocido";
    }
  }

  // Try hit endpoints to determine if device online
  async function checkDeviceStatus(device) {
    // Try root, then /status, then / (fallback)
    const ip = device.ip.replace(/\/+$/,""); // trim trailing slash
    const urls = [
      `${ip}`, `${ip}/status`, `${ip}/estado`, `${ip}/info`
    ];
    for (const u of urls) {
      try {
        const res = await fetch(u, { method:"GET", cache:"no-store" , mode: "cors" });
        if (res && (res.ok || res.status === 401 || res.status === 403)) return true;
      } catch(e){}
    }
    return false;
  }

  // Send command (tries multiple routes)
  async function sendCommand(device, cmd) {
    // cmd === "on" or "off"
    const ip = device.ip.replace(/\/+$/,"");
    // prefer spanish routes, then english
    const routes = cmd === "on" ? ["/encender","/on","/turnOn","/gpio/on"] : ["/apagar","/off","/turnOff","/gpio/off"];
    for (const r of routes) {
      const url = ip + r;
      try {
        const res = await fetch(url, { method:"GET", mode:"cors" });
        if (res && (res.ok || res.status === 200 || res.status === 204)) {
          // good
          return { ok:true, url, status: res.status };
        }
      } catch (e) {
        // continue trying other routes
      }
    }
    // as last resort try base url with query
    try {
      const fallback = `${ip}?cmd=${cmd}`;
      const res = await fetch(fallback, { method:"GET", mode:"cors" });
      if (res && (res.ok || res.status === 200)) return { ok:true, url:fallback, status:res.status };
    } catch(e){}
    return { ok:false };
  }

  // Handle clicks on device buttons
  async function handleDeviceAction(ev) {
    const btn = ev.currentTarget;
    const action = btn.getAttribute("data-action");
    const id = btn.getAttribute("data-id");
    const device = devices.find(x => x.id === id);
    if (!device) return;

    if (action === "on" || action === "off") {
      // optimistic UI: set status spinner
      const statusEl = document.getElementById(`status-${id}`);
      if (statusEl) { statusEl.textContent = "Enviando..."; statusEl.className = "status-pill"; }
      const res = await sendCommand(device, action === "on" ? "on" : "off");
      if (res.ok) {
        showStatus(id, action === "on");
        flashCardSuccess(id);
      } else {
        showStatus(id, false);
        flashCardError(id);
      }
      return;
    }

    if (action === "edit") {
      openModalFor(device);
      return;
    }

    if (action === "delete") {
      if (!confirm(`Eliminar "${device.name}"?`)) return;
      devices = devices.filter(x => x.id !== id);
      save(); renderDevices();
      return;
    }

    if (action === "setPrimary") {
      devices = devices.map(x => ({ ...x, primary: x.id === id }));
      save(); renderDevices();
      return;
    }
  }

  // Tiny visual flashes
  function flashCardSuccess(id) {
    const card = document.querySelector(`[data-id="${id}"]`) || null;
    // fallback: we search by status-id parent
    const status = document.getElementById(`status-${id}`);
    const target = status ? status.closest(".device-card") : null;
    (target||card)?.animate([{ boxShadow:"0 0 8px rgba(59,214,113,0.2)" }, { boxShadow:"0 0 18px rgba(59,214,113,0.08)" }], { duration:700, easing:"ease" });
  }
  function flashCardError(id) {
    const status = document.getElementById(`status-${id}`);
    const target = status ? status.closest(".device-card") : null;
    (target)?.animate([{ transform:"translateY(0)" }, { transform:"translateY(-4px)" }, { transform:"translateY(0)" }], { duration:400, easing:"ease" });
  }

  // Modal management
  function ensureModalElements() {
    if (deviceForm) return;
    deviceForm = document.getElementById("deviceForm");
    deviceNameInput = document.getElementById("deviceName");
    deviceIPInput = document.getElementById("deviceIP");
    cancelBtn = document.getElementById("cancelBtn");

    deviceForm.addEventListener("submit", onSubmitDevice);
    cancelBtn.addEventListener("click", closeModal);
  }

  let editingId = null;
  function openModalFor(device = null) {
    ensureModalElements();
    editingId = device?.id ?? null;
    document.getElementById("modalBackdrop").classList.add("active");
    if (device) {
      document.getElementById("modalTitle").textContent = "Editar Emson";
      deviceNameInput.value = device.name;
      deviceIPInput.value = device.ip;
    } else {
      document.getElementById("modalTitle").textContent = "Agregar Emson";
      deviceForm.reset();
      deviceNameInput.value = "";
      deviceIPInput.value = "";
    }
    setTimeout(() => deviceNameInput.focus(), 120);
  }
  function closeModal() {
    document.getElementById("modalBackdrop").classList.remove("active");
    editingId = null;
  }

  function onSubmitDevice(ev) {
    ev.preventDefault();
    const name = deviceNameInput.value.trim();
    let ip = deviceIPInput.value.trim();
    if (!name || !ip) return alert("Completá nombre e IP.");

    // normalize ip: add protocol if missing
    if (!/^https?:\/\//i.test(ip)) ip = "http://" + ip;

    if (editingId) {
      devices = devices.map(d => d.id === editingId ? { ...d, name, ip } : d);
      editingId = null;
    } else {
      const newDev = { id: uid(), name, ip, primary: devices.length === 0 };
      devices.push(newDev);
    }
    save();
    renderDevices();
    closeModal();
  }

  // Event listeners for global controls
  function attachUI() {
    document.getElementById("addBtn").addEventListener("click", () => openModalFor(null));
    const addFirst = document.getElementById("addFirstBtn");
    if (addFirst) addFirst.addEventListener("click", () => openModalFor(null));

    // modal backdrop click closes
    const backdrop = document.getElementById("modalBackdrop");
    backdrop.addEventListener("click", (e) => { if (e.target === backdrop) closeModal(); });

    // back navigation with animation
    const volver = document.getElementById("volver");
    volver.addEventListener("click", () => {
      document.body.style.transition = "background 0.6s ease, transform 0.6s ease, opacity 0.6s ease";
      // change background color to match menu tone slightly
      document.body.style.background = "linear-gradient(135deg,#071029,#072b43)";
      document.getElementById("controlContainer").style.transform = "translateX(-110%)";
      document.getElementById("controlContainer").style.opacity = "0";
      setTimeout(() => { window.location.href = "menu.html"; }, 560);
    });
  }

  // On start
  function init() {
    load();
    attachUI();
    ensureModalElements();
    renderDevices();
    // periodic status recheck for visible devices
    setInterval(() => { devices.forEach(d => checkDeviceStatus(d).then(s => showStatus(d.id, s))); }, 15000);
  }

  // init DOM ready
  document.addEventListener("DOMContentLoaded", init);

})();
