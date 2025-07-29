// 🧠 Trait Data (mock for now — replace with live sync)
const traitData = {
  population: 38,
  speed: 2.5,
  size: 3.2,
  lifespan: 70,
  sense: 1.8,
  mutationRate: 0.05,
  season: "Spring",
  births: 93,
  deaths: 61,
  food: 420
};

// 🌐 DOM Elements
const radarCanvas = document.getElementById("radarChart");
const mutationEl = document.getElementById("graphMutation");
const seasonEl = document.getElementById("graphSeason");
const creaturesEl = document.getElementById("graphCreatures");
const birthsEl = document.getElementById("graphBirths");
const deathsEl = document.getElementById("graphDeaths");
const foodEl = document.getElementById("graphFood");

// 📊 Chart.js Radar Setup
const radarChart = new Chart(radarCanvas, {
  type: 'radar',
  data: {
    labels: ["Population", "Speed", "Size", "Lifespan", "Sense"],
    datasets: [{
      label: "Creature Traits",
      data: [
        traitData.population,
        traitData.speed,
        traitData.size,
        traitData.lifespan,
        traitData.sense
      ],
      backgroundColor: "rgba(76, 175, 80, 0.2)",
      borderColor: "rgba(76, 175, 80, 1)",
      borderWidth: 2,
      pointBackgroundColor: "green"
    }]
  },
  options: {
    responsive: true,
    scales: {
      r: {
        angleLines: { display: true },
        suggestedMin: 0,
        suggestedMax: 100
      }
    },
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: "Trait Distribution"
      }
    }
  }
});

// 🔄 Auto Refresh Function
function updateRadarStats() {
  // Pull trait data — replace this with actual live sync
  radarChart.data.datasets[0].data = [
    traitData.population,
    traitData.speed,
    traitData.size,
    traitData.lifespan,
    traitData.sense
  ];
  radarChart.update();

  // Update textual stats
  mutationEl.textContent = traitData.mutationRate.toFixed(2);
  seasonEl.textContent = traitData.season;
  creaturesEl.textContent = traitData.population;
  birthsEl.textContent = traitData.births;
  deathsEl.textContent = traitData.deaths;
  foodEl.textContent = traitData.food;
}

// 🕓 Loop every 2 seconds
setInterval(updateRadarStats, 2000);
