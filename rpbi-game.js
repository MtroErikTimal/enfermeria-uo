(() => {
  "use strict";

  const options = [
    {
      id: "red-liquid",
      name: "Recipiente hermético rojo",
      color: "#c62828",
      description: "Líquidos"
    },
    {
      id: "red-bag",
      name: "Bolsa roja",
      color: "#ef4444",
      description: "Sólidos"
    },
    {
      id: "yellow-bag",
      name: "Bolsa amarilla",
      color: "#eab308",
      description: "Sólidos"
    },
    {
      id: "yellow-liquid",
      name: "Recipiente hermético amarillo",
      color: "#ca8a04",
      description: "Líquidos"
    },
    {
      id: "red-sharps",
      name: "Recipiente rígido rojo",
      color: "#b91c1c",
      description: "Punzocortantes"
    },
    {
      id: "ordinary",
      name: "Residuo común",
      color: "#64748b",
      description: "Bolsa indicada por el sistema institucional"
    }
  ];

  const questions = [
    {
      image: "🩸",
      item: "Sangre líquida",
      context: "Muestra de sangre líquida generada durante la atención.",
      correct: "red-liquid",
      explanation: "La sangre y sus componentes en forma líquida se depositan en un recipiente hermético rojo."
    },
    {
      image: "🧫",
      item: "Cultivo microbiológico",
      context: "Cultivo sólido generado en el laboratorio.",
      correct: "red-bag",
      explanation: "Los cultivos y cepas de agentes biológico-infecciosos y sus utensilios desechables se clasifican como RPBI. Para los residuos sólidos se utiliza bolsa roja."
    },
    {
      image: "🧬",
      item: "Tejido humano",
      context: "Tejido quirúrgico que no se encuentra en formol.",
      correct: "yellow-bag",
      explanation: "Los residuos patológicos sólidos que cumplen los criterios de la NOM-087 se depositan en bolsa amarilla."
    },
    {
      image: "💉",
      item: "Aguja usada",
      context: "Aguja que estuvo en contacto con un paciente.",
      correct: "red-sharps",
      explanation: "Las agujas y otros punzocortantes que cumplen los criterios de RPBI se depositan en un recipiente rígido rojo. No deben reencapucharse ni manipularse innecesariamente."
    },
    {
      image: "🩹",
      item: "Material de curación saturado",
      context: "Gasa empapada de sangre durante una curación.",
      correct: "red-bag",
      explanation: "Los materiales de curación empapados, saturados o goteando sangre son residuos no anatómicos sólidos y van en bolsa roja."
    },
    {
      image: "🧪",
      item: "Muestra patológica líquida",
      context: "Muestra biológica patológica que cumple los criterios de la norma.",
      correct: "yellow-liquid",
      explanation: "Los residuos patológicos líquidos que cumplen la definición de la NOM-087 se depositan en recipiente hermético amarillo."
    },
    {
      image: "🩸",
      item: "Recipiente con sangre líquida",
      context: "Recipiente desechable que contiene sangre líquida.",
      correct: "red-bag",
      explanation: "La NOM-087 incluye los recipientes desechables que contienen sangre líquida dentro de los residuos no anatómicos. En esta actividad se considera el recipiente sólido como residuo no anatómico que va en bolsa roja. La sangre líquida por separado va en recipiente hermético rojo."
    },
    {
      image: "🔬",
      item: "Material desechable de cultivo",
      context: "Utensilio desechable utilizado para transferir un cultivo infeccioso.",
      correct: "red-bag",
      explanation: "Los utensilios desechables empleados para contener, transferir, inocular o mezclar cultivos se consideran dentro de la categoría de cultivos y cepas."
    },
    {
      image: "🗡️",
      item: "Hoja de bisturí usada",
      context: "Punzocortante que estuvo en contacto con una muestra biológica.",
      correct: "red-sharps",
      explanation: "Las hojas de bisturí y otros punzocortantes incluidos en la norma van en un recipiente rígido rojo, resistente a perforaciones y con cierre seguro."
    },
    {
      image: "🧻",
      item: "Papel de envoltura limpio",
      context: "Envoltura exterior limpia, sin contaminación biológica.",
      correct: "ordinary",
      explanation: "No todo residuo generado en un hospital es RPBI. La envoltura limpia se separa como residuo común según el sistema institucional."
    }
  ];

  const root = document.getElementById("rpbiGame");
  if (!root) return;

  const createElement = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  function shuffle(items) {
    const shuffled = [...items];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }
    return shuffled;
  }

  const state = {
    questions: shuffle(questions),
    index: 0,
    score: 0,
    selected: null,
    finished: false
  };

  function renderProgress(card) {
    const questionNumber = state.finished ? state.questions.length : state.index + 1;
    const progressSection = createElement("div", "rpbi-progress");
    const summary = createElement("div", "rpbi-progress__summary");
    summary.append(
      createElement("strong", "", `Pregunta ${questionNumber} de ${state.questions.length}`),
      createElement("span", "", `⭐ Puntos: ${state.score}`)
    );
    const track = createElement("div", "rpbi-progress__track");
    track.setAttribute("role", "progressbar");
    track.setAttribute("aria-label", "Progreso de la misión RPBI");
    track.setAttribute("aria-valuemin", "0");
    track.setAttribute("aria-valuemax", String(state.questions.length));
    track.setAttribute("aria-valuenow", String(questionNumber));
    const bar = createElement("span", "rpbi-progress__bar");
    bar.style.width = `${(questionNumber / state.questions.length) * 100}%`;
    track.append(bar);
    progressSection.append(summary, track);
    card.append(progressSection);
  }

  function renderCompletion() {
    const card = createElement("section", "rpbi-game__card rpbi-game__card--complete");
    const icon = createElement("div", "rpbi-complete__icon", state.score >= 8 ? "🏆" : state.score >= 6 ? "👏" : "📚");
    icon.setAttribute("aria-hidden", "true");
    const title = createElement("h3", "", "¡Misión completada!");
    const score = createElement("p", "rpbi-complete__score", `${state.score} de ${state.questions.length} respuestas correctas`);
    const percentage = createElement("p", "rpbi-complete__percentage", `${Math.round((state.score / state.questions.length) * 100)}%`);
    const message = createElement(
      "p",
      "rpbi-complete__message",
      state.score >= 8
        ? "Excelente trabajo. Continúa aplicando las normas de bioseguridad."
        : "Repasa los tipos de RPBI y vuelve a intentarlo."
    );
    const restart = createElement("button", "button button--primary rpbi-restart", "↻ Jugar de nuevo");
    restart.type = "button";
    restart.addEventListener("click", restartGame);
    card.append(icon, title, score, percentage, message, restart);
    root.replaceChildren(card);
    restart.focus();
  }

  function renderGame() {
    if (state.finished) {
      renderCompletion();
      return;
    }

    const current = state.questions[state.index];
    const correctOption = options.find((option) => option.id === current.correct);
    const card = createElement("section", "rpbi-game__card");
    renderProgress(card);

    const prompt = createElement("div", "rpbi-prompt");
    const icon = createElement("div", "rpbi-prompt__icon", current.image);
    icon.setAttribute("aria-hidden", "true");
    const title = createElement("h3", "", current.item);
    const context = createElement("p", "", current.context);
    const question = createElement("strong", "", "¿Dónde debes depositar este residuo?");
    prompt.append(icon, title, context, question);
    card.append(prompt);

    const optionsHeading = createElement("h3", "rpbi-options__heading", "Selecciona el contenedor");
    const choices = createElement("div", "rpbi-options");
    choices.setAttribute("role", "group");
    choices.setAttribute("aria-label", "Opciones de clasificación del residuo");

    for (const option of options) {
      const isCorrect = option.id === current.correct;
      const isSelected = option.id === state.selected;
      const choice = createElement("button", "rpbi-option");
      choice.type = "button";
      choice.disabled = state.selected !== null;
      choice.setAttribute("aria-pressed", String(isSelected));
      if (state.selected !== null && isCorrect) choice.classList.add("is-correct");
      else if (isSelected) choice.classList.add("is-incorrect");
      else if (state.selected !== null) choice.classList.add("is-muted");

      const swatch = createElement("span", "rpbi-option__swatch");
      swatch.style.backgroundColor = option.color;
      swatch.setAttribute("aria-hidden", "true");
      const copy = createElement("span", "rpbi-option__copy");
      copy.append(
        createElement("strong", "", option.name),
        createElement("span", "", option.description)
      );
      choice.append(swatch, copy);
      choice.addEventListener("click", () => answerQuestion(option.id));
      choices.append(choice);
    }
    card.append(optionsHeading, choices);

    if (state.selected !== null && correctOption) {
      const isCorrect = state.selected === current.correct;
      const feedback = createElement("section", `rpbi-feedback${isCorrect ? " is-correct" : " is-incorrect"}`);
      feedback.setAttribute("aria-live", "polite");
      feedback.setAttribute("aria-atomic", "true");
      feedback.append(
        createElement("h3", "", isCorrect ? "✅ ¡Correcto!" : "📘 Sigue aprendiendo"),
        createElement("p", "rpbi-feedback__classification", `Clasificación correcta: ${correctOption.name}`),
        createElement("p", "", current.explanation)
      );
      const next = createElement(
        "button",
        "button button--primary",
        state.index + 1 === state.questions.length ? "Ver resultado" : "Siguiente residuo →"
      );
      next.type = "button";
      next.id = "rpbiNext";
      next.addEventListener("click", nextQuestion);
      feedback.append(next);
      card.append(feedback);
    }

    root.replaceChildren(card);
    if (state.selected !== null) root.querySelector("#rpbiNext")?.focus();
  }

  function answerQuestion(optionId) {
    if (state.selected !== null || state.finished) return;
    state.selected = optionId;
    if (optionId === state.questions[state.index].correct) state.score += 1;
    renderGame();
  }

  function nextQuestion() {
    if (state.index + 1 >= state.questions.length) {
      state.finished = true;
    } else {
      state.index += 1;
      state.selected = null;
    }
    renderGame();
  }

  function restartGame() {
    state.questions = shuffle(questions);
    state.index = 0;
    state.score = 0;
    state.selected = null;
    state.finished = false;
    renderGame();
    root.querySelector(".rpbi-option")?.focus();
  }

  renderGame();
})();
