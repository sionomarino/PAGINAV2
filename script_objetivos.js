// script_objetivos.js - gestión local de objetivos (localStorage)
// Estructura objetivo: { id, mes (YYYY-MM), monto (number), avances: [{id,ts,monto}], createdAt }

(() => {
  const LS_KEY = "simi_objetivos_v1";

  // DOM
  const listado = document.getElementById("listadoObjetivos");
  const empty = document.getElementById("empty");
  const btnNuevo = document.getElementById("btnNuevo");
  const modal = document.getElementById("modal");
  const modalAv = document.getElementById("modalAvance");

  // forms
  const formObjetivo = document.getElementById("formObjetivo");
  const inputMes = document.getElementById("inputMes");
  const inputMonto = document.getElementById("inputMonto");
  const cancelModal = document.getElementById("cancelModal");

  const formAvance = document.getElementById("formAvance");
  const inputAvance = document.getElementById("inputAvance");
  const cancelAv = document.getElementById("cancelAvance");

  // state
  let objetivos = [];
  let editingId = null;
  let targetObjetivoForAvance = null;

  // utils
  function uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,6); }
  function save(){ localStorage.setItem(LS_KEY, JSON.stringify(objetivos)); }
  function load(){ try{ objetivos = JSON.parse(localStorage.getItem(LS_KEY)) || []; }catch(e){ objetivos = []; } }

  // render
  function render(){
    listado.innerHTML = "";
    if(!objetivos || objetivos.length === 0){
      empty.style.display = "block"; return;
    }
    empty.style.display = "none";

    // order by mes desc
    const orden = objetivos.slice().sort((a,b)=> b.mes.localeCompare(a.mes));
    orden.forEach(obj => {
      const totalAhorrado = (obj.avances || []).reduce((s,x)=> s + Number(x.monto || 0), 0);
      const pct = Math.min(100, Math.round((totalAhorrado / Number(obj.monto || 1)) * 100));
      const card = document.createElement("article");
      card.className = "obj-card";
      card.innerHTML = `
        <div class="obj-left">
          <div class="meta-month">${formatMonth(obj.mes)}</div>
          <div class="meta-sub">Meta: $ ${Number(obj.monto).toLocaleString()}</div>
          <div class="meta-sub small">Creado: ${new Date(obj.createdAt).toLocaleDateString()}</div>
        </div>

        <div class="obj-center">
          <div class="progress-wrap">
            <div class="progress-bar" aria-hidden="true">
              <div class="progress-fill" style="width:${pct}%;"></div>
            </div>
            <div class="progress-stats">
              <div>$ ${totalAhorrado.toLocaleString()}</div>
              <div>${pct}%</div>
            </div>
          </div>
          <div class="small">Registros: ${(obj.avances||[]).length}</div>
        </div>

        <div class="obj-right">
          <div class="action-row">
            <button class="btn" data-action="openAv" data-id="${obj.id}">+ Avance</button>
            <button class="btn" data-action="edit" data-id="${obj.id}">Editar</button>
            <button class="btn" data-action="view" data-id="${obj.id}">Ver</button>
            <button class="btn" data-action="del" data-id="${obj.id}">Eliminar</button>
          </div>
        </div>
      `;
      listado.appendChild(card);
    });

    // attach actions
    listado.querySelectorAll("[data-action]").forEach(btn => btn.addEventListener("click", onAction));
  }

  function formatMonth(yyyymm){
    if(!yyyymm) return "";
    const [y,m] = yyyymm.split("-");
    const date = new Date(Number(y), Number(m)-1, 1);
    return date.toLocaleString(undefined, { month:"long", year:"numeric" });
  }

  // actions
  function onAction(e){
    const action = e.currentTarget.dataset.action;
    const id = e.currentTarget.dataset.id;
    const obj = objetivos.find(o=>o.id===id);
    if(!obj) return;

    if(action === "openAv"){
      targetObjetivoForAvance = id;
      inputAvance.value = "";
      modalAv.classList.add("active");
    } else if(action === "edit"){
      editingId = id;
      inputMes.value = obj.mes;
      inputMonto.value = obj.monto;
      modal.classList.add("active");
      document.getElementById("modalTitle").textContent = "Editar objetivo";
    } else if(action === "view"){
      showDetail(obj);
    } else if(action === "del"){
      if(!confirm("Eliminar objetivo y sus avances?")) return;
      objetivos = objetivos.filter(x=>x.id!==id);
      save(); render();
    }
  }

  // show detail simple modal alert with avances
  function showDetail(obj){
    const lines = (obj.avances||[]).slice().reverse().map(a=> `${new Date(a.ts).toLocaleString()}: $ ${Number(a.monto).toLocaleString()}`).join("\n");
    alert(`Objetivo: ${formatMonth(obj.mes)}\nMeta: $ ${Number(obj.monto).toLocaleString()}\n\nAvances:\n${lines || "(Sin avances aún)"} `);
  }

  // create / edit submit
  formObjetivo.addEventListener("submit", (ev)=>{
    ev.preventDefault();
    const mes = inputMes.value;
    const monto = Number(inputMonto.value);
    if(!mes || !monto || monto<=0) return alert("Completá mes y monto válido.");
    if(editingId){
      objetivos = objetivos.map(o => o.id===editingId ? {...o, mes, monto} : o);
      editingId = null;
    } else {
      objetivos.push({ id: uid(), mes, monto, avances:[], createdAt: Date.now() });
    }
    save(); render(); modal.classList.remove("active");
  });
  cancelModal.addEventListener("click", ()=> { modal.classList.remove("active"); editingId = null; });

  // avance submit
  formAvance.addEventListener("submit", (ev)=>{
    ev.preventDefault();
    const amount = Number(inputAvance.value);
    if(!amount || amount<=0) return alert("Ingresá un monto válido.");
    const obj = objetivos.find(o=>o.id===targetObjetivoForAvance);
    if(!obj) return alert("Objetivo no encontrado.");
    obj.avances = obj.avances || [];
    obj.avances.push({ id: uid(), ts: Date.now(), monto: amount });
    save(); render(); modalAv.classList.remove("active");
  });
  cancelAv.addEventListener("click", ()=> { modalAv.classList.remove("active"); targetObjetivoForAvance = null; });

  // new button
  btnNuevo.addEventListener("click", ()=>{
    editingId = null;
    inputMes.value = "";
    inputMonto.value = "";
    document.getElementById("modalTitle").textContent = "Nuevo objetivo";
    modal.classList.add("active");
  });

  // return animation
  document.getElementById("volver").addEventListener("click", ()=>{
    document.body.classList.add("slide-left");
    setTimeout(()=> window.location.href = "menu.html", 600);
  });

  // init
  function init(){ load(); render(); }
  document.addEventListener("DOMContentLoaded", init);

})();
