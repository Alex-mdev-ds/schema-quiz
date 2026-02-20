let current = 0;
let answers = new Array(QUESTIONS.length).fill(null);

const intro = document.getElementById("intro");
const quiz = document.getElementById("quiz");

const startBtn = document.getElementById("startBtn");
const backBtn = document.getElementById("backBtn");
const nextBtn = document.getElementById("nextBtn");

const questionText = document.getElementById("questionText");
const scale = document.getElementById("scale");
const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");
const shareBtn = document.getElementById("shareBtn");

startBtn.onclick = () => {
  intro.classList.remove("active");
  quiz.classList.add("active");
  render();
};

backBtn.onclick = () => {
  if (current > 0) current--;
  render();
};

nextBtn.onclick = () => {
  if (answers[current] == null) return;
  if (current < QUESTIONS.length - 1) {
    current++;
    render();
  } else {
  showResults();
}
};
function updateNextState() {
  nextBtn.disabled = answers[current] == null;
};

if (shareBtn) {
  shareBtn.onclick = async () => {
    const text = buildShareText();

    try {
      await navigator.clipboard.writeText(text);
      alert("Results copied to clipboard ✅");
    } catch {
      alert(text);
    }
  };
}



function buildShareText() {
  const results = calculateSchemas();

  let text = "My Early Maladaptive Schemas Results:\n\n";

  for (const [name, data] of Object.entries(results)) {
    text += `${name}: ${data.level} (${data.score})\n`;
  }

  return text;
}


function render() {
  const wrap = document.querySelector(".question-wrap");

  wrap.classList.add("slide-left");

  setTimeout(() => {
    const q = QUESTIONS[current];

    questionText.textContent = q.text;
    progressText.textContent = `${current + 1} of ${QUESTIONS.length}`;
    progressFill.style.width =
      ((current + 1) / QUESTIONS.length) * 100 + "%";

    renderScale();
    updateNextState();
    wrap.classList.remove("slide-left");
  }, 150);
}
// KEYBOARD CONTROLS
document.addEventListener("keydown", (e) => {
  // ignore on intro screen
  if (!quiz.classList.contains("active")) return;

  // numbers 1–6
  const num = parseInt(e.key);
  if (num >= 1 && num <= 6) {
    answers[current] = num;
    renderScale();
    updateNextState();
    return;
  }

  // right arrow = next
  if (e.key === "ArrowRight") {
    nextBtn.click();
  }

  // left arrow = back
  if (e.key === "ArrowLeft") {
    backBtn.click();
  }
});
const resultsScreen = document.getElementById("results");
const restartBtn = document.getElementById("restartBtn");

restartBtn.onclick = () => {
  location.reload();
};

function showResults() {
  quiz.classList.remove("active");
  results.classList.add("active");

  const schemaResults = calculateSchemas();
  renderRadar(schemaResults);
  renderSummary(schemaResults);
}
function calculateSchemas() {
  const results = {};

  for (const schema of SCHEMA_RANGES) {
    let sum = 0;

    for (let i = schema.start - 1; i <= schema.end - 1; i++) {
      const val = Number(answers[i] || 0);
      sum += val;
    }

    results[schema.name] = {
      score: sum,
      level: classify(sum)
    };
  }

  return results;
}
function classify(score) {
  if (score < 9) return "LOW";
  if (score < 19) return "MEDIUM";
  if (score < 31) return "HIGH";
  return "VERY HIGH";
}
function levelColor(level) {
  switch (level) {
    case "LOW": return "#7ED957";
    case "MEDIUM": return "#FFD166";
    case "HIGH": return "#FF8C42";
    case "VERY HIGH": return "#FF4D6D";
    default: return "#999";
  }
}
let radarInstance;

function renderRadar(scores) {
  const ctx = document.getElementById("radarChart");

  if (radarInstance) radarInstance.destroy();

  radarInstance = new Chart(ctx, {
    type: "radar",
    data: {
      labels: Object.keys(scores),
      datasets: [{
        label: "Schema intensity",
        data: Object.values(scores).map(s => s.score),
        fill: true,
      }]
    },
    options: {
      scales: {
        r: {
          min: 0,
          max: 60,
          ticks: { stepSize: 10 }
        }
      }
    }
  });
}
function renderSummary(results) {
  const container = document.getElementById("schemaSummary");

  let html = "<h3>Your Results</h3>";

  for (const [name, data] of Object.entries(results)) {
    html += `
  <div class="schema-row">
    <span class="schema-name">${name}</span>
    <span class="schema-level"
      style="color:${levelColor(data.level)}">
      ${data.level}
    </span>
    <span class="schema-score">${data.score}</span>
  </div>
`;
  }

  container.innerHTML = html;
}

function renderScale() {
  const scale = document.getElementById("scale");
  scale.innerHTML = "";

  for (let i = 1; i <= 6; i++) {
    const btn = document.createElement("button");
    btn.className = "circle";
    btn.textContent = i;

    // highlight selected
    if (answers[current] === i) {
      btn.classList.add("active");
    }

  btn.onclick = () => {
  answers[current] = Number(i); 
  renderScale();
  updateNextState();
};

    scale.appendChild(btn);
  }
}

