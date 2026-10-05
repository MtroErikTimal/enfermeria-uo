(() => {
  "use strict";

  const temas = Array.isArray(window.UO_TEMAS) ? window.UO_TEMAS : [];
  const procedimientos = Array.isArray(window.UO_PROCEDIMIENTOS) ? window.UO_PROCEDIMIENTOS : [];
  const preguntas = Array.isArray(window.UO_EVALUACIONES) ? window.UO_EVALUACIONES : [];
  const recursos = Array.isArray(window.UO_RECURSOS) ? window.UO_RECURSOS : [];
  const asignaturas = Array.isArray(window.UO_ASIGNATURAS) ? window.UO_ASIGNATURAS : [];
  const PROGRESS_KEY = "uo-enfermeria-fundamentos-v1";
  const byId = (id) => document.getElementById(id);

  function element(tagName, className, text) {
    const node = document.createElement(tagName);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function addText(parent, tagName, className, text) {
    const child = element(tagName, className, text);
    parent.append(child);
    return child;
  }

  function createList(items, ordered = false) {
    const list = document.createElement(ordered ? "ol" : "ul");
    for (const item of items) addText(list, "li", "", item);
    return list;
  }

  function normalizar(texto) {
    return String(texto ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("es");
  }

  function textoBuscable(contenido) {
    return Object.values(contenido)
      .flatMap((valor) => Array.isArray(valor) ? valor : [valor])
      .filter((valor) => typeof valor === "string")
      .join(" ");
  }

  function mostrarAviso(texto) {
    const region = byId("toastRegion");
    if (!region) return;
    region.textContent = texto;
    region.classList.add("is-visible");
    window.clearTimeout(mostrarAviso.timer);
    mostrarAviso.timer = window.setTimeout(() => region.classList.remove("is-visible"), 4000);
  }

  function cargarProgreso() {
    try {
      const contenido = localStorage.getItem(PROGRESS_KEY);
      if (!contenido) return new Set();
      const parsed = JSON.parse(contenido);
      if (!Array.isArray(parsed)) throw new TypeError("El formato de progreso guardado no es válido.");
      return new Set(parsed.filter((id) => temas.some((tema) => tema.id === id)));
    } catch (error) {
      console.error("No se pudo leer el progreso guardado.", error);
      mostrarAviso("No se pudo leer el progreso guardado en este navegador.");
      return new Set();
    }
  }

  const temasCompletados = cargarProgreso();

  function guardarProgreso() {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify([...temasCompletados]));
    } catch (error) {
      console.error("No se pudo guardar el progreso de estudio.", error);
      mostrarAviso("El navegador no permitió guardar tu progreso en este dispositivo.");
    }
    actualizarProgreso();
  }

  function actualizarProgreso() {
    const total = temas.length;
    const completados = temas.filter((tema) => temasCompletados.has(tema.id)).length;
    const summary = byId("progressSummary");
    const bar = byId("progressBar");
    const progress = document.querySelector('[aria-label="Progreso en Fundamentos de Enfermería I"]');
    if (summary) summary.textContent = `${completados} de ${total} temas estudiados`;
    if (bar) bar.style.width = `${total ? (completados / total) * 100 : 0}%`;
    if (progress) progress.setAttribute("aria-valuenow", String(completados));
    renderTemas(filtroActivo);
    if (temaActual) actualizarDialogProgreso();
  }

  const filtros = {
    todos: () => true,
    fundamentos: (tema) => tema.unidad === "fundamentos",
    valoracion: (tema) => tema.unidad === "valoracion",
    tecnicas: (tema) => tema.unidad === "tecnicas",
    continuidad: (tema) => tema.unidad === "continuidad"
  };
  let filtroActivo = "todos";
  let temaActual = null;

  function renderTemas(filtro = "todos") {
    const grid = byId("topicGrid");
    if (!grid) return;
    grid.replaceChildren();
    const lista = temas.filter(filtros[filtro] ?? filtros.todos);
    const count = byId("topicCount");
    if (count) count.textContent = String(lista.length);
    if (lista.length === 0) {
      addText(grid, "p", "empty-state", "No hay temas en esta categoría todavía.");
      return;
    }

    for (const [indice, tema] of lista.entries()) {
      const card = element("article", "topic-card");
      const header = element("div", "topic-card__top");
      addText(header, "span", "topic-card__number", `MÓDULO ${String(temas.indexOf(tema) + 1).padStart(2, "0")}`);
      const estudiado = temasCompletados.has(tema.id);
      addText(header, "span", `topic-status${estudiado ? " topic-status--done" : ""}`, estudiado ? "Estudiado" : "Por estudiar");
      card.append(header);
      addText(card, "h3", "", tema.titulo);
      addText(card, "p", "topic-card__description", tema.resumen);
      const open = element("button", "topic-card__open");
      open.type = "button";
      open.setAttribute("aria-label", `Estudiar ${tema.titulo}`);
      open.append(document.createTextNode("Abrir tema"));
      addText(open, "span", "", "↗");
      open.addEventListener("click", () => abrirTema(tema.id));
      card.append(open);
      card.dataset.position = String(indice + 1);
      grid.append(card);
    }
  }

  function renderAsignaturas() {
    const grid = byId("courseGrid");
    if (!grid) return;
    grid.replaceChildren();
    for (const asignatura of asignaturas) {
      const card = element("a", "catalog-card");
      card.href = asignatura.href;
      addText(card, "span", "catalog-card__mark", asignatura.id === "fundamentos-enfermeria-i" ? "FE" : "UO");
      const copy = element("span", "catalog-card__copy");
      addText(copy, "strong", "", asignatura.titulo);
      addText(copy, "span", "", asignatura.descripcion);
      card.append(copy);
      addText(card, "span", "catalog-card__status", asignatura.estado);
      grid.append(card);
    }
  }

  const nombresSeccionesTema = [
    ["introduccion", "Introducción", "text"],
    ["conceptos", "Conceptos principales", "list"],
    ["materiales", "Material necesario", "list"],
    ["pasos", "Procedimiento de estudio", "ordered"],
    ["precauciones", "Precauciones", "list"],
    ["seguridad", "Consideraciones de seguridad", "list"],
    ["errores", "Errores frecuentes", "list"],
    ["evidencia", "Evidencia de aprendizaje", "text"]
  ];

  function renderSecciones(contenedor, contenido, secciones) {
    contenedor.replaceChildren();
    for (const [clave, titulo, formato] of secciones) {
      const valores = contenido[clave];
      if (!valores || (Array.isArray(valores) && valores.length === 0)) continue;
      const section = element("section", "dialog-section");
      if (clave === "introduccion" || clave === "evidencia" || clave === "indicaciones" || clave === "contraindicaciones" || clave === "pasos") {
        section.classList.add("dialog-section--wide");
      }
      addText(section, "h3", "", titulo);
      if (formato === "list") section.append(createList(valores));
      else if (formato === "ordered") section.append(createList(valores, true));
      else addText(section, "p", "", valores);
      contenedor.append(section);
    }
  }

  function abrirTema(id) {
    const indice = temas.findIndex((tema) => tema.id === id);
    if (indice < 0) return;
    temaActual = indice;
    renderTemaActual();
    const dialog = byId("topicDialog");
    if (!dialog.open) dialog.showModal();
    byId("dialogClose")?.focus();
  }

  function actualizarDialogProgreso() {
    if (temaActual === null) return;
    const tema = temas[temaActual];
    const total = temas.length;
    const done = temas.filter((item) => temasCompletados.has(item.id)).length;
    const text = byId("dialogProgressText");
    const bar = byId("dialogProgressBar");
    if (text) text.textContent = `${done} de ${total} temas estudiados`;
    if (bar) bar.style.width = `${total ? (done / total) * 100 : 0}%`;
    const mark = byId("markStudied");
    if (mark) {
      mark.textContent = temasCompletados.has(tema.id) ? "✓ Tema estudiado" : "Marcar como estudiado";
      mark.setAttribute("aria-pressed", String(temasCompletados.has(tema.id)));
    }
  }

  function renderTemaActual() {
    const tema = temas[temaActual];
    if (!tema) return;
    byId("dialogIndex").textContent = `TEMA ${String(temaActual + 1).padStart(2, "0")} · ${tema.unidad.toUpperCase()}`;
    byId("dialogTitle").textContent = tema.titulo;
    byId("dialogObjective").textContent = `Objetivo de aprendizaje: ${tema.objetivo}`;
    renderSecciones(byId("dialogSections"), tema, nombresSeccionesTema);
    actualizarDialogProgreso();
    byId("previousTopic").disabled = temaActual === 0;
    byId("nextTopic").disabled = temaActual === temas.length - 1;
  }

  function moverTema(delta) {
    const siguiente = temaActual + delta;
    if (siguiente < 0 || siguiente >= temas.length) return;
    temaActual = siguiente;
    renderTemaActual();
    byId("topicDialog").scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderProcedimientos() {
    const grid = byId("procedureGrid");
    const materialList = byId("materialList");
    if (!grid) return;
    grid.replaceChildren();
    for (const procedimiento of procedimientos) {
      const card = element("article", "procedure-card");
      addText(card, "span", "procedure-card__tag", procedimiento.categoria);
      addText(card, "h3", "", procedimiento.titulo);
      addText(card, "p", "", procedimiento.resumen);
      const button = element("button", "");
      button.type = "button";
      button.append(document.createTextNode("Consultar guía"));
      addText(button, "span", "", "↗");
      button.addEventListener("click", () => abrirProcedimiento(procedimiento.id));
      card.append(button);
      grid.append(card);
    }
    if (materialList) renderMateriales(materialList);
  }

  const nombresSeccionesProcedimiento = [
    ["indicaciones", "Indicaciones", "list"],
    ["contraindicaciones", "Contraindicaciones y límites", "list"],
    ["material", "Material", "list"],
    ["preparacion", "Preparación del paciente", "list"],
    ["pasos", "Procedimiento paso a paso", "ordered"],
    ["seguridad", "Medidas de seguridad", "list"],
    ["registro", "Registro de enfermería", "text"]
  ];

  function abrirProcedimiento(id) {
    const procedimiento = procedimientos.find((item) => item.id === id);
    if (!procedimiento) return;
    byId("procedureCategory").textContent = procedimiento.categoria;
    byId("procedureDialogTitle").textContent = procedimiento.titulo;
    byId("procedureObjective").textContent = `Objetivo: ${procedimiento.objetivo}`;
    renderSecciones(byId("procedureSections"), procedimiento, nombresSeccionesProcedimiento);
    byId("procedureDialog").showModal();
  }

  function renderMateriales(target) {
    target.replaceChildren();
    for (const recurso of recursos.filter((item) => !item.disponible).slice(0, 4)) {
      const row = element("article", "material-row");
      addText(row, "span", "material-row__icon", abreviaturaTipo(recurso.tipo));
      const body = element("div", "material-row__body");
      addText(body, "strong", "", recurso.titulo);
      addText(body, "span", "", recurso.formato);
      row.append(body);
      addText(row, "span", "material-row__status", recurso.estado);
      target.append(row);
    }
    if (!target.childElementCount) addText(target, "p", "empty-state", "Pronto se agregarán materiales revisados por el equipo docente.");
  }

  function abreviaturaTipo(tipo) {
    const abreviaturas = { "Guía de estudio": "GU", "Presentaciones": "PR", "Infografías": "IN", "Videos": "VI", "Bibliografía": "BI", "Enlaces académicos": "↗" };
    return abreviaturas[tipo] ?? "RE";
  }

  const tiposRecurso = ["Todos", ...new Set(recursos.map((recurso) => recurso.tipo))];
  let filtroRecurso = "Todos";

  function renderRecursos() {
    const filters = byId("resourceFilters");
    const grid = byId("resourceGrid");
    if (!filters || !grid) return;
    filters.replaceChildren();
    for (const tipo of tiposRecurso) {
      const button = element("button", `filter-chip${filtroRecurso === tipo ? " is-active" : ""}`, tipo);
      button.type = "button";
      button.setAttribute("aria-pressed", String(filtroRecurso === tipo));
      button.addEventListener("click", () => {
        filtroRecurso = tipo;
        renderRecursos();
      });
      filters.append(button);
    }
    grid.replaceChildren();
    const visibleResources = recursos.filter((recurso) => filtroRecurso === "Todos" || recurso.tipo === filtroRecurso);
    if (visibleResources.length === 0) {
      addText(grid, "p", "empty-state", "Todavía no hay recursos de esta categoría.");
      return;
    }
    for (const recurso of visibleResources) {
      const card = element("article", "resource-card");
      const top = element("div", "resource-card__top");
      addText(top, "span", "resource-card__icon", abreviaturaTipo(recurso.tipo));
      addText(top, "span", "resource-card__type", recurso.formato);
      card.append(top);
      addText(card, "h3", "", recurso.titulo);
      addText(card, "p", "", recurso.descripcion);
      const link = element("a", "resource-card__link", recurso.disponible ? "Visitar recurso ↗" : recurso.estado);
      if (recurso.disponible && recurso.href) {
        link.href = recurso.href;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      } else {
        link.href = "#materiales";
        link.addEventListener("click", (event) => event.preventDefault());
        link.setAttribute("aria-disabled", "true");
      }
      card.append(link);
      grid.append(card);
    }
  }

  function buscar(consulta) {
    const query = normalizar(consulta.trim());
    const target = byId("searchResults");
    target.replaceChildren();
    if (query.length < 2) {
      if (query.length) addText(target, "p", "search-empty", "Escribe al menos dos caracteres para buscar.");
      return;
    }
    const resultados = [];
    for (const tema of temas) {
      if (normalizar(textoBuscable(tema)).includes(query)) resultados.push({ titulo: tema.titulo, tipo: "Tema", resumen: tema.resumen, accion: () => abrirTema(tema.id) });
    }
    for (const procedimiento of procedimientos) {
      if (normalizar(textoBuscable(procedimiento)).includes(query)) resultados.push({ titulo: procedimiento.titulo, tipo: "Procedimiento", resumen: procedimiento.resumen, accion: () => abrirProcedimiento(procedimiento.id) });
    }
    for (const recurso of recursos) {
      if (normalizar(textoBuscable(recurso)).includes(query)) resultados.push({ titulo: recurso.titulo, tipo: "Recurso", resumen: recurso.descripcion, accion: () => { window.location.hash = "recursos"; filtroRecurso = recurso.tipo; renderRecursos(); } });
    }
    if (resultados.length === 0) {
      addText(target, "p", "search-empty", "No encontramos coincidencias. Prueba con otro concepto.");
      return;
    }
    for (const resultado of resultados.slice(0, 8)) {
      const button = element("button", "search-result");
      button.type = "button";
      const text = element("span", "");
      addText(text, "strong", "", resultado.titulo);
      addText(text, "span", "", resultado.resumen);
      button.append(text);
      addText(button, "span", "search-result__type", resultado.tipo);
      button.addEventListener("click", resultado.accion);
      target.append(button);
    }
  }

  function setupSearch() {
    const form = byId("searchForm");
    const input = byId("siteSearch");
    if (!form || !input) return;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      buscar(input.value);
    });
    input.addEventListener("input", () => buscar(input.value));
    input.addEventListener("keydown", (event) => {
      if (event.key === "Escape") byId("searchResults").replaceChildren();
    });
  }

  let quizIndex = -1;
  let respuestasCorrectas = 0;
  let respondida = false;
  let opcionSeleccionada = null;

  function inicializarQuiz() {
    const count = byId("assessmentCount");
    if (count) count.textContent = `${preguntas.length} preguntas de práctica`;
    const quiz = byId("quizContent");
    quiz.replaceChildren();
    const start = element("div", "quiz-start");
    addText(start, "p", "quiz-question-count", "Repaso interactivo");
    addText(start, "h3", "", "¿Listo para empezar?");
    addText(start, "p", "", `Responde ${preguntas.length} preguntas, una a la vez. Después de cada respuesta verás una explicación. Es una autoevaluación formativa, no una calificación oficial.`);
    const button = element("button", "button button--primary", "Comenzar evaluación →");
    button.type = "button";
    button.addEventListener("click", iniciarQuiz);
    start.append(button);
    quiz.append(start);
    quizIndex = -1;
    respuestasCorrectas = 0;
    respondida = false;
    actualizarProgresoQuiz(0);
    byId("quizStep").textContent = "Preparación";
  }

  function iniciarQuiz() {
    if (preguntas.length === 0) {
      const quiz = byId("quizContent");
      quiz.replaceChildren();
      addText(quiz, "p", "quiz-error", "No hay preguntas disponibles. El equipo docente podrá agregarlas al banco de preguntas.");
      return;
    }
    quizIndex = 0;
    respuestasCorrectas = 0;
    renderPregunta();
  }

  function actualizarProgresoQuiz(preguntaActual) {
    const total = preguntas.length;
    const valor = total && preguntaActual > 0 ? Math.min(100, ((preguntaActual - 1) / total) * 100) : 0;
    const bar = byId("quizProgress");
    const progress = document.querySelector(".quiz-progress[role='progressbar']");
    if (bar) bar.style.width = `${valor}%`;
    if (progress) {
      progress.setAttribute("aria-valuemax", String(total));
      progress.setAttribute("aria-valuenow", String(Math.max(0, preguntaActual - 1)));
    }
  }

  function renderPregunta() {
    const pregunta = preguntas[quizIndex];
    if (!pregunta) {
      renderResultadoQuiz();
      return;
    }
    respondida = false;
    opcionSeleccionada = null;
    byId("quizStep").textContent = `Pregunta ${quizIndex + 1} de ${preguntas.length}`;
    actualizarProgresoQuiz(quizIndex + 1);
    const quiz = byId("quizContent");
    quiz.replaceChildren();
    addText(quiz, "p", "quiz-question-count", "Fundamentos de Enfermería I");
    addText(quiz, "h3", "quiz-question", pregunta.pregunta);
    const form = element("form", "quiz-options");
    form.addEventListener("submit", (event) => event.preventDefault());
    for (const [indice, opcion] of pregunta.opciones.entries()) {
      const label = element("label", "quiz-option");
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = `respuesta-${pregunta.id}`;
      radio.value = String(indice);
      radio.addEventListener("change", () => {
        if (!respondida) opcionSeleccionada = indice;
        const existingError = quiz.querySelector(".quiz-error");
        existingError?.remove();
      });
      label.append(radio);
      label.append(document.createTextNode(opcion));
      form.append(label);
    }
    quiz.append(form);
    const feedback = element("p", "quiz-feedback");
    feedback.hidden = true;
    quiz.append(feedback);
    const actions = element("div", "quiz-actions");
    const check = element("button", "button button--primary", "Revisar respuesta");
    check.type = "button";
    check.addEventListener("click", () => verificarRespuesta(pregunta, form, feedback, check, actions));
    actions.append(check);
    quiz.append(actions);
  }

  function verificarRespuesta(pregunta, form, feedback, check, actions) {
    if (respondida) return;
    if (opcionSeleccionada === null) {
      if (!form.parentElement.querySelector(".quiz-error")) addText(form.parentElement, "p", "quiz-error", "Selecciona una opción para continuar.");
      return;
    }
    respondida = true;
    const opciones = [...form.querySelectorAll(".quiz-option")];
    for (const [indice, label] of opciones.entries()) {
      const radio = label.querySelector("input");
      radio.disabled = true;
      label.classList.add("is-disabled");
      if (indice === pregunta.respuesta) label.classList.add("is-correct");
      else if (indice === opcionSeleccionada) label.classList.add("is-incorrect");
    }
    const esCorrecta = opcionSeleccionada === pregunta.respuesta;
    if (esCorrecta) respuestasCorrectas += 1;
    feedback.textContent = `${esCorrecta ? "Respuesta correcta." : "Repasa esta idea."} ${pregunta.retroalimentacion}`;
    feedback.classList.toggle("quiz-feedback--incorrect", !esCorrecta);
    feedback.hidden = false;
    check.remove();
    const next = element("button", "button button--primary", quizIndex === preguntas.length - 1 ? "Ver resultado →" : "Siguiente pregunta →");
    next.type = "button";
    next.addEventListener("click", () => {
      quizIndex += 1;
      renderPregunta();
    });
    actions.append(next);
  }

  function renderResultadoQuiz() {
    actualizarProgresoQuiz(preguntas.length + 1);
    const progress = document.querySelector(".quiz-progress[role='progressbar']");
    if (byId("quizProgress")) byId("quizProgress").style.width = "100%";
    if (progress) progress.setAttribute("aria-valuenow", String(preguntas.length));
    byId("quizStep").textContent = "Evaluación completada";
    const quiz = byId("quizContent");
    quiz.replaceChildren();
    const result = element("div", "quiz-result");
    addText(result, "p", "quiz-question-count", "Tu resultado");
    addText(result, "h3", "", "Buen trabajo al practicar.");
    addText(result, "div", "quiz-result__score", `${respuestasCorrectas} / ${preguntas.length}`);
    addText(result, "p", "", "Usa la retroalimentación para elegir qué conceptos repasar. Este ejercicio es formativo y no representa una evaluación oficial.");
    const restart = element("button", "button button--primary", "Reiniciar evaluación");
    restart.type = "button";
    restart.addEventListener("click", iniciarQuiz);
    result.append(restart);
    quiz.append(result);
  }

  function setupCalculator() {
    const form = byId("calculatorForm");
    if (!form) return;
    const doseInput = byId("dose");
    const doseUnit = byId("doseUnit");
    const volumeInput = byId("dilutionVolume");
    const presentationInput = byId("presentation");
    const presentationUnit = byId("presentationUnit");
    const result = byId("calculatorResult");
    const message = byId("calculatorMessage");
    const toMg = { mcg: 0.001, mg: 1, g: 1000 };

    function clearResult() {
      result.hidden = true;
      message.textContent = "";
    }

    form.addEventListener("input", clearResult);
    form.addEventListener("change", clearResult);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const dose = Number(doseInput.value);
      const volume = Number(volumeInput.value);
      const presentation = Number(presentationInput.value);
      if (![dose, volume, presentation].every((value) => Number.isFinite(value) && value > 0)) {
        clearResult();
        message.textContent = "Ingresa cantidades mayores que cero en los tres campos.";
        return;
      }
      const calculated = (dose * toMg[doseUnit.value] * volume) / (presentation * toMg[presentationUnit.value]);
      if (!Number.isFinite(calculated) || calculated <= 0) {
        clearResult();
        message.textContent = "No se pudo calcular. Verifica los valores y las unidades.";
        return;
      }
      message.textContent = "";
      byId("calculatorValue").textContent = `${calculated.toLocaleString("es", { maximumFractionDigits: 6 })} mL`;
      byId("calculatorDetail").textContent = `${doseInput.value} ${doseUnit.value} × ${volumeInput.value} mL ÷ ${presentationInput.value} ${presentationUnit.value}`;
      result.hidden = false;
    });
    byId("clearCalculator").addEventListener("click", () => {
      form.reset();
      clearResult();
      doseInput.focus();
    });
  }

  function setupNavigation() {
    const toggle = byId("menuToggle");
    const nav = byId("primaryNavigation");
    if (!toggle || !nav) return;
    function closeNavigation() {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Abrir menú de navegación");
    }
    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.setAttribute("aria-label", isOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación");
      nav.classList.toggle("is-open", isOpen);
    });
    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) closeNavigation();
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 760) closeNavigation();
    });
    const sections = [...document.querySelectorAll("main section[id]")];
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          for (const link of nav.querySelectorAll("a")) {
            link.classList.toggle("is-current", link.hash === `#${entry.target.id}`);
          }
        }
      }, { rootMargin: "-20% 0px -70% 0px" });
      for (const section of sections) observer.observe(section);
    }
  }

  function setupDialogs() {
    for (const dialog of document.querySelectorAll("dialog")) {
      dialog.addEventListener("click", (event) => {
        if (event.target === dialog) dialog.close();
      });
      for (const close of dialog.querySelectorAll("[data-close-dialog]")) {
        close.addEventListener("click", () => dialog.close());
      }
    }
    byId("previousTopic").addEventListener("click", () => moverTema(-1));
    byId("nextTopic").addEventListener("click", () => moverTema(1));
    byId("markStudied").addEventListener("click", () => {
      if (temaActual === null) return;
      const tema = temas[temaActual];
      const wasStudied = temasCompletados.has(tema.id);
      if (wasStudied) temasCompletados.delete(tema.id);
      else temasCompletados.add(tema.id);
      guardarProgreso();
      mostrarAviso(wasStudied ? `Se actualizó tu avance: ${tema.titulo}.` : `Marcaste como estudiado: ${tema.titulo}.`);
    });
  }

  function setupFilters() {
    const buttons = document.querySelectorAll("[data-topic-filter]");
    for (const button of buttons) {
      button.addEventListener("click", () => {
        filtroActivo = button.dataset.topicFilter;
        for (const filter of buttons) {
          const active = filter === button;
          filter.classList.toggle("is-active", active);
          filter.setAttribute("aria-pressed", String(active));
        }
        renderTemas(filtroActivo);
      });
    }
  }

  let installPrompt = null;
  function setupInstallation() {
    const button = byId("installApp");
    if (!button) return;
    const iosInstructions = byId("installInstructions");
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
    const isAppleMobile = /iphone|ipad|ipod/i.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    if (iosInstructions && isAppleMobile && !isStandalone) iosInstructions.classList.add("is-visible");
    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      installPrompt = event;
      button.hidden = false;
    });
    button.addEventListener("click", async () => {
      if (!installPrompt) return;
      await installPrompt.prompt();
      installPrompt = null;
      button.hidden = true;
    });
    window.addEventListener("appinstalled", () => {
      button.hidden = true;
      mostrarAviso("La plataforma se instaló en este dispositivo.");
    });
  }

  function iniciar() {
    if (temas.length === 0) {
      console.error("No se encontró el banco de temas UO_TEMAS.");
      mostrarAviso("No se pudo cargar el material de estudio. Recarga la página o informa al equipo técnico.");
    }
    renderTemas();
    renderAsignaturas();
    renderProcedimientos();
    renderRecursos();
    setupNavigation();
    setupSearch();
    setupFilters();
    setupDialogs();
    setupCalculator();
    inicializarQuiz();
    setupInstallation();
    actualizarProgreso();
  }

  document.addEventListener("DOMContentLoaded", iniciar, { once: true });
})();
