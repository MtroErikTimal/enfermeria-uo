(() => {
  "use strict";

  const options = [
    {
      id: "red-liquid",
      name: "Recipiente hermético rojo",
      color: "#c62828",
      description: "Sangre líquida",
    },
    {
      id: "red-bag",
      name: "Bolsa roja",
      color: "#ef4444",
      description: "Cultivos y residuos no anatómicos sólidos",
    },
    {
      id: "yellow-bag",
      name: "Bolsa amarilla",
      color: "#eab308",
      description: "Residuos patológicos sólidos",
    },
    {
      id: "yellow-liquid",
      name: "Recipiente hermético amarillo",
      color: "#ca8a04",
      description: "Residuos patológicos líquidos",
    },
    {
      id: "red-sharps",
      name: "Recipiente rígido rojo",
      color: "#b91c1c",
      description: "Objetos punzocortantes RPBI",
    },
  ];

  const questions = [
    {
      id: 1,
      image: "🩸",
      item: "Sangre líquida",
      context: "Muestra de sangre líquida generada durante la atención.",
      correct: "red-liquid",
      explanation:
        "La sangre y sus componentes en forma líquida se depositan en un recipiente hermético rojo.",
    },
    {
      id: 2,
      image: "🧫",
      item: "Cultivo microbiológico",
      context: "Cultivo sólido generado en el laboratorio.",
      correct: "red-bag",
      explanation:
        "Los cultivos y cepas de agentes biológico-infecciosos y sus utensilios desechables se clasifican como RPBI. Para los residuos sólidos se utiliza bolsa roja.",
    },
    {
      id: 3,
      image: "🧬",
      item: "Tejido humano",
      context: "Tejido quirúrgico que no se encuentra en formol.",
      correct: "yellow-bag",
      explanation:
        "Los residuos patológicos sólidos que cumplen los criterios de la NOM-087 se depositan en bolsa amarilla.",
    },
    {
      id: 4,
      image: "💉",
      item: "Aguja usada",
      context: "Aguja que estuvo en contacto con un paciente.",
      correct: "red-sharps",
      explanation:
        "Las agujas y otros punzocortantes que cumplen los criterios de RPBI se depositan en un recipiente rígido rojo. No deben reencapucharse ni manipularse innecesariamente.",
    },
    {
      id: 5,
      image: "🩹",
      item: "Material de curación saturado",
      context: "Gasa empapada de sangre durante una curación.",
      correct: "red-bag",
      explanation:
        "Los materiales de curación empapados, saturados o goteando sangre son residuos no anatómicos sólidos y van en bolsa roja.",
    },
    {
      id: 6,
      image: "🧪",
      item: "Muestra patológica líquida",
      context: "Muestra biológica patológica que cumple los criterios de la norma.",
      correct: "yellow-liquid",
      explanation:
        "Los residuos patológicos líquidos que cumplen la definición de la NOM-087 se depositan en recipiente hermético amarillo.",
    },
    {
      id: 7,
      image: "🩸",
      item: "Recipiente con sangre líquida",
      context: "Recipiente desechable que contiene sangre líquida.",
      correct: "red-bag",
      explanation:
        "La NOM-087 incluye los recipientes desechables que contienen sangre líquida dentro de los residuos no anatómicos. En esta actividad se considera el recipiente sólido como residuo no anatómico que va en bolsa roja. La sangre líquida por separado va en recipiente hermético rojo.",
    },
    {
      id: 8,
      image: "🔬",
      item: "Material desechable de cultivo",
      context: "Utensilio desechable utilizado para transferir un cultivo infeccioso.",
      correct: "red-bag",
      explanation:
        "Los utensilios desechables empleados para contener, transferir, inocular o mezclar cultivos se consideran dentro de la categoría de cultivos y cepas.",
    },
    {
      id: 9,
      image: "🗡️",
      item: "Hoja de bisturí usada",
      context: "Punzocortante que estuvo en contacto con una muestra biológica.",
      correct: "red-sharps",
      explanation:
        "Las hojas de bisturí y otros punzocortantes incluidos en la norma van en un recipiente rígido rojo, resistente a perforaciones y con cierre seguro.",
    },
    {
      id: 10,
      image: "🧻",
      item: "Papel de envoltura limpio",
      context: "Envoltura exterior limpia, sin contaminación biológica.",
      correct: "ordinary",
      explanation:
        "No todo residuo generado en un hospital es RPBI. La envoltura limpia se separa como residuo común según el sistema institucional.",
    },
  ];

  const allOptions = [
    ...options,
    {
      id: "ordinary",
      name: "Residuo común",
      color: "#64748b",
      description: "Material no contaminado y no clasificado como RPBI",
    },
  ];

  const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);

  const state = {
    items: shuffle(questions),
    index: 0,
    score: 0,
    selected: null,
    finished: false,
  };

  function getCurrent() {
    return state.items[state.index];
  }

  function renderGame() {
    const root = document.getElementById("rpbiGame");
    if (!root) return;

    const current = getCurrent();
    const correctOption = allOptions.find((option) => option.id === current.correct);

    if (state.finished) {
      const scorePct = Math.round((state.score / state.items.length) * 100);
      root.innerHTML = `
        <div style="max-width:850px;margin:0 auto;padding:20px;color:#172033;font-family:system-ui,sans-serif;">
          <div style="padding:28px;border-radius:20px;border:1px solid #dbe3ed;text-align:center;background:#ffffff;">
            <div style="font-size:64px;">${state.score >= 8 ? "🏆" : state.score >= 6 ? "👏" : "📚"}</div>
            <h2 style="margin:12px 0;">¡Misión completada!</h2>
            <p>Obtuviste <strong>${state.score} de ${state.items.length}</strong> respuestas correctas.</p>
            <p style="font-size:32px;font-weight:800;margin:12px 0;">${scorePct}%</p>
            <p style="margin-bottom:20px;">
              ${state.score >= 8
                ? "Excelente trabajo. Continúa aplicando las normas de bioseguridad."
                : "Repasa los tipos de RPBI y vuelve a intentarlo."}
            </p>
            <button id="rpbiRestart" style="background:#123d35;color:white;border:0;padding:14px 22px;border-radius:10px;font-weight:700;cursor:pointer;">
              🔄 Jugar de nuevo
            </button>
          </div>
        </div>
      `;

      document.getElementById("rpbiRestart").addEventListener("click", restartGame);
      return;
    }

    root.innerHTML = `
      <main style="max-width:850px;margin:0 auto;padding:20px;font-family:system-ui,sans-serif;color:#172033;">
        <header style="background:#123d35;color:white;padding:24px;border-radius:20px;margin-bottom:20px;">
          <div style="font-size:12px;letter-spacing:2px;">SIMULADOR EDUCATIVO DE ENFERMERÍA</div>
          <h1 style="margin:8px 0 0;">♻️ Misión RPBI</h1>
          <p style="margin:8px 0 0;">Identifica cada residuo y deposítalo correctamente.</p>
        </header>

        <section style="display:flex;justify-content:space-between;gap:12px;margin-bottom:12px;flex-wrap:wrap;">
          <strong>Pregunta ${state.index + 1} de ${state.items.length}</strong>
          <strong>⭐ Puntos: ${state.score}</strong>
        </section>

        <div style="height:8px;background:#e2e8f0;border-radius:10px;margin-bottom:20px;overflow:hidden;">
          <div style="height:100%;width:${((state.index + 1) / state.items.length) * 100}%;background:#16a34a;transition:width .3s;"></div>
        </div>

        <section style="border:1px solid #e2e8f0;border-radius:18px;padding:24px;margin-bottom:20px;text-align:center;background:#f8fafc;">
          <div style="font-size:76px;">${current.image}</div>
          <h2 style="margin-bottom:8px;">${current.item}</h2>
          <p>${current.context}</p>
          <p style="font-weight:600;">¿Dónde debes depositar este residuo?</p>
        </section>

        <h3>Selecciona el contenedor</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;">
          ${allOptions
            .map((option) => {
              const isCorrect = option.id === current.correct;
              const isSelected = option.id === state.selected;

              let background = "#ffffff";
              let border = "1px solid #dbe3ed";

              if (state.selected && isCorrect) {
                background = "#dcfce7";
                border = "2px solid #16a34a";
              } else if (isSelected && !isCorrect) {
                background = "#fee2e2";
                border = "2px solid #dc2626";
              }

              const opacity = state.selected && !isCorrect && !isSelected ? 0.65 : 1;

              return `
                <button
                  type="button"
                  data-option-id="${option.id}"
                  style="padding:14px;border-radius:12px;border:${border};background:${background};color:#172033;text-align:left;cursor:${state.selected ? "default" : "pointer"};font-size:14px;width:100%;opacity:${opacity};"
                  ${state.selected !== null ? "disabled" : ""}
                >
                  <div style="display:flex;gap:12px;align-items:center;">
                    <div style="width:40px;height:48px;border-radius:8px;flex-shrink:0;background:${option.color};border:2px solid #ffffff;box-shadow:0 0 0 1px #cbd5e1;"></div>
                    <div>
                      <strong>${option.name}</strong>
                      <div style="font-size:12px;color:#64748b;margin-top:4px;">${option.description}</div>
                    </div>
                  </div>
                </button>
              `;
            })
            .join("")}
        </div>

        ${state.selected !== null ? `
          <section aria-live="polite" style="margin-top:20px;padding:18px;border-radius:14px;background:${state.selected === current.correct ? "#dcfce7" : "#fef3c7"};border:1px solid #d1d5db;">
            <h3 style="margin-top:0;">${state.selected === current.correct ? "✅ ¡Correcto!" : "📘 Sigue aprendiendo"}</h3>
            <p><strong>Clasificación:</strong> ${correctOption ? correctOption.name : "Residuo común"}</p>
            <p>${current.explanation}</p>
            <button id="rpbiNext" style="background:#123d35;color:white;border:0;padding:12px 20px;border-radius:10px;font-weight:700;cursor:pointer;">
              ${state.index + 1 === state.items.length ? "Ver resultado" : "Siguiente residuo →"}
            </button>
          </section>
        ` : ""}
      </main>
    `;

    root.querySelectorAll("[data-option-id]").forEach((btn) => {
      btn.addEventListener("click", () => answerQuestion(btn.dataset.optionId));
    });

    const nextButton = document.getElementById("rpbiNext");
    if (nextButton) {
      nextButton.addEventListener("click", nextQuestion);
    }
  }

  function answerQuestion(optionId) {
    if (state.selected !== null || state.finished) return;

    state.selected = optionId;

    if (optionId === getCurrent().correct) {
      state.score += 1;
    }

    renderGame();
  }

  function nextQuestion() {
    if (state.index + 1 >= state.items.length) {
      state.finished = true;
      renderGame();
      return;
    }

    state.index += 1;
    state.selected = null;
    renderGame();
  }

  function restartGame() {
    state.items = shuffle(questions);
    state.index = 0;
    state.score = 0;
    state.selected = null;
    state.finished = false;
    renderGame();
  }

  function init() {
    const target = document.getElementById("rpbiGame");
    if (!target) return;
    renderGame();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
