# AlgoCasts CBT

A browser-based CBT and interview practice app for testing your understanding of Data Structures and Algorithms.

I originally built this while taking Stephen Grider's DSA course because I wanted a way to test myself cumulatively across the topics I had already covered, rather than practising one topic at a time.

The project is now open source for anyone learning DSA who wants a simple way to test their knowledge as they progress.

## Features

- Select the DSA topics you want to be tested on
- Combine multiple topics into one test
- Practice and interview modes
- Difficulty filters
- Custom time limits
- Pause and resume tests
- Randomized questions
- Built-in code editor for coding questions
- Review completed attempts
- Save results locally for later review

## How It Works

Choose the topics you've already covered, configure your test, and start a CBT session.

You can focus on a single topic or combine several topics to test how well you're retaining what you've learned over time.

The question bank is customizable in `cbt-app/questions.js`: add your own questions, edit existing ones, and adjust difficulty levels to match what you are currently learning or revising.

## Getting Started

Clone the repository and install the dependencies:

```bash
git clone https://github.com/GreatAdebayo/algocasts-cbt.git
cd algocasts-cbt
npm install
npm run cbt
```

Then open `http://localhost:3030`.

## Learn with an exercise

After `npm install`, run an exercise test in watch mode while you work. Replace `<exercise-name>` with a folder such as `fizzbuzz`, `palindrome`, or `chunk`:

```bash
npx jest exercises/<exercise-name> --watch
```

Jest is installed locally with this project, so you do not need to install it globally.

The result-saving server is local-only: it listens on your computer at `127.0.0.1` and is not intended for public deployment.

Maintainers can find project checks, validation, and CI details in [TESTING.md](TESTING.md).

## Project Structure

| Path | Purpose |
| --- | --- |
| `cbt-app/` | CBT application, question bank, UI, and local results server |
| `exercises/` | Pristine starter exercises restored directly from Stephen Grider's AlgoCasts repository. |
| `completed_exercises/` | Pristine reference solutions from Stephen Grider's AlgoCasts repository. |
| `diagrams/` | Original AlgoCasts diagrams. |

## Results

Completed CBT attempts can be saved locally for later review.

Personal result files are stored in:

```text
cbt-app/results/
```

This directory is excluded from Git, so your test history remains local to your machine.

## Contributing

Contributions are welcome.

Some useful areas for contribution include:

- New original DSA questions
- Improvements to existing questions
- New CBT features
- UI improvements
- Accessibility improvements
- Bug fixes
- Test coverage

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for contribution guidelines.

## Attribution

This project is an unofficial extension built on top of [Stephen Grider's AlgoCasts](https://github.com/StephenGrider/AlgoCasts) repository, the companion repository for his Data Structures and Algorithms course.

The CBT application, question bank, assessment functionality, and additional learning features were added as part of this project.

This project is independent and is not affiliated with, endorsed by, or supported by Stephen Grider or Udemy.

See [`NOTICE.md`](NOTICE.md) for additional attribution information.

## License

This project is distributed under the [GNU General Public License v3.0](LICENSE).

See [`LICENSE`](LICENSE) for details.
