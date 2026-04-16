function navigate(page) {
  // Animación de salida tipo "slide"
  document.body.style.transition = "opacity 0.5s ease, transform 0.5s ease";
  document.body.style.opacity = 0;
  document.body.style.transform = "translateX(-20px)";
  setTimeout(() => {
    window.location.href = page;
  }, 500);
}

// Inicializa los íconos Lucide
lucide.createIcons();
