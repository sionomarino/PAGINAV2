const translations = {
  es: {
    settingsTitle: "Configuración",
    language: "Idioma",
    theme: "Tema",
    toggleTheme: "Cambiar a modo oscuro",
    help: "Ayuda",
    contactText: "¿Necesitás ayuda? Contactanos en:",
  },
  en: {
    settingsTitle: "Settings",
    language: "Language",
    theme: "Theme",
    toggleTheme: "Switch to dark mode",
    help: "Help",
    contactText: "Need help? Contact us at:",
  },
};

// idioma guardado
const lang = localStorage.getItem("lang") || "es";

// aplicar traducción
function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    el.textContent = translations[lang][key] || el.textContent;
  });
}

// cambiar idioma
function setLanguage(newLang) {
  localStorage.setItem("lang", newLang);
  location.reload(); // actualiza todo
}
