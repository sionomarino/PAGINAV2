// ==== Fondo de burbujas animadas ====
const canvas = document.getElementById('bubbleCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let bubbles = [];

for (let i = 0; i < 35; i++) {
  bubbles.push({
    x: Math.random() * canvas.width,
    y: canvas.height + Math.random() * canvas.height,
    r: Math.random() * 6 + 2,
    s: Math.random() * 2 + 1,
    a: Math.random() * 0.5 + 0.3
  });
}

function drawBubbles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  bubbles.forEach(b => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${b.a})`;
    ctx.fill();
    b.y -= b.s;
    if (b.y < -10) b.y = canvas.height + 10;
  });
  requestAnimationFrame(drawBubbles);
}

drawBubbles();

// ==== Transición al menú ====
document.getElementById('startButton').addEventListener('click', () => {
  document.body.style.transition = "opacity 0.8s ease, transform 0.8s ease";
  document.body.style.opacity = 0;
  document.body.style.transform = "translateY(-20px)";
  setTimeout(() => {
    window.location.href = "menu.html";
  }, 800);
});
