const test = require("node:test");
const assert = require("node:assert/strict");
const { validateQuestionBank } = require("./question-validator");
const { CBT_QUESTIONS } = require("./questions");

test("the published question bank is valid", () => {
  assert.deepEqual(validateQuestionBank(CBT_QUESTIONS), { valid: true, errors: [] });
});

test("reports duplicate IDs and invalid conceptual answers", () => {
  const questions = [
    {
      id: "duplicate",
      topic: "Demo",
      title: "First",
      prompt: "Choose one.",
      type: "conceptual",
      severity: "Low",
      points: 1,
      options: [{ id: "A", text: "One" }, { id: "B", text: "Two" }],
      correctAnswer: "C"
    },
    {
      id: "duplicate",
      topic: "Demo",
      title: "Second",
      prompt: "Choose one.",
      type: "conceptual",
      severity: "Low",
      points: 1,
      options: [{ id: "A", text: "One" }, { id: "A", text: "Two" }],
      correctAnswer: "A"
    }
  ];

  const result = validateQuestionBank(questions);
  assert.equal(result.valid, false);
  assert.ok(result.errors.includes(
    'Question 1 correctAnswer must match an option id.',
  ));
  assert.ok(result.errors.includes('Question 2 has duplicate id "duplicate".'));
  assert.ok(result.errors.includes('Question 2 has duplicate option id "A".'));
});
