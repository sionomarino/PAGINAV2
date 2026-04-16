// ---- CONFIGURACIÓN SUPABASE ----
const SUPABASE_URL = "https://cbngdegxmfzkstistitg.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNibmdkZWd4bWZ6a3N0aXN0aXRnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDI1NzMwNCwiZXhwIjoyMDY5ODMzMzA0fQ.7WfRx6xhub7lQqI62CH8BpV8KpczVJxlOtgvtTyB7No";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ---- CHART.JS CONFIG ----
const ctx = document.getElementById("graficoEnergia").getContext("2d");
const graficoEnergia = new Chart(ctx, {
  type: "line",
  data: {
    labels: [],
    datasets: [{
      label: "Consumo de Energía (kWh)",
      data: [],
      borderColor: "#58a6ff",
      backgroundColor: "rgba(88,166,255,0.2)",
      borderWidth: 2,
      fill: true,
      tension: 0.3,
    }]
  },
  options: {
    scales: {
      x: { ticks: { color: "#9ba3af" } },
      y: { ticks: { color: "#9ba3af" } }
    },
    plugins: {
      legend: { labels: { color: "#58a6ff" } }
    }
  }
});

// ---- ACTUALIZACIÓN DE DATOS ----
async function actualizarDatos() {
  try {
    const { data, error } = await supabaseClient
      .from("emmother_data")
      .select("voltaje, corriente, potencia, energia, costo, timestamp")
      .order("id", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Error al obtener datos:", error);
      return;
    }

    if (data && data.length > 0) {
      const d = data[0];
      document.getElementById("voltaje").textContent = d.voltaje?.toFixed(2) ?? "--";
      document.getElementById("corriente").textContent = d.corriente?.toFixed(3) ?? "--";
      document.getElementById("potencia").textContent = d.potencia?.toFixed(2) ?? "--";
      document.getElementById("energia").textContent = d.energia?.toFixed(3) ?? "--";
      document.getElementById("costo").textContent = d.costo?.toFixed(4) ?? "--";

      // Actualizar gráfico
      graficoEnergia.data.labels = data.map(d => new Date(d.timestamp).toLocaleTimeString());
      graficoEnergia.data.datasets[0].data = data.map(d => d.energia);
      graficoEnergia.update();
    }
  } catch (err) {
    console.error("Error inesperado:", err);
  }
}

actualizarDatos();
setInterval(actualizarDatos, 3000);

// ---- EFECTO DE DESLIZAMIENTO ----
const volverBtn = document.getElementById("volver");
volverBtn.addEventListener("click", () => {
  document.body.classList.add("slide-left");
  setTimeout(() => window.history.back(), 700);
});
