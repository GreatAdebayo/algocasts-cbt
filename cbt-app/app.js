// AlgoCasts CBT Application Logic
document.addEventListener("DOMContentLoaded", () => {
  // State
  const allQuestions = window.CBT_QUESTIONS || [];
  const questionSets = window.CBT_QUESTION_SETS || {};
  const questionBankValidation = window.CBTQuestionValidator?.validateQuestionBank(allQuestions);
  const { shuffle, escapeHtml, formatMarkdown } = window.CBTUtils || {};

  if (!questionBankValidation?.valid || !shuffle || !escapeHtml || !formatMarkdown) {
    const errors = questionBankValidation?.errors || ["The CBT support files could not be loaded."];
    console.error("CBT question-bank validation failed:", errors);
    const title = document.getElementById("question-title");
    const prompt = document.getElementById("question-prompt");
    if (title) title.textContent = "Question bank needs attention";
    if (prompt) prompt.textContent = errors.join(" ");
    return;
  }
  let questions = [];
  let currentIndex = 0;
  let codeSaveTimeout = null;
  let userState = {
    answers: {}, // { [qId]: { code: "", selectedChoice: "", isCorrect: false, score: 0, flagged: false, testResults: [] } }
    startTime: Date.now(),
    elapsedSeconds: 0,
    timerInterval: null,
    timerStarted: false,
    timerPaused: false,
    submitted: false,
    finished: false,
    testMode: "practice",
    interviewQuestionIds: [],
    activeQuestionId: null,
    selectedSeverity: "Low",
    selectedExercise: "All",
    examDurationMinutes: 25
  };

  // DOM Elements
  const paletteContainer = document.getElementById("palette-buttons-container");
  const paletteViewport = document.getElementById("palette-viewport");
  const btnPalettePrev = document.getElementById("btn-palette-prev");
  const btnPaletteNext = document.getElementById("btn-palette-next");
  const badgeTopic = document.getElementById("badge-topic");
  const badgeDifficulty = document.getElementById("badge-difficulty");
  const badgePoints = document.getElementById("badge-points");
  const btnFlag = document.getElementById("btn-flag-question");
  const flagIcon = document.getElementById("flag-icon");
  const questionTitle = document.getElementById("question-title");
  const questionPrompt = document.getElementById("question-prompt");
  const solutionExplanationContainer = document.getElementById("solution-explanation-container");
  const questionStatusText = document.getElementById("question-status-text");
  const btnShowHint = document.getElementById("btn-show-hint");

  const codeEditorCard = document.getElementById("code-editor-card");
  const codeInput = document.getElementById("code-input");
  const lineNumbers = document.getElementById("editor-line-numbers");
  const editorSyntaxBadge = document.getElementById("editor-syntax-badge");
  const conceptualChoicesCard = document.getElementById("conceptual-choices-card");
  const choicesContainer = document.getElementById("choices-container");

  const consoleCard = document.getElementById("console-card");
  const testOutputBody = document.getElementById("test-output-body");
  const btnRunTests = document.getElementById("btn-run-tests");
  const btnResetCode = document.getElementById("btn-reset-code");

  const btnPrev = document.getElementById("btn-prev-question");
  const btnNext = document.getElementById("btn-next-question");
  const btnSave = document.getElementById("btn-save-progress");
  const btnSubmitExam = document.getElementById("btn-submit-exam");
  const timerDisplay = document.getElementById("timer-display");
  const footerCurrentScore = document.getElementById("footer-current-score");
  const severitySelect = document.getElementById("severity-select");
  const exerciseSelect = document.getElementById("exercise-select");
  const btnTestControl = document.getElementById("btn-test-control");
  const btnPauseTest = document.getElementById("btn-pause-test");
  const btnPracticeMode = document.getElementById("btn-practice-mode");
  const btnInterviewMode = document.getElementById("btn-interview-mode");
  const durationInput = document.getElementById("duration-input");
  const appToast = document.getElementById("app-toast");
  const completionPanel = document.getElementById("completion-panel");
  const btnCompletionReview = document.getElementById("btn-completion-review");
  const btnCompletionRestart = document.getElementById("btn-completion-restart");

  // Modal Elements
  const resultsModal = document.getElementById("results-modal");
  const scoreCircle = document.getElementById("score-circle");
  const modalPctDisplay = document.getElementById("modal-pct-display");
  const modalPtsDisplay = document.getElementById("modal-pts-display");
  const modalGradeDisplay = document.getElementById("modal-grade-display");
  const modalTimeDisplay = document.getElementById("modal-time-display");
  const modalPassedDisplay = document.getElementById("modal-passed-display");
  const modalStreakDisplay = document.getElementById("modal-streak-display");
  const modalReviewList = document.getElementById("modal-review-list");
  const btnModalClose = document.getElementById("btn-modal-close");
  const btnRetakeTest = document.getElementById("btn-retake-test");
  const btnModalFinish = document.getElementById("btn-modal-finish");
  const btnExportCurrentResults = document.getElementById("btn-export-current-results");

  // History Modal Elements
  const btnOpenHistory = document.getElementById("btn-open-history");
  const historyCountBadge = document.getElementById("history-count-badge");
  const historyModal = document.getElementById("history-modal");
  const btnCloseHistory = document.getElementById("btn-close-history");
  const btnHistoryCloseBottom = document.getElementById("btn-history-close-bottom");
  const btnHistoryBack = document.getElementById("btn-history-back");
  const btnClearHistory = document.getElementById("btn-clear-history");
  const historyAttemptsList = document.getElementById("history-attempts-list");
  const historyInspectView = document.getElementById("history-inspect-view");
  const customDropdowns = new Map();

  // Initial State Hydration
  populateExerciseOptions();
  initCustomDropdowns();
  initUserState();
  setQuestionSet(userState.selectedSeverity, userState.selectedExercise, false, true);
  renderPalette();
  renderQuestion(0);
  startTimer();
  bindEvents();
  updateScoreDisplay();
  setFinishedView(userState.finished);
  savePendingProjectResult();

  function initUserState() {
    const saved = localStorage.getItem("algocasts_cbt_state");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.answers) {
          userState.answers = parsed.answers;
        }
        if (Number.isFinite(parsed.elapsedSeconds)) userState.elapsedSeconds = Math.max(0, parsed.elapsedSeconds);
        if (typeof parsed.submitted === "boolean") userState.submitted = parsed.submitted;
        if (typeof parsed.finished === "boolean") userState.finished = parsed.finished;
        if (typeof parsed.timerStarted === "boolean") userState.timerStarted = parsed.timerStarted;
        if (typeof parsed.timerPaused === "boolean") userState.timerPaused = parsed.timerPaused;
        if (["practice", "interview"].includes(parsed.testMode)) userState.testMode = parsed.testMode;
        if (Array.isArray(parsed.interviewQuestionIds)) userState.interviewQuestionIds = parsed.interviewQuestionIds;
        if (typeof parsed.activeQuestionId === "string") userState.activeQuestionId = parsed.activeQuestionId;
        if (["All", "Low", "Medium", "High"].includes(parsed.selectedSeverity)) userState.selectedSeverity = parsed.selectedSeverity;
        const knownTopics = new Set(allQuestions.map((question) => question.topic));
        if (parsed.selectedExercise === "All" || knownTopics.has(parsed.selectedExercise)) userState.selectedExercise = parsed.selectedExercise;
        if (Number.isFinite(parsed.examDurationMinutes)) userState.examDurationMinutes = Math.min(180, Math.max(1, parsed.examDurationMinutes));
      } catch (e) {
        console.warn("Could not load saved test state", e);
      }
    }

    allQuestions.forEach((q) => {
      if (!userState.answers[q.id]) {
        userState.answers[q.id] = {
          code: q.starterCode || "",
          selectedChoice: null,
          isCorrect: false,
          score: 0,
          flagged: false,
          testResults: []
        };
      }
    });

    durationInput.value = userState.examDurationMinutes;
    updateTestControl();
    updatePauseButton();
    updateTestModeToggle();
    updateHistoryBadge();
  }

  function saveState() {
    localStorage.setItem("algocasts_cbt_state", JSON.stringify({
      answers: userState.answers,
      elapsedSeconds: userState.elapsedSeconds,
      timerStarted: userState.timerStarted,
      timerPaused: userState.timerPaused,
      submitted: userState.submitted,
      finished: userState.finished,
      testMode: userState.testMode,
      interviewQuestionIds: userState.interviewQuestionIds,
      activeQuestionId: userState.activeQuestionId,
      selectedSeverity: userState.selectedSeverity,
      selectedExercise: userState.selectedExercise,
      examDurationMinutes: userState.examDurationMinutes
    }));
  }

  function setQuestionSet(severity = userState.selectedSeverity, exercise = userState.selectedExercise, reshuffleInterview = false, restoreActiveQuestion = false) {
    userState.selectedSeverity = severity || "All";
    userState.selectedExercise = exercise || "All";
    questions = allQuestions.filter((question) =>
      (userState.selectedSeverity === "All" || question.severity === userState.selectedSeverity) &&
      (userState.selectedExercise === "All" || question.topic === userState.selectedExercise)
    );

    // If filter produced 0 questions, fall back gracefully to all questions
    if (questions.length === 0) {
      questions = allQuestions.filter((question) =>
        userState.selectedSeverity === "All" || question.severity === userState.selectedSeverity
      );
      if (questions.length === 0) {
        questions = allQuestions;
        userState.selectedSeverity = "All";
      }
      userState.selectedExercise = "All";
      if (exerciseSelect) exerciseSelect.value = "All";
      syncCustomDropdown(exerciseSelect);
    }

    if (userState.testMode === "interview") {
      const availableIds = questions.map((question) => question.id);
      const savedIds = userState.interviewQuestionIds.filter((id) => availableIds.includes(id));
      const needsNewDraw = reshuffleInterview || savedIds.length === 0;
      const chosenIds = needsNewDraw
        ? shuffle(availableIds).slice(0, Math.min(6, availableIds.length))
        : savedIds;
      userState.interviewQuestionIds = chosenIds;
      questions = chosenIds.map((id) => allQuestions.find((question) => question.id === id)).filter(Boolean);
    } else {
      userState.interviewQuestionIds = [];
    }

    const savedQuestionIndex = restoreActiveQuestion
      ? questions.findIndex((question) => question.id === userState.activeQuestionId)
      : -1;
    currentIndex = savedQuestionIndex >= 0 ? savedQuestionIndex : 0;
    if (severitySelect) {
      severitySelect.value = userState.selectedSeverity;
      if (severitySelect.selectedIndex < 0) severitySelect.selectedIndex = 0;
      syncCustomDropdown(severitySelect);
    }
    if (exerciseSelect) {
      exerciseSelect.value = userState.selectedExercise;
      if (exerciseSelect.selectedIndex < 0) exerciseSelect.selectedIndex = 0;
      syncCustomDropdown(exerciseSelect);
    }
    saveState();
  }

  function populateExerciseOptions() {
    if (!exerciseSelect) return;
    const existingValues = new Set(Array.from(exerciseSelect.options).map((o) => o.value));
    const topics = Array.from(new Set(allQuestions.map((q) => q.topic).filter(Boolean)));
    topics.forEach((topic) => {
      if (!existingValues.has(topic)) {
        const opt = document.createElement("option");
        opt.value = topic;
        opt.textContent = topic;
        exerciseSelect.appendChild(opt);
      }
    });
  }

  function initCustomDropdowns() {
    document.querySelectorAll("select.app-select").forEach((select) => {
      const dropdown = document.createElement("div");
      dropdown.className = "custom-dropdown";

      const trigger = document.createElement("button");
      trigger.type = "button";
      trigger.className = "custom-dropdown-trigger";
      trigger.setAttribute("aria-haspopup", "listbox");
      trigger.setAttribute("aria-expanded", "false");

      const menu = document.createElement("div");
      menu.className = "custom-dropdown-menu";
      menu.setAttribute("role", "listbox");

      Array.from(select.options).forEach((option) => {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "custom-dropdown-option";
        item.textContent = option.textContent;
        item.dataset.value = option.value;
        item.setAttribute("role", "option");
        item.addEventListener("click", () => {
          select.value = option.value;
          select.dispatchEvent(new Event("change", { bubbles: true }));
          closeCustomDropdown(dropdown);
        });
        menu.appendChild(item);
      });

      trigger.addEventListener("click", () => {
        const willOpen = !dropdown.classList.contains("open");
        document.querySelectorAll(".custom-dropdown.open").forEach(closeCustomDropdown);
        if (willOpen) {
          dropdown.classList.add("open");
          trigger.setAttribute("aria-expanded", "true");
        }
      });

      dropdown.append(trigger, menu);
      select.after(dropdown);
      select.classList.add("native-select-hidden");
      customDropdowns.set(select, { dropdown, trigger });
      syncCustomDropdown(select);
    });

    document.addEventListener("click", (event) => {
      if (!event.target.closest(".custom-dropdown")) {
        document.querySelectorAll(".custom-dropdown.open").forEach(closeCustomDropdown);
      }
    });
  }

  function syncCustomDropdown(select) {
    const entry = customDropdowns.get(select);
    if (!entry || !select) return;
    if (!select.options || select.options.length === 0) return;
    if (select.selectedIndex < 0) {
      select.selectedIndex = 0;
    }
    const option = select.options[select.selectedIndex];
    if (option) {
      entry.trigger.textContent = option.textContent;
    }
    entry.dropdown.querySelectorAll(".custom-dropdown-option").forEach((item) => {
      const selected = item.dataset.value === select.value;
      item.classList.toggle("selected", selected);
      item.setAttribute("aria-selected", String(selected));
    });
  }

  function closeCustomDropdown(dropdown) {
    dropdown.classList.remove("open");
    dropdown.querySelector(".custom-dropdown-trigger")?.setAttribute("aria-expanded", "false");
  }

  // Timer functionality
  function startTimer() {
    if (userState.timerInterval) clearInterval(userState.timerInterval);
    const totalExamSeconds = userState.examDurationMinutes * 60;

    const renderTimer = () => {
      const remaining = Math.max(0, totalExamSeconds - userState.elapsedSeconds);
      timerDisplay.textContent = `${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(remaining % 60).padStart(2, "0")}`;
    };
    renderTimer();
    if (!userState.timerStarted || userState.timerPaused) return;
    userState.timerInterval = setInterval(() => {
      if (userState.submitted) return;
      userState.elapsedSeconds++;
      const remaining = Math.max(0, totalExamSeconds - userState.elapsedSeconds);
      renderTimer();
      if (remaining === 0 && !userState.submitted) {
        gradeAndSubmit();
      }
      if (userState.elapsedSeconds % 15 === 0) saveState();
    }, 1000);
  }

  // Render Question Navigation Palette
  function renderPalette() {
    paletteContainer.innerHTML = "";
    questions.forEach((q, idx) => {
      const btn = document.createElement("button");
      btn.className = "palette-btn";
      btn.textContent = `Q${idx + 1}`;
      btn.title = `${q.topic} - ${q.title}`;

      const ans = userState.answers[q.id];
      if (idx === currentIndex) {
        btn.classList.add("active");
      }
      if (ans && (ans.selectedChoice || (ans.testResults && ans.testResults.length > 0 && ans.isCorrect))) {
        btn.classList.add("answered");
      }
      if (ans && ans.flagged) {
        btn.classList.add("flagged");
      }

      btn.addEventListener("click", () => {
        saveCurrentInput();
        renderQuestion(idx);
      });
      paletteContainer.appendChild(btn);
    });
    updatePaletteControls();
    requestAnimationFrame(scrollActivePaletteButtonIntoView);
  }

  function scrollPalette(direction) {
    if (!paletteViewport) return;
    paletteViewport.scrollBy({ left: direction * Math.max(180, paletteViewport.clientWidth * 0.7), behavior: "smooth" });
  }

  function updatePaletteControls() {
    if (!paletteViewport) return;
    const maxScrollLeft = paletteViewport.scrollWidth - paletteViewport.clientWidth;
    if (btnPalettePrev) btnPalettePrev.disabled = paletteViewport.scrollLeft <= 1;
    if (btnPaletteNext) btnPaletteNext.disabled = maxScrollLeft <= 1 || paletteViewport.scrollLeft >= maxScrollLeft - 1;
  }

  function scrollActivePaletteButtonIntoView() {
    const activeButton = paletteContainer.querySelector(".palette-btn.active");
    if (activeButton) activeButton.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  }

  // Render Active Question
  function renderQuestion(index) {
    if (!questions || questions.length === 0) {
      questionTitle.textContent = "No questions match your filter";
      questionPrompt.innerHTML = `
        <div style="padding: 1.5rem 0; color: var(--text-muted);">
          <p>There are currently no questions for <strong>Question set: ${escapeHtml(userState.selectedSeverity)}</strong> and <strong>Exercise: ${escapeHtml(userState.selectedExercise)}</strong>.</p>
          <p style="margin-top: 10px;">Please choose <em>All levels</em> or <em>All exercises</em> in the dropdown above to load questions.</p>
        </div>
      `;
      badgeTopic.textContent = userState.selectedExercise;
      badgeDifficulty.textContent = userState.selectedSeverity;
      badgeDifficulty.className = "badge badge-difficulty";
      badgePoints.textContent = "0 Points";
      questionStatusText.textContent = "0 of 0 questions";
      codeEditorCard.style.display = "none";
      consoleCard.style.display = "none";
      conceptualChoicesCard.style.display = "none";
      paletteContainer.innerHTML = "";
      return;
    }

    if (index < 0 || index >= questions.length) index = 0;
    currentIndex = index;
    const q = questions[index];
    if (!q) return;

    if (!userState.answers || typeof userState.answers !== "object") {
      userState.answers = {};
    }
    if (!userState.answers[q.id]) {
      userState.answers[q.id] = {
        code: q.starterCode || "",
        selectedChoice: null,
        isCorrect: false,
        score: 0,
        flagged: false,
        testResults: []
      };
    }
    const ans = userState.answers[q.id];
    userState.activeQuestionId = q.id;
    saveState();

    // Immediate title and prompt update
    questionTitle.textContent = `${index + 1}. ${q.title}`;
    questionPrompt.innerHTML = formatMarkdown(q.prompt);
    questionStatusText.textContent = `Question ${index + 1} of ${questions.length} • Type: ${q.type === 'code' ? 'Live Coding Sandbox' : 'Conceptual Analysis'}`;

    // Badges & Meta
    badgeTopic.textContent = q.topic || "";
    const displaySeverity = q.severity || q.difficulty || "Medium";
    badgeDifficulty.textContent = displaySeverity;
    badgeDifficulty.className = `badge badge-difficulty ${displaySeverity}`;
    badgePoints.textContent = `${q.points || 10} Points`;

    // Flag icon state
    if (flagIcon) flagIcon.textContent = ans.flagged ? "🚩 Flagged" : "🏳️ Flag";
    if (btnFlag) btnFlag.style.borderColor = ans.flagged ? "var(--warning)" : "var(--border-color)";

    solutionExplanationContainer.innerHTML = "";
    if (userState.submitted) {
      renderSolutionBox(q);
    }

    // Toggle Workspace based on Question Type
    if (q.type === "code") {
      codeEditorCard.style.display = "flex";
      consoleCard.style.display = "flex";
      conceptualChoicesCard.style.display = "none";

      codeInput.value = ans.code || q.starterCode;
      updateLineNumbers();

      // Render previous test results if present
      if (ans.testResults && ans.testResults.length > 0) {
        renderTestResults(ans.testResults);
      } else {
        testOutputBody.innerHTML = `
          <div style="color: var(--text-dim); text-align: center; padding: 1.25rem 0;">
            Click <strong>Run Tests</strong> (or press <strong>Ctrl+Enter</strong>) to run assertions.
          </div>
        `;
      }
    } else {
      codeEditorCard.style.display = "none";
      consoleCard.style.display = "none";
      conceptualChoicesCard.style.display = "flex";

      renderConceptualChoices(q, ans);
    }

    // Update Palette active state
    renderPalette();

    // Footer buttons state
    btnPrev.disabled = index === 0;
    btnNext.textContent = index === questions.length - 1 ? "Finish Exam →" : "Next Question →";
  }

  // Render Multiple Choice Options for conceptual questions
  function renderConceptualChoices(q, ans) {
    choicesContainer.innerHTML = "";
    q.options.forEach((opt) => {
      const optDiv = document.createElement("div");
      optDiv.className = `choice-option ${ans.selectedChoice === opt.id ? "selected" : ""}`;
      
      if (userState.submitted) {
        if (opt.id === q.correctAnswer) {
          optDiv.style.borderColor = "var(--success)";
          optDiv.style.background = "var(--success-bg)";
        } else if (ans.selectedChoice === opt.id && opt.id !== q.correctAnswer) {
          optDiv.style.borderColor = "var(--danger)";
          optDiv.style.background = "var(--danger-bg)";
        }
      }

      optDiv.innerHTML = `
        <div class="choice-marker">${opt.id}</div>
        <div class="choice-text">${formatMarkdown(opt.text)}</div>
      `;

      optDiv.addEventListener("click", () => {
        if (userState.submitted) return;
        ans.selectedChoice = opt.id;
        ans.isCorrect = (opt.id === q.correctAnswer);
        ans.score = ans.isCorrect ? q.points : 0;
        saveState();
        renderConceptualChoices(q, ans);
        renderPalette();
        updateScoreDisplay();
      });

      choicesContainer.appendChild(optDiv);
    });
  }

  // Line Numbers Sync & Syntax Check
  function updateSyntaxBadge() {
    if (!editorSyntaxBadge || !codeInput) return;
    const code = codeInput.value;
    if (!code || !code.trim()) {
      editorSyntaxBadge.style.display = "none";
      return;
    }
    editorSyntaxBadge.style.display = "inline-flex";
    try {
      new Function(code);
      editorSyntaxBadge.className = "editor-syntax-badge valid";
      editorSyntaxBadge.textContent = "✓ Syntax Valid";
      editorSyntaxBadge.title = "JavaScript syntax is valid";
    } catch (err) {
      editorSyntaxBadge.className = "editor-syntax-badge invalid";
      const firstLine = (err.message || String(err)).split("\n")[0];
      editorSyntaxBadge.textContent = `⚠ ${firstLine}`;
      editorSyntaxBadge.title = err.message;
    }
  }

  function updateLineNumbers() {
    const lines = (codeInput.value || "").split("\n").length;
    let numbersHtml = "";
    for (let i = 1; i <= Math.max(lines, 8); i++) {
      numbersHtml += `${i}<br>`;
    }
    lineNumbers.innerHTML = numbersHtml;
    updateSyntaxBadge();
  }

  // Code Execution Engine
  function runCodeTests() {
    const q = questions[currentIndex];
    if (q.type !== "code") return;

    const userCode = codeInput.value.trim();
    const ans = userState.answers[q.id];
    ans.code = userCode;

    // 1. Constraint check
    if (q.validationCheck) {
      const validation = q.validationCheck(userCode);
      if (!validation.allowed) {
        testOutputBody.innerHTML = `
          <div class="test-item fail">
            <div class="test-left">
              <span class="test-status-tag fail">RESTRICTION</span>
              <span class="test-name">${validation.reason}</span>
            </div>
          </div>
        `;
        ans.isCorrect = false;
        ans.score = 0;
        saveState();
        renderPalette();
        updateScoreDisplay();
        return;
      }
    }

    // 2. Extract function name
    let fnNameMatch = userCode.match(/function\s+([a-zA-Z0-9_$]+)/);
    let fnName = fnNameMatch ? fnNameMatch[1] : null;

    if (!fnName) {
      // Check arrow function: const reverseInt = ...
      let arrowMatch = userCode.match(/(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=/);
      if (arrowMatch) fnName = arrowMatch[1];
    }

    if (!fnName) {
      testOutputBody.innerHTML = `
        <div class="test-item fail">
          <div class="test-left">
            <span class="test-status-tag fail">SYNTAX</span>
            <span class="test-name">Could not detect top-level function declaration. Ensure you define a function (e.g. <code>function reverseString(...)</code>).</span>
          </div>
        </div>
      `;
      return;
    }

    // 3. Compile & Run Tests
    let results = [];
    let allPassed = true;

    try {
      // Evaluate user code in a function body returning the target function
      const runner = new Function(`
        ${userCode}
        if (typeof ${fnName} !== 'function') {
          throw new Error("${fnName} is not a function");
        }
        return ${fnName};
      `);

      const targetFn = runner();

      q.tests.forEach((testCase) => {
        let t0 = performance.now();
        let passed = false;
        let actual = undefined;
        let errorMessage = null;

        try {
          // Deep clone input to prevent mutation issues
          const clonedInput = JSON.parse(JSON.stringify(testCase.input));
          actual = targetFn(...clonedInput);
          passed = JSON.stringify(actual) === JSON.stringify(testCase.expected);
        } catch (err) {
          errorMessage = err.message || String(err);
          passed = false;
        }
        let t1 = performance.now();

        if (!passed) allPassed = false;

        results.push({
          name: testCase.name,
          passed,
          duration: (t1 - t0).toFixed(2),
          input: testCase.input,
          expected: testCase.expected,
          actual,
          errorMessage
        });
      });
    } catch (compileErr) {
      testOutputBody.innerHTML = `
        <div class="test-item fail">
          <div class="test-left">
            <span class="test-status-tag fail">COMPILATION ERROR</span>
            <div>
              <div class="test-name">${compileErr.name}: ${compileErr.message}</div>
            </div>
          </div>
        </div>
      `;
      ans.testResults = [];
      ans.isCorrect = false;
      ans.score = 0;
      saveState();
      renderPalette();
      return;
    }

    // Save results
    ans.testResults = results;
    ans.isCorrect = allPassed;
    ans.score = allPassed ? q.points : Math.round((results.filter(r => r.passed).length / results.length) * q.points);
    saveState();

    renderTestResults(results);
    renderPalette();
    updateScoreDisplay();
  }

  function renderTestResults(results) {
    const passedCount = results.filter(r => r.passed).length;
    const totalCount = results.length;
    const allPass = passedCount === totalCount;

    let html = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; padding-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.06);">
        <span style="color: ${allPass ? 'var(--success)' : 'var(--warning)'}; font-weight: 700; font-size: 0.8rem;">
          ${allPass ? '✓ ALL TESTS PASSED' : `⚠ ${passedCount}/${totalCount} TESTS PASSED`}
        </span>
        <span style="font-size: 0.72rem; color: var(--text-dim);">Jest-Style Browser Runner</span>
      </div>
    `;

    results.forEach((r) => {
      html += `
        <div class="test-item ${r.passed ? 'pass' : 'fail'}">
          <div class="test-left">
            <span class="test-status-tag ${r.passed ? 'pass' : 'fail'}">${r.passed ? 'PASS' : 'FAIL'}</span>
            <div>
              <div class="test-name">${r.name}</div>
              ${!r.passed ? `
                <div class="test-detail">
                  Expected: <span style="color: #67e8f9;">${JSON.stringify(r.expected)}</span> | 
                  Received: <span style="color: #f87171;">${r.errorMessage ? 'Error: ' + r.errorMessage : JSON.stringify(r.actual)}</span>
                </div>
              ` : ''}
            </div>
          </div>
          <div style="font-size: 0.72rem; color: var(--text-dim);">${r.duration}ms</div>
        </div>
      `;
    });

    testOutputBody.innerHTML = html;
  }

  function evaluateCodeTests(q, code) {
    if (q.validationCheck && !q.validationCheck(code).allowed) return { results: [], allPassed: false };
    const declared = code.match(/function\s+([a-zA-Z0-9_$]+)/) || code.match(/(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=/);
    if (!declared) return { results: [], allPassed: false };

    try {
      const fnName = declared[1];
      const targetFn = new Function(`${code}\nif (typeof ${fnName} !== 'function') throw new Error('${fnName} is not a function');\nreturn ${fnName};`)();
      const results = q.tests.map((testCase) => {
        const startedAt = performance.now();
        let actual, errorMessage = null, passed = false;
        try {
          actual = targetFn(...JSON.parse(JSON.stringify(testCase.input)));
          passed = JSON.stringify(actual) === JSON.stringify(testCase.expected);
        } catch (error) {
          errorMessage = error.message || String(error);
        }
        return { name: testCase.name, passed, duration: (performance.now() - startedAt).toFixed(2), input: testCase.input, expected: testCase.expected, actual, errorMessage };
      });
      return { results, allPassed: results.every((result) => result.passed) };
    } catch (error) {
      return { results: [], allPassed: false };
    }
  }

  // Solution Box Display
  function renderSolutionBox(q) {
    let solHtml = `
      <div class="explanation-box">
        <div class="explanation-header">💡 Reference Solution & Analysis</div>
        <div class="explanation-text">${formatMarkdown(q.explanation)}</div>
        ${q.solution ? `
          <pre style="margin-top: 10px; background: #0b111c; padding: 10px; border-radius: var(--radius-sm); font-family: var(--font-code); font-size: 0.82rem; overflow-x: auto; color: #a5b4fc; border: 1px solid var(--border-color);">${escapeHtml(q.solution)}</pre>
        ` : ''}
      </div>
    `;
    solutionExplanationContainer.innerHTML = solHtml;
  }

  // Update Score in Footer
  function updateScoreDisplay() {
    let currentScore = 0;
    let totalScore = 0;
    questions.forEach((q) => {
      totalScore += q.points;
      const ans = userState.answers[q.id];
      if (ans && ans.score) currentScore += ans.score;
    });

    footerCurrentScore.textContent = `${currentScore} / ${totalScore} pts`;
  }

  function saveCurrentInput() {
    const q = questions[currentIndex];
    const ans = userState.answers[q.id];
    if (q.type === "code") {
      ans.code = codeInput.value;
    }
    saveState();
  }

  // Grade Exam & Open Score Modal
  function gradeAndSubmit() {
    // A submitted attempt is immutable. Reopen its scorecard instead of saving
    // a duplicate History item every time the learner reviews it.
    if (userState.submitted) {
      resultsModal.classList.add("show");
      return;
    }
    saveCurrentInput();

    // Re-run every code answer so a stale passing result cannot earn points.
    questions.forEach((q) => {
      if (q.type === "code") {
        const ans = userState.answers[q.id];
        const evaluation = evaluateCodeTests(q, ans.code || "");
        ans.testResults = evaluation.results;
        ans.isCorrect = evaluation.allPassed;
        ans.score = evaluation.results.length ? Math.round((evaluation.results.filter((result) => result.passed).length / evaluation.results.length) * q.points) : 0;
      }
    });

    userState.submitted = true;
    saveState();
    updateTestControl();

    // Tally Points
    let totalEarned = 0;
    let totalPossible = 0;
    let passedCount = 0;

    modalReviewList.innerHTML = "";

    questions.forEach((q, idx) => {
      totalPossible += q.points;
      const ans = userState.answers[q.id];
      const earned = ans.score || 0;
      totalEarned += earned;
      if (ans.isCorrect) passedCount++;

      const reviewItem = document.createElement("div");
      reviewItem.className = "review-item";
      reviewItem.innerHTML = `
        <div class="review-left">
          <span class="test-status-tag ${ans.isCorrect ? 'pass' : 'fail'}">
            ${ans.isCorrect ? 'PASSED' : 'RETRY'}
          </span>
          <div>
            <div style="font-weight: 600; font-size: 0.9rem; color: #ffffff;">Q${idx + 1}: ${q.title}</div>
            <div style="font-size: 0.75rem; color: var(--text-dim); margin-top: 2px;">
              Topic: ${q.topic} • Day ${q.day}
            </div>
          </div>
        </div>
        <div style="font-weight: 700; font-family: var(--font-code); color: ${ans.isCorrect ? '#34d399' : '#f87171'}; font-size: 0.9rem;">
          ${earned} / ${q.points} pts
        </div>
      `;

      reviewItem.addEventListener("click", () => {
        resultsModal.classList.remove("show");
        renderQuestion(idx);
      });

      modalReviewList.appendChild(reviewItem);
    });

    const pct = Math.round((totalEarned / totalPossible) * 100);
    scoreCircle.style.setProperty("--score-pct", pct);
    modalPctDisplay.textContent = `${pct}%`;
    modalPtsDisplay.textContent = `${totalEarned}/${totalPossible}`;

    let grade = "Needs Review";
    let gradeColor = "#f87171";
    if (pct >= 90) { grade = "🌟 Mastery"; gradeColor = "#34d399"; }
    else if (pct >= 75) { grade = "👍 Proficient"; gradeColor = "#38bdf8"; }
    else if (pct >= 50) { grade = "⚡ Developing"; gradeColor = "#fbbf24"; }

    modalGradeDisplay.textContent = grade;
    modalGradeDisplay.style.color = gradeColor;

    const mins = Math.floor(userState.elapsedSeconds / 60);
    const secs = userState.elapsedSeconds % 60;
    const timeStr = `${mins}m ${secs}s`;
    modalTimeDisplay.textContent = timeStr;
    modalPassedDisplay.textContent = `${passedCount} / ${questions.length}`;

    // Archive this completed attempt into persistent History
    const attemptData = {
      id: `attempt-${Date.now()}`,
      timestamp: Date.now(),
      dateStr: new Date().toLocaleString(),
      severity: userState.selectedSeverity,
      exercise: userState.selectedExercise,
      score: totalEarned,
      totalPossible: totalPossible,
      percentage: pct,
      grade: grade,
      timeStr: timeStr,
      passedCount: passedCount,
      totalCount: questions.length,
      answers: JSON.parse(JSON.stringify(userState.answers)),
      questionsSnapshot: questions.map((q) => ({
        id: q.id,
        day: q.day,
        topic: q.topic,
        title: q.title,
        type: q.type,
        difficulty: q.difficulty,
        severity: q.severity,
        points: q.points,
        prompt: q.prompt,
        solution: q.solution,
        explanation: q.explanation,
        options: q.options,
        correctAnswer: q.correctAnswer
      }))
    };
    saveAttemptToHistory(attemptData);
    window._lastGradedAttempt = attemptData;
    localStorage.setItem("algocasts_cbt_pending_project_result", JSON.stringify(attemptData));

    resultsModal.classList.add("show");
    renderQuestion(currentIndex);
  }

  // Bind Listeners
  function bindEvents() {
    if (btnPalettePrev) btnPalettePrev.addEventListener("click", () => scrollPalette(-1));
    if (btnPaletteNext) btnPaletteNext.addEventListener("click", () => scrollPalette(1));
    if (paletteViewport) paletteViewport.addEventListener("scroll", updatePaletteControls, { passive: true });
    window.addEventListener("resize", updatePaletteControls);

    btnPracticeMode.addEventListener("click", () => setTestMode("practice"));
    btnInterviewMode.addEventListener("click", () => setTestMode("interview"));
    // History Modal Open
    if (btnOpenHistory) {
      btnOpenHistory.addEventListener("click", () => {
        renderHistoryList();
        historyModal.classList.add("show");
      });
    }

    if (btnCloseHistory) {
      btnCloseHistory.addEventListener("click", () => {
        historyModal.classList.remove("show");
      });
    }

    if (btnHistoryCloseBottom) {
      btnHistoryCloseBottom.addEventListener("click", () => {
        historyModal.classList.remove("show");
      });
    }

    if (btnHistoryBack) {
      btnHistoryBack.addEventListener("click", () => {
        renderHistoryList();
      });
    }

    if (btnClearHistory) {
      btnClearHistory.addEventListener("click", () => {
        localStorage.removeItem("algocasts_cbt_history");
        window._lastGradedAttempt = null;
        updateHistoryBadge();
        renderHistoryList();
        showToast("History cleared.");
      });
    }

    if (btnExportCurrentResults) {
      btnExportCurrentResults.addEventListener("click", () => {
        if (window._lastGradedAttempt) {
          exportAttemptToMarkdown(window._lastGradedAttempt);
        } else {
          const history = getAttemptsHistory();
          if (history.length > 0) {
            exportAttemptToMarkdown(history[0]);
          } else {
            showToast("No graded attempt available to export.");
          }
        }
      });
    }

    btnTestControl.addEventListener("click", () => {
      if (userState.timerStarted || userState.submitted) {
        resetTest();
        showToast("Test reset. You can start again now.");
        return;
      }
      userState.timerStarted = true;
      userState.timerPaused = false;
      saveState();
      updateTestControl();
      updatePauseButton();
      updateTestModeToggle();
      startTimer();
      showToast("Test started. Good luck!");
    });

    btnPauseTest.addEventListener("click", () => {
      if (!userState.timerStarted || userState.submitted) return;
      userState.timerPaused = !userState.timerPaused;
      if (userState.timerPaused) {
        clearInterval(userState.timerInterval);
        userState.timerInterval = null;
        showToast("Timer paused. Your answers are saved.");
      } else {
        startTimer();
        showToast("Timer resumed.");
      }
      saveState();
      updatePauseButton();
      updateTestModeToggle();
    });

    durationInput.addEventListener("change", () => {
      const minutes = Number.parseInt(durationInput.value, 10);
      userState.examDurationMinutes = Number.isFinite(minutes) ? Math.min(180, Math.max(1, minutes)) : 25;
      durationInput.value = userState.examDurationMinutes;
      saveState();
      startTimer();
      showToast(`Exam time set to ${userState.examDurationMinutes} minute${userState.examDurationMinutes === 1 ? "" : "s"}.`);
    });

    severitySelect.addEventListener("change", () => {
      saveCurrentInput();
      setQuestionSet(severitySelect.value, userState.selectedExercise, true);
      renderPalette();
      renderQuestion(0);
      updateScoreDisplay();
    });

    exerciseSelect.addEventListener("change", () => {
      saveCurrentInput();
      setQuestionSet("All", exerciseSelect.value, true);
      renderPalette();
      renderQuestion(0);
      updateScoreDisplay();
    });

    // Prev & Next
    btnPrev.addEventListener("click", () => {
      saveCurrentInput();
      renderQuestion(currentIndex - 1);
    });

    btnNext.addEventListener("click", () => {
      saveCurrentInput();
      if (currentIndex === questions.length - 1) {
        gradeAndSubmit();
      } else {
        renderQuestion(currentIndex + 1);
      }
    });

    // Save Progress Button
    btnSave.addEventListener("click", () => {
      saveCurrentInput();
      const orig = btnSave.innerHTML;
      btnSave.innerHTML = "✓ Saved!";
      setTimeout(() => { btnSave.innerHTML = orig; }, 1200);
    });

    // Flag question
    btnFlag.addEventListener("click", () => {
      const q = questions[currentIndex];
      const ans = userState.answers[q.id];
      ans.flagged = !ans.flagged;
      saveState();
      renderPalette();
      flagIcon.textContent = ans.flagged ? "🚩 Flagged" : "🏳️ Flag";
      btnFlag.style.borderColor = ans.flagged ? "var(--warning)" : "var(--border-color)";
    });

    // Hint toggle
    btnShowHint.addEventListener("click", () => {
      const q = questions[currentIndex];
      solutionExplanationContainer.innerHTML = `
        <div class="explanation-box">
          <div class="explanation-header">💡 Hint</div>
          <div class="explanation-text">${formatMarkdown(q.explanation || "Focus on the key data structures and edge conditions discussed in class.")}</div>
        </div>`;
    });

    // Run Tests button
    btnRunTests.addEventListener("click", runCodeTests);

    // Reset code button
    btnResetCode.addEventListener("click", () => {
      const q = questions[currentIndex];
      codeInput.value = q.starterCode;
      updateLineNumbers();
      saveCurrentInput();
      showToast("Starter code restored.");
    });

    // Submit Exam button
    btnSubmitExam.addEventListener("click", () => {
      gradeAndSubmit();
    });

    // Modal Close
    btnModalClose.addEventListener("click", () => {
      resultsModal.classList.remove("show");
    });

    btnModalFinish.addEventListener("click", () => {
      finishTest();
    });

    btnCompletionReview.addEventListener("click", () => {
      resultsModal.classList.add("show");
    });

    btnCompletionRestart.addEventListener("click", resetTest);

    // Retake Test
    btnRetakeTest.addEventListener("click", () => {
      resetTest();
      showToast("Test reset. You can start again now.");
    });

    // Editor textarea enhancements (Tab key indent, line numbers sync, Ctrl+Enter)
    codeInput.addEventListener("input", () => {
      updateLineNumbers();
      clearTimeout(codeSaveTimeout);
      codeSaveTimeout = setTimeout(saveCurrentInput, 350);
    });
    codeInput.addEventListener("scroll", () => {
      lineNumbers.scrollTop = codeInput.scrollTop;
    });

    codeInput.addEventListener("keydown", (e) => {
      // 1. Ctrl+Enter or Cmd+Enter to run tests
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        runCodeTests();
        return;
      }

      // 2. Tab & Shift+Tab Indentation / Dedentation
      if (e.key === "Tab") {
        e.preventDefault();
        const start = codeInput.selectionStart;
        const end = codeInput.selectionEnd;
        const val = codeInput.value;

        if (start === end) {
          if (e.shiftKey) {
            // Dedent current line by up to 2 leading spaces
            const lineStart = val.lastIndexOf("\n", start - 1) + 1;
            const linePrefix = val.substring(lineStart, lineStart + 2);
            if (linePrefix === "  ") {
              codeInput.setRangeText("", lineStart, lineStart + 2, "end");
              codeInput.selectionStart = codeInput.selectionEnd = Math.max(lineStart, start - 2);
            } else if (linePrefix.startsWith(" ")) {
              codeInput.setRangeText("", lineStart, lineStart + 1, "end");
              codeInput.selectionStart = codeInput.selectionEnd = Math.max(lineStart, start - 1);
            }
          } else {
            // Insert 2 spaces
            codeInput.setRangeText("  ", start, end, "end");
            codeInput.selectionStart = codeInput.selectionEnd = start + 2;
          }
        } else {
          // Multi-line indent/dedent
          const firstLineStart = val.lastIndexOf("\n", start - 1) + 1;
          let lastLineEnd = val.indexOf("\n", end);
          if (lastLineEnd === -1) lastLineEnd = val.length;

          const selectedBlock = val.substring(firstLineStart, lastLineEnd);
          const lines = selectedBlock.split("\n");

          if (e.shiftKey) {
            const modified = lines
              .map((line) => (line.startsWith("  ") ? line.slice(2) : (line.startsWith(" ") ? line.slice(1) : line)))
              .join("\n");
            codeInput.setRangeText(modified, firstLineStart, lastLineEnd, "select");
          } else {
            const modified = lines.map((line) => "  " + line).join("\n");
            codeInput.setRangeText(modified, firstLineStart, lastLineEnd, "select");
          }
        }
        updateLineNumbers();
        saveCurrentInput();
        return;
      }

      // 3. Smart Enter (Auto-Indent & Bracket Expansion)
      if (e.key === "Enter" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        const start = codeInput.selectionStart;
        const end = codeInput.selectionEnd;
        const val = codeInput.value;

        // Find indentation of current line
        const lineStart = val.lastIndexOf("\n", start - 1) + 1;
        const currentLine = val.substring(lineStart, start);
        const matchIndent = currentLine.match(/^[ \t]*/);
        const indent = matchIndent ? matchIndent[0] : "";

        const prevChar = val[start - 1];
        const nextChar = val[start];

        if (prevChar === "{" && nextChar === "}") {
          // Expand { | } into indented block
          const extraIndent = indent + "  ";
          const insertText = "\n" + extraIndent + "\n" + indent;
          codeInput.setRangeText(insertText, start, end, "end");
          codeInput.selectionStart = codeInput.selectionEnd = start + 1 + extraIndent.length;
        } else if (prevChar === "{" || prevChar === "(" || prevChar === "[") {
          const extraIndent = indent + "  ";
          const insertText = "\n" + extraIndent;
          codeInput.setRangeText(insertText, start, end, "end");
          codeInput.selectionStart = codeInput.selectionEnd = start + insertText.length;
        } else {
          const insertText = "\n" + indent;
          codeInput.setRangeText(insertText, start, end, "end");
          codeInput.selectionStart = codeInput.selectionEnd = start + insertText.length;
        }
        updateLineNumbers();
        saveCurrentInput();
        return;
      }

      // 4. Smart Backspace (Delete matching empty pair)
      if (e.key === "Backspace" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const start = codeInput.selectionStart;
        const end = codeInput.selectionEnd;
        if (start === end && start > 0) {
          const prev = codeInput.value[start - 1];
          const next = codeInput.value[start];
          if (
            (prev === "(" && next === ")") ||
            (prev === "[" && next === "]") ||
            (prev === "{" && next === "}") ||
            (prev === '"' && next === '"') ||
            (prev === "'" && next === "'") ||
            (prev === "`" && next === "`")
          ) {
            e.preventDefault();
            codeInput.setRangeText("", start - 1, start + 1, "end");
            codeInput.selectionStart = codeInput.selectionEnd = start - 1;
            updateLineNumbers();
            saveCurrentInput();
            return;
          }
        }
      }

      // 5. Auto-closing pairs & Quote Wrapping
      const PAIRS = {
        "(": ")",
        "[": "]",
        "{": "}",
        '"': '"',
        "'": "'",
        "`": "`"
      };
      const CLOSING_CHARS = new Set([")", "]", "}", '"', "'", "`"]);

      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        const start = codeInput.selectionStart;
        const end = codeInput.selectionEnd;

        // Overtype existing closing bracket or quote
        if (CLOSING_CHARS.has(e.key) && start === end && codeInput.value[start] === e.key) {
          e.preventDefault();
          codeInput.selectionStart = codeInput.selectionEnd = start + 1;
          return;
        }

        // Typing opening bracket or quote
        if (PAIRS[e.key]) {
          e.preventDefault();
          const closing = PAIRS[e.key];
          if (start !== end) {
            // Wrap selected text
            const selected = codeInput.value.substring(start, end);
            codeInput.setRangeText(e.key + selected + closing, start, end, "select");
            codeInput.selectionStart = start + 1;
            codeInput.selectionEnd = end + 1;
          } else {
            // Insert pair and place cursor inside
            codeInput.setRangeText(e.key + closing, start, start, "end");
            codeInput.selectionStart = codeInput.selectionEnd = start + 1;
          }
          updateLineNumbers();
          saveCurrentInput();
          return;
        }
      }

      // 6. Safe operators injection
      if (!e.ctrlKey && !e.metaKey && !e.altKey && ["<", ">", "=", "!"].includes(e.key)) {
        e.preventDefault();
        insertIntoEditor(e.key);
      }
    });

    document.querySelectorAll(".editor-operators button").forEach((button) => {
      button.addEventListener("click", () => {
        insertIntoEditor(button.dataset.insert);
      });
    });
  }

  function insertIntoEditor(text) {
    const start = codeInput.selectionStart;
    const end = codeInput.selectionEnd;
    codeInput.setRangeText(text, start, end, "end");
    if (["()", "{}", "[]"].includes(text) && start === end) {
      codeInput.selectionStart = codeInput.selectionEnd = start + 1;
    }
    codeInput.focus();
    updateLineNumbers();
    saveCurrentInput();
  }

  function resetTest() {
    localStorage.removeItem("algocasts_cbt_state");
    userState.elapsedSeconds = 0;
    userState.timerStarted = false;
    userState.timerPaused = false;
    userState.submitted = false;
    userState.finished = false;
    userState.testMode = "practice";
    userState.interviewQuestionIds = [];
    userState.activeQuestionId = null;
    userState.selectedSeverity = "Low";
    userState.selectedExercise = "All";
    userState.examDurationMinutes = 25;
    userState.answers = {};
    window._lastGradedAttempt = null;
    initUserState();
    setQuestionSet(userState.selectedSeverity);
    startTimer();
    updatePauseButton();
    updateTestModeToggle();
    resultsModal.classList.remove("show");
    setFinishedView(false);
    renderPalette();
    renderQuestion(0);
    updateScoreDisplay();
  }

  function setTestMode(mode) {
    if (userState.timerStarted || userState.submitted) {
      showToast("Reset the current test before changing modes.");
      return;
    }
    userState.testMode = mode;
    setQuestionSet(userState.selectedSeverity, userState.selectedExercise, true);
    updateTestModeToggle();
    renderPalette();
    renderQuestion(0);
    updateScoreDisplay();
    showToast(mode === "interview" ? "Interview mode: a random set is ready." : "Practice mode: tutorial order restored.");
  }

  function finishTest() {
    if (!userState.submitted) {
      showToast("Submit & Grade the test before finishing it.");
      return;
    }
    userState.finished = true;
    userState.timerStarted = false;
    userState.timerPaused = false;
    clearInterval(userState.timerInterval);
    userState.timerInterval = null;
    saveState();
    updatePauseButton();
    resultsModal.classList.remove("show");
    setFinishedView(true);
    showToast("Test finished. Your attempt is saved in History.");
    saveResultToProject(window._lastGradedAttempt);
  }

  async function saveResultToProject(attempt) {
    if (!attempt) return;
    try {
      const response = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attempt)
      });
      if (!response.ok) throw new Error("Save request failed");
      const result = await response.json();
      localStorage.removeItem("algocasts_cbt_pending_project_result");
      showToast(`Test finished. Saved to ${result.file}.`);
    } catch (error) {
      // The app still works in Live Server or file previews; project saving
      // requires the included local Node server.
      showToast("Test finished. Start server.js to save a project copy.");
    }
  }

  function savePendingProjectResult() {
    try {
      const pending = localStorage.getItem("algocasts_cbt_pending_project_result");
      if (pending) saveResultToProject(JSON.parse(pending));
    } catch (error) {
      console.warn("Could not read pending project result", error);
    }
  }

  function setFinishedView(isFinished) {
    document.body.classList.toggle("test-finished", Boolean(isFinished));
    completionPanel.hidden = !isFinished;
  }

  function updateTestControl() {
    if (userState.submitted) {
      btnTestControl.textContent = "↻ Start Over";
      btnTestControl.title = "Clear this attempt and start again";
    } else if (userState.timerStarted) {
      btnTestControl.textContent = "↻ Reset Test";
      btnTestControl.title = "Clear answers and restart this test";
    } else {
      btnTestControl.textContent = "▶ Start Test";
      btnTestControl.title = "Start the exam timer";
    }
  }

  function updatePauseButton() {
    const canPause = userState.timerStarted && !userState.submitted && !userState.finished;
    btnPauseTest.disabled = !canPause;
    btnPauseTest.textContent = userState.timerPaused ? "▶ Resume" : "⏸ Pause";
    btnPauseTest.title = userState.timerPaused ? "Resume the exam timer" : "Pause the exam timer";
    timerDisplay.parentElement.classList.toggle("paused", userState.timerPaused);
  }

  function updateTestModeToggle() {
    const interview = userState.testMode === "interview";
    btnPracticeMode.classList.toggle("active", !interview);
    btnInterviewMode.classList.toggle("active", interview);
    btnPracticeMode.setAttribute("aria-pressed", String(!interview));
    btnInterviewMode.setAttribute("aria-pressed", String(interview));
    const locked = userState.timerStarted || userState.submitted;
    btnPracticeMode.disabled = locked;
    btnInterviewMode.disabled = locked;
    // In practice, you can adjust the duration only while the timer is
    // paused. It locks again as soon as the countdown resumes.
    durationInput.disabled = userState.submitted || (userState.timerStarted && !userState.timerPaused);
    setCustomDropdownDisabled(severitySelect, locked);
    setCustomDropdownDisabled(exerciseSelect, locked);
  }

  function setCustomDropdownDisabled(select, disabled) {
    if (!select) return;
    select.disabled = disabled;
    const entry = customDropdowns.get(select);
    if (entry) entry.trigger.disabled = disabled;
  }

  function showToast(message) {
    appToast.textContent = message;
    appToast.classList.add("show");
    clearTimeout(showToast.timeoutId);
    showToast.timeoutId = setTimeout(() => appToast.classList.remove("show"), 2400);
  }

  // History & Attempts Management
  function getAttemptsHistory() {
    try {
      const raw = localStorage.getItem("algocasts_cbt_history");
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn("Could not read attempts history", e);
      return [];
    }
  }

  function saveAttemptToHistory(attempt) {
    try {
      const history = getAttemptsHistory();
      history.unshift(attempt); // newest first
      if (history.length > 50) history.pop();
      localStorage.setItem("algocasts_cbt_history", JSON.stringify(history));
      updateHistoryBadge();
    } catch (e) {
      console.warn("Could not save attempt to history", e);
    }
  }

  function updateHistoryBadge() {
    const history = getAttemptsHistory();
    if (historyCountBadge) {
      historyCountBadge.textContent = history.length;
    }
  }

  function renderHistoryList() {
    if (!historyAttemptsList || !historyInspectView) return;
    historyInspectView.style.display = "none";
    historyAttemptsList.style.display = "flex";
    if (btnHistoryBack) btnHistoryBack.style.display = "none";

    const history = getAttemptsHistory();
    historyAttemptsList.innerHTML = "";

    if (history.length === 0) {
      historyAttemptsList.innerHTML = `
        <div style="text-align: center; padding: 2.5rem 1rem; color: var(--text-dim);">
          <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">📋</div>
          <h3 style="color: #cbd5e1; font-size: 1.1rem;">No Past Attempts Found</h3>
          <p style="font-size: 0.85rem; margin-top: 4px;">Complete an exam and click <strong>Submit & Grade</strong> to automatically record and review your attempts here.</p>
        </div>
      `;
      return;
    }

    history.forEach((attempt, index) => {
      const card = document.createElement("div");
      card.className = "history-card";

      const gradeColor = attempt.percentage >= 90 ? "#34d399" : (attempt.percentage >= 75 ? "#38bdf8" : (attempt.percentage >= 50 ? "#fbbf24" : "#f87171"));

      card.innerHTML = `
        <div class="history-card-left">
          <div class="history-score-badge" style="border-color: ${gradeColor};">
            <span class="pct" style="color: ${gradeColor};">${attempt.percentage}%</span>
            <span class="sub">${attempt.score}/${attempt.totalPossible}</span>
          </div>
          <div class="history-meta">
            <h4>
              <span>Attempt #${history.length - index}</span>
              <span class="badge badge-difficulty ${attempt.severity || 'Medium'}" style="font-size: 0.68rem; padding: 2px 7px;">${attempt.severity || 'All'} Set</span>
              <span style="font-size: 0.85rem; color: ${gradeColor}; font-weight: 700;">${attempt.grade}</span>
            </h4>
            <div class="history-meta-sub">
              <span>📅 ${attempt.dateStr}</span>
              <span>⏱ ${attempt.timeStr || 'N/A'}</span>
              <span>🎯 ${attempt.passedCount} / ${attempt.totalCount} Passed</span>
              <span>📚 ${attempt.exercise || 'All Exercises'}</span>
            </div>
          </div>
        </div>

        <div class="history-card-actions">
          <button class="btn btn-primary btn-inspect-attempt" style="font-size: 0.78rem; padding: 6px 12px;">
            🔍 Review Solutions
          </button>
          <button class="btn btn-secondary btn-export-attempt" title="Export as Markdown notes" style="font-size: 0.78rem; padding: 6px 10px;">
            📥 Export
          </button>
          <button class="btn btn-danger btn-delete-attempt" title="Delete attempt" style="font-size: 0.78rem; padding: 6px 9px;">
            ✕
          </button>
        </div>
      `;

      card.querySelector(".btn-inspect-attempt").addEventListener("click", () => {
        inspectAttempt(attempt);
      });

      card.querySelector(".btn-export-attempt").addEventListener("click", () => {
        exportAttemptToMarkdown(attempt);
      });

      card.querySelector(".btn-delete-attempt").addEventListener("click", (e) => {
        e.stopPropagation();
        const updated = history.filter((h) => h.id !== attempt.id);
        localStorage.setItem("algocasts_cbt_history", JSON.stringify(updated));
        if (window._lastGradedAttempt?.id === attempt.id) window._lastGradedAttempt = null;
        updateHistoryBadge();
        renderHistoryList();
        showToast("Attempt removed.");
      });

      historyAttemptsList.appendChild(card);
    });
  }

  function inspectAttempt(attempt) {
    if (!historyAttemptsList || !historyInspectView) return;
    historyAttemptsList.style.display = "none";
    historyInspectView.style.display = "block";
    if (btnHistoryBack) btnHistoryBack.style.display = "inline-flex";

    const questionsList = attempt.questionsSnapshot || [];
    let itemsHtml = `
      <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.2rem; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
        <div>
          <h3 style="font-size: 1.2rem; color: #ffffff;">Reviewing Attempt: ${attempt.dateStr}</h3>
          <div style="font-size: 0.8rem; color: var(--text-dim); margin-top: 4px;">
            Question Set: <strong>${escapeHtml(attempt.severity || 'All')}</strong> • Exercise: <strong>${escapeHtml(attempt.exercise || 'All')}</strong> • Time: <strong>${escapeHtml(attempt.timeStr || '')}</strong>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="text-align: right;">
            <div style="font-size: 1.35rem; font-weight: 800; color: #34d399;">${attempt.percentage}% (${attempt.score}/${attempt.totalPossible} pts)</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${attempt.passedCount}/${attempt.totalCount} Passed • ${attempt.grade}</div>
          </div>
          <button class="btn btn-secondary" id="btn-inspect-export" style="font-size: 0.8rem;">📥 Export Notes</button>
        </div>
      </div>
    `;

    questionsList.forEach((q, idx) => {
      const ans = attempt.answers && attempt.answers[q.id] ? attempt.answers[q.id] : {};
      const isPassed = Boolean(ans.isCorrect);

      itemsHtml += `
        <div class="history-detail-item ${isPassed ? 'passed' : 'failed'}">
          <div class="history-detail-header">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="test-status-tag ${isPassed ? 'pass' : 'fail'}">${isPassed ? 'PASSED' : 'RETRY'}</span>
              <strong style="color: #ffffff; font-size: 0.95rem;">Q${idx + 1}: ${escapeHtml(q.title)}</strong>
              <span class="badge badge-topic" style="font-size: 0.65rem;">${escapeHtml(q.topic)}</span>
              <span class="badge badge-day" style="font-size: 0.65rem;">Day ${q.day}</span>
            </div>
            <div style="font-weight: 700; font-family: var(--font-code); color: ${isPassed ? '#34d399' : '#f87171'}; font-size: 0.85rem;">
              ${ans.score || 0} / ${q.points} pts
            </div>
          </div>

          <div style="font-size: 0.85rem; color: #cbd5e1; line-height: 1.5; margin: 4px 0;">
            ${formatMarkdown(q.prompt)}
          </div>

          ${q.type === 'code' ? `
            <div style="margin-top: 6px;">
              <div style="font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700; margin-bottom: 4px;">Your Submitted Code:</div>
              <div class="code-snippet-box">${escapeHtml(ans.code || "// No code submitted")}</div>
            </div>
          ` : `
            <div style="margin-top: 6px; font-size: 0.85rem;">
              <span style="color: var(--text-dim);">Your Selected Choice:</span>
              <strong style="color: ${isPassed ? '#34d399' : '#f87171'}; font-family: var(--font-code); margin-left: 6px;">${escapeHtml(ans.selectedChoice || "None")}</strong>
              ${!isPassed ? `<span style="color: var(--text-dim); margin-left: 14px;">Correct Answer:</span> <strong style="color: #34d399; font-family: var(--font-code);">${escapeHtml(q.correctAnswer)}</strong>` : ''}
            </div>
          `}

          <!-- Official Solution & Explanation -->
          <div class="explanation-box" style="margin-top: 8px;">
            <div class="explanation-header">💡 Reference Solution & Analysis</div>
            <div class="explanation-text">${formatMarkdown(q.explanation || "")}</div>
            ${q.solution ? `<div class="code-snippet-box" style="margin-top: 8px; color: #a5b4fc;">${escapeHtml(q.solution)}</div>` : ''}
          </div>
        </div>
      `;
    });

    historyInspectView.innerHTML = itemsHtml;

    const btnInspectExport = document.getElementById("btn-inspect-export");
    if (btnInspectExport) {
      btnInspectExport.addEventListener("click", () => exportAttemptToMarkdown(attempt));
    }
  }

  function exportAttemptToMarkdown(attempt) {
    if (!attempt) return;
    const questionsList = attempt.questionsSnapshot || [];

    let md = `# 📅 DSA Assessment Report - ${attempt.dateStr}\n\n`;
    md += `> **Grade:** ${attempt.grade} (${attempt.percentage}%)\n`;
    md += `> **Score:** ${attempt.score} / ${attempt.totalPossible} points\n`;
    md += `> **Questions Passed:** ${attempt.passedCount} / ${attempt.totalCount}\n`;
    md += `> **Time Taken:** ${attempt.timeStr || "N/A"}\n`;
    md += `> **Filter:** Question Set: \`${attempt.severity || "All"}\` | Exercise: \`${attempt.exercise || "All"}\`\n\n`;
    md += `---\n\n`;
    md += `## 📊 Score Summary Table\n\n`;
    md += `| # | Topic | Question | Type | Score | Status |\n`;
    md += `| :---: | :--- | :--- | :---: | :---: | :---: |\n`;

    questionsList.forEach((q, idx) => {
      const ans = attempt.answers && attempt.answers[q.id] ? attempt.answers[q.id] : {};
      const status = ans.isCorrect ? "✅ PASSED" : "❌ RETRY";
      md += `| Q${idx + 1} | ${q.topic} (Day ${q.day}) | ${q.title} | ${q.type} | ${ans.score || 0}/${q.points} | ${status} |\n`;
    });

    md += `\n---\n\n## 📝 Detailed Review & Solutions\n\n`;

    questionsList.forEach((q, idx) => {
      const ans = attempt.answers && attempt.answers[q.id] ? attempt.answers[q.id] : {};
      const status = ans.isCorrect ? "✅ PASSED" : "❌ RETRY";

      md += `### Q${idx + 1}: ${q.title} (${status})\n`;
      md += `- **Topic:** ${q.topic} (Day ${q.day})\n`;
      md += `- **Points Earned:** ${ans.score || 0} / ${q.points}\n\n`;
      md += `#### Problem Prompt\n${q.prompt}\n\n`;

      if (q.type === "code") {
        md += `#### Your Submitted Code\n\`\`\`javascript\n${ans.code || "// No code submitted"}\n\`\`\`\n\n`;
      } else {
        md += `- **Your Answer:** \`${ans.selectedChoice || "None"}\`\n`;
        md += `- **Correct Answer:** \`${q.correctAnswer}\`\n\n`;
      }

      md += `#### 💡 Reference Solution & Explanation\n`;
      md += `${q.explanation || ""}\n\n`;
      if (q.solution) {
        md += `\`\`\`javascript\n${q.solution}\n\`\`\`\n\n`;
      }
      md += `---\n\n`;
    });

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeDate = new Date(attempt.timestamp).toISOString().split("T")[0];
    link.href = url;
    link.download = `DSA-CBT-Attempt-${safeDate}-${attempt.percentage}pct.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Downloaded: DSA-CBT-Attempt-${safeDate}-${attempt.percentage}pct.md`);
  }

});
