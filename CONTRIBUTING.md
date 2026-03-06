# Contributing to slay

Thanks for your interest in contributing!

## Prerequisites

- Node.js >= 18
- npm

## Setup

```bash
# Fork and clone
git clone https://github.com/<your-username>/slay.git
cd slay
npm install
```

## Development workflow

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Lint & format check
npm run check

# Auto-format
npm run format

# Type check
npm run typecheck

# Build
npm run build
```

## Code style

This project uses [Biome](https://biomejs.dev/) for linting and formatting. Run `npm run check` before submitting.

## Testing

Tests use [Vitest](https://vitest.dev/). All new features and bug fixes should include tests. Aim to maintain 100% coverage.

## Building

The CLI is bundled with [tsup](https://tsup.egoist.dev/).

## Pull request process

1. Fork the repo and create a branch from `main`
2. Make your changes
3. Add or update tests as needed
4. Ensure `npm run check`, `npm run typecheck`, and `npm test` all pass
5. Open a PR against `main`

## Commit conventions

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation only
- `test:` adding or updating tests
- `refactor:` code change that neither fixes a bug nor adds a feature
- `chore:` maintenance tasks

## Releasing

Releases are handled via the **Version Bump** GitHub Actions workflow:

1. Go to **Actions > Version Bump** in the GitHub repo
2. Click **Run workflow**
3. Select the bump type: `patch`, `minor`, or `major`
4. The workflow runs tests and typechecks, bumps the version in `package.json`, commits, and pushes a `v*` tag
5. The existing `release.yml` workflow picks up the tag and publishes to npm

Only maintainers can trigger this workflow.

## Questions?

Open an [issue](https://github.com/hammadxcm/slay/issues) or start a [discussion](https://github.com/hammadxcm/slay/discussions).
