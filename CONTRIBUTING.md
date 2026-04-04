# Contributing to lockcheck

Thank you for your interest in contributing to lockcheck! 🛡️

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/<your-username>/lockcheck.git
   cd lockcheck
   ```
3. No dependencies to install! This is a zero-dependency project.

## Development

Run lockcheck locally:

```bash
node bin/lockcheck.js
node bin/lockcheck.js --help
node bin/lockcheck.js --json
node bin/lockcheck.js --no-network
```

## Project Structure

```
lockcheck/
├── bin/lockcheck.js          # CLI entry point
├── src/
│   ├── index.js              # Main scan orchestrator
│   ├── parsers/npm.js        # package-lock.json parser
│   ├── analyzers/
│   │   ├── new-deps.js       # New dependency detection
│   │   ├── version-jump.js   # Suspicious version changes
│   │   ├── typosquat.js      # Typosquat detection
│   │   ├── registry.js       # Registry anomaly detection
│   │   ├── scripts.js        # Install script analysis
│   │   └── freshness.js      # Package freshness checks
│   ├── reporters/terminal.js # Terminal output
│   └── utils/                # Colors, semver, levenshtein, registry client
├── action.yml                # GitHub Action
└── package.json
```

## Adding a New Analyzer

1. Create a new file in `src/analyzers/`
2. Export a function that takes `(current, previous)` maps and returns `{ findings: [] }`
3. Each finding should have: `severity` (critical/warning/info), `name`, `version`, `message`, `detail`
4. Import and call your analyzer in `src/index.js`

## Guidelines

- **Zero dependencies** — this is a core principle. Implement what you need.
- **Node 18+** — we use native `fetch()` and modern APIs.
- **ESM only** — all files use `import/export`.
- Keep analyzers focused — one concern per file.
- Use the color utilities from `src/utils/colors.js` for terminal output.

## Pull Request Process

1. Create a feature branch: `git checkout -b feat/my-feature`
2. Make your changes
3. Test locally: `node bin/lockcheck.js`
4. Commit with a descriptive message
5. Push and open a PR

## Reporting Bugs

Open an issue at [github.com/DhanushNehru/lockcheck/issues](https://github.com/DhanushNehru/lockcheck/issues) with:
- Your Node.js version
- Your OS
- The error output
- Your `package-lock.json` lockfileVersion

## Code of Conduct

Be respectful, inclusive, and constructive. We're all here to make the npm ecosystem safer.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
