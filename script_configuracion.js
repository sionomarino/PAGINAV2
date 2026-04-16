// script_configuracion.js - Configuración de idioma y tema + enlace de ayuda

(() => {
  const themeSwitch = document.getElementById("themeSwitch");
  const langSwitch = document.getElementById("langSwitch");

  // Keys de almacenamiento
  const THEME_KEY = "simi_theme";
  const LANG_KEY = "simi_lang";

  // Cargar configuración previa
  const savedTheme = localStorage.getItem(THEME_KEY) || "light";
  const savedLang = localStorage.getItem(LANG_KEY) || "es";

  // Aplicar tema
  if(savedTheme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    themeSwitch.checked = true;
    document.getElementById("themeLabel").textContent = "Oscuro";
  }

  // Aplicar idioma
  if(savedLang === "en") {
    langSwitch.checked = true;
    setLang("en");
  } else setLang("es");

  // Cambiar idioma
  langSwitch.addEventListener("change", ()=>{
    const newLang = langSwitch.checked ? "en" : "es";
    setLang(newLang);
    localStorage.setItem(LANG_KEY, newLang);
  });

  // Cambiar tema
  themeSwitch.addEventListener("change", ()=>{
    const newTheme = themeSwitch.checked ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
    document.getElementById("themeLabel").textContent = newTheme==="dark" ? "Oscuro" : "Claro";
  });

  // Traducciones básicas (solo configuración)
  function setLang(lang){
    const es = {
      title: "Configuración",
      langTitle: "Idioma / Language",
      langDesc: "Cambia el idioma de toda la interfaz.",
      langLabel: "Español",
      themeTitle: "Tema",
      themeDesc: "Seleccioná entre tema claro u oscuro.",
      themeLabel: "Claro",
      helpTitle: "Ayuda / Help",
      helpDesc: "¿Tenés dudas o necesitás asistencia?",
      contactBtn: "Contáctanos"
    };
    const en = {
      title: "Settings",
      langTitle: "Language / Idioma",
      langDesc: "Change the language of the interface.",
      langLabel: "English",
      themeTitle: "Theme",
      themeDesc: "Select between light or dark mode.",
      themeLabel: "Light",
      helpTitle: "Help / Ayuda",
      helpDesc: "Do you have questions or need assistance?",
      contactBtn: "Contact us"
    };
    const dict = lang==="en" ? en : es;
    for(const [id, text] of Object.entries(dict)){
      const el = document.getElementById(id);
      if(el) el.textContent = text;
    }
  }

  // Animación volver al menú
  document.getElementById("volver").addEventListener("click", ()=>{
    document.body.classList.add("slide-left");
    setTimeout(()=> window.location.href = "menu.html", 600);
  });
})();
