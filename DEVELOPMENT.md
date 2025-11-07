# Development Guide

This document explains the development workflow for the LiteLLM MCP Server project.

## Branch Strategy

We follow the **Git Flow** branching model:

```
main (PRODUCTION)
  ↓ (release PRs)
develop (DEVELOPMENT)
  ↓ (feature branches)
feature/*, bugfix/*, etc.
```

### Branch Purposes

| Branch | Purpose | Visibility | Access |
|--------|---------|------------|--------|
| `main` | Production-ready code (v1.0.0+) | Public | Protected - PRs only |
| `develop` | Integration branch for next release | Public but not promoted | Team development |
| `feature/*` | Individual feature development | Temporary | Developer's branch |

## Development Workflow

### 1. Starting New Work

```bash
# Make sure develop is up to date
git checkout develop
git pull origin develop

# Create feature branch FROM develop
git checkout -b feature/your-feature-name

# Work on your feature...
git add .
git commit -m "feat: Description of your feature"
```

### 2. Push Your Work

```bash
# Push feature branch to GitHub
git push -u origin feature/your-feature-name

# Create Pull Request: feature/* → develop
# (NOT to main!)
```

### 3. Code Review & Merge

- PR reviewer checks code
- If approved, merge to `develop`
- Feature branch can be deleted after merge

### 4. Release to Production

When `develop` is stable and ready for release:

```bash
# Create release branch
git checkout -b release/v1.0.1

# Update version numbers, CHANGELOG, etc.
git add .
git commit -m "chore: Bump version to v1.0.1"

# Merge to main
git checkout main
git pull origin main
git merge release/v1.0.1

# Create version tag
git tag -a v1.0.1 -m "Release version 1.0.1"
git push origin main --tags

# Merge back to develop
git checkout develop
git merge main
git push origin develop

# Clean up release branch
git branch -d release/v1.0.1
```

## Development Files

The `feat-dev/` folder contains planning and design documents for upcoming features:

```
feat-dev/
├── 001_model_management_endpoints.md
├── 002_chat_completions_endpoints.md
├── 003_audio_endpoints.md
├── ... (21 more endpoint specifications)
├── Issues.md (tracking issues)
├── Progress.md (development progress)
└── ROADMAP.md (feature roadmap)
```

**Note:** These files are for development planning only and should NOT be published to npm. They're automatically excluded via `.npmignore`.

## Publishing to npm

Only `main` branch releases should be published:

```bash
# On main branch with new version tag
npm publish

# Check what will be published
npm publish --dry-run
```

## GitHub Branch Protection Rules

The following rules protect production stability:

- **main branch:**
  - ✅ Require pull request reviews before merging
  - ✅ Require status checks to pass
  - ✅ Dismiss stale pull request approvals
  - ✅ Require branches to be up to date before merging

- **develop branch:**
  - ✅ Recommended: At least 1 review for critical changes
  - ⚠️ Less strict than main (more experimental)

## Tools & Documentation

- **Roadmap:** See `feat-dev/ROADMAP.md`
- **Issues:** See `feat-dev/Issues.md`
- **Progress:** See `feat-dev/Progress.md`
- **API Specs:** See individual endpoint files in `feat-dev/`

## Continuous Integration

GitHub Actions will run on:
- All PRs to `develop` and `main`
- Automated tests before merge
- Automated npm publish on main tag creation

## Questions?

See [CONTRIBUTING.md](CONTRIBUTING.md) for more contribution guidelines.

---

**Last Updated:** November 7, 2025
