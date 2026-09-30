# Contributing

Thanks for helping improve AlgoCasts Learning Extension.

## Before you start

This project is an unofficial extension built on top of Stephen Grider's AlgoCasts. Keep the attribution and GPL-3.0 license notice intact. Only contribute content you have permission to share.

## Set up the project

```bash
git clone <repository-url>
cd <repository-name>
npm install
```

Run the required CBT app check before opening a pull request:

```bash
npm test
```

See [TESTING.md](TESTING.md) for the manual CBT app checklist.

## Ways to contribute

- Add original CBT questions, explanations, or test cases
- Improve accessibility, usability, or documentation
- Fix bugs in the CBT app

## CBT question guidelines

- Write original questions and explanations.
- Give each question a clear exercise topic and difficulty level.
- Keep answer options unambiguous and mark exactly one correct answer unless the UI explicitly supports multiple answers.
- Avoid copying course-only material, paid content, or questions from sources that do not permit reuse.

## Pull requests

1. Create a focused branch and keep each pull request small.
2. Explain what changed and why.
3. Run `npm test` and include the result in the pull-request description.
4. Update documentation when user-facing behaviour changes.
5. Do not commit personal CBT result files, editor settings, secrets, or generated dependency folders.

By participating, you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).
