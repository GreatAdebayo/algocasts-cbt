# Testing Guide

This project includes the CBT app and pristine AlgoCasts learning material.

## Automated check

Run the CBT checks and the pristine reference-solution suite:

```bash
npm test
```

## Manual app check

Before opening a pull request, run `npm run cbt`, open `http://localhost:3030`, and confirm that you can:

1. Start and reset a test.
2. Change the exercise, question level, and time settings.
3. Answer and navigate between questions.
4. Finish a test and review the result.
5. Save a result locally when using the local server.

## Continuous integration policy

GitHub Actions runs `npm test` on every push and pull request. This verifies that the published CBT app source parses correctly.

The question-bank test also rejects duplicate question IDs, invalid severity values, incomplete code-test definitions, duplicate answer options, and conceptual questions whose correct answer is not one of the listed options.

## Original exercise suites

Run the pristine starter exercises with:

```bash
npm run test:exercises
```

Those files are intentionally starter material, so failures are expected until a learner writes a solution. `npm test` runs the separate `completed_exercises/` reference suite instead, which is expected to pass.
