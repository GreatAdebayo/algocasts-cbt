// Validates the question bank in the browser and in Node-based checks.
(function attachQuestionValidator(global) {
  const VALID_TYPES = new Set(["code", "conceptual"]);
  const VALID_SEVERITIES = new Set(["Low", "Medium", "High"]);

  function validateQuestionBank(questions) {
    const errors = [];

    if (!Array.isArray(questions) || questions.length === 0) {
      return { valid: false, errors: ["Question bank must be a non-empty array."] };
    }

    const ids = new Set();
    questions.forEach((question, index) => {
      const label = `Question ${index + 1}`;
      if (!question || typeof question !== "object") {
        errors.push(`${label} must be an object.`);
        return;
      }

      if (typeof question.id !== "string" || question.id.trim() === "") {
        errors.push(`${label} needs a non-empty string id.`);
      } else if (ids.has(question.id)) {
        errors.push(`${label} has duplicate id "${question.id}".`);
      } else {
        ids.add(question.id);
      }

      ["topic", "title", "prompt"].forEach((field) => {
        if (typeof question[field] !== "string" || question[field].trim() === "") {
          errors.push(`${label} needs a non-empty ${field}.`);
        }
      });

      if (!VALID_TYPES.has(question.type)) errors.push(`${label} has an invalid type.`);
      if (!VALID_SEVERITIES.has(question.severity)) errors.push(`${label} has an invalid severity.`);
      if (!Number.isFinite(question.points) || question.points <= 0) errors.push(`${label} needs positive numeric points.`);

      if (question.type === "code") validateCodeQuestion(question, label, errors);
      if (question.type === "conceptual") validateConceptualQuestion(question, label, errors);
    });

    return { valid: errors.length === 0, errors };
  }

  function validateCodeQuestion(question, label, errors) {
    if (typeof question.starterCode !== "string") errors.push(`${label} needs starterCode for a code question.`);
    if (!Array.isArray(question.tests) || question.tests.length === 0) {
      errors.push(`${label} needs at least one code test.`);
      return;
    }
    question.tests.forEach((test, testIndex) => {
      if (!test || typeof test.name !== "string" || !Array.isArray(test.input) || !("expected" in test)) {
        errors.push(`${label} has an invalid test at position ${testIndex + 1}.`);
      }
    });
  }

  function validateConceptualQuestion(question, label, errors) {
    if (!Array.isArray(question.options) || question.options.length < 2) {
      errors.push(`${label} needs at least two answer options.`);
      return;
    }
    const optionIds = new Set();
    question.options.forEach((option, optionIndex) => {
      if (!option || typeof option.id !== "string" || option.id.trim() === "" || typeof option.text !== "string" || option.text.trim() === "") {
        errors.push(`${label} has an invalid option at position ${optionIndex + 1}.`);
      } else if (optionIds.has(option.id)) {
        errors.push(`${label} has duplicate option id "${option.id}".`);
      } else {
        optionIds.add(option.id);
      }
    });
    if (!optionIds.has(question.correctAnswer)) errors.push(`${label} correctAnswer must match an option id.`);
  }

  const api = { validateQuestionBank, VALID_TYPES: [...VALID_TYPES], VALID_SEVERITIES: [...VALID_SEVERITIES] };
  global.CBTQuestionValidator = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);

