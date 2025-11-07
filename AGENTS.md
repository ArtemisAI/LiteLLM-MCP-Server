# AGENTS.md - Development Instructions for Coding Agents

**CRITICAL: This document is ONLY for the develop branch. It is NOT published to npm.**

This document provides strict guidelines for AI agents (Copilot, Claude, etc.) working on the LiteLLM MCP Server development.

## 🎯 Core Principles

1. **Two-Branch Strategy:**
   - `main` = Production (PUBLIC, users download from npm)
   - `develop` = Development (PRIVATE, team-only work)

2. **Never Break the Barrier:**
   - ❌ NEVER merge develop → main without explicit user approval
   - ❌ NEVER publish to npm from develop
   - ❌ NEVER expose feat-dev/ or internal docs to main
   - ✅ ALWAYS keep development work isolated

3. **Protect Production:**
   - main branch must remain clean, stable, and production-ready
   - No experimental code on main
   - All testing happens on develop/feature branches first

## 📋 Mandatory Workflow

### Before Starting ANY Work

```bash
# 1. Verify you're on develop
git branch -a

# 2. Must see: * develop (with arrow indicating local HEAD)
# If on main, STOP and run: git checkout develop

# 3. Update from remote
git pull origin develop

# 4. Verify feat-dev/ folder exists
ls feat-dev/  # Should list 24 development files
```

### Creating a Feature

```bash
# ✅ CORRECT WAY
git checkout develop                          # Start from develop
git checkout -b feature/your-feature          # Create feature branch
# ... make changes ...
git add .
git commit -m "feat: Description"
git push -u origin feature/your-feature

# ❌ WRONG WAYS (DO NOT DO)
git checkout main                             # ❌ Never start from main
git checkout -b feature/your-feature
# ... this would merge feature to main, DISASTER!

git checkout main
git commit -m "feat: Description"             # ❌ Never commit directly to main
# ... this commits production code directly, DISASTER!
```

### Merging to Develop

```bash
# ✅ CORRECT
1. Push feature branch: git push -u origin feature/your-feature
2. Create PR on GitHub: feature/your-feature → develop
3. Get review/approval
4. Merge on GitHub (deletes feature branch)
5. Local: git checkout develop && git pull origin develop

# ❌ WRONG
git merge feature/your-feature                # ❌ Merging locally
git push origin develop                       # ❌ Then pushing - risky!
```

## 🔒 The Forbidden Zone (DO NOT TOUCH)

### Never Modify These Files Directly
```
main branch
├── src/index.ts (only merge via PR)
├── package.json version (only via release PR)
├── CHANGELOG.md (only via release PR)
└── Any production-critical files
```

### Never Push Directly To

```bash
# These commands will be BLOCKED by branch protection:
git push origin main                    # ❌ BLOCKED - use PR instead
git push -f origin main                 # ❌ BLOCKED - force push blocked
git push -f origin develop              # ❌ BLOCKED on develop too

# ✅ ALWAYS use PR workflow:
# 1. Create branch (feature/*, bugfix/*, etc.)
# 2. Push feature branch
# 3. Create PR on GitHub
# 4. Get review
# 5. Merge via GitHub UI (safe)
```

## 📦 What Gets Published to npm

**PUBLISHED** (visible to users):
```
src/
  └── index.ts
package.json
README.md
SECURITY.md
CONTRIBUTING.md
LICENSE
dist/
  └── index.js (compiled)
```

**NOT PUBLISHED** (excluded by .npmignore):
```
❌ feat-dev/ (all 24 files)
❌ DEVELOPMENT.md
❌ AGENTS.md (this file)
❌ copilot-instructions.md
❌ BRANCH_STRATEGY.md
❌ tests/
❌ .github/
❌ src/*.ts (only compiled dist/index.js)
❌ tsconfig.json
❌ .vscode/
```

If you're unsure: **Check .npmignore** - if it's listed there, it won't be published.

## 🚨 Critical: Commits That Must NEVER Reach main

❌ DO NOT commit to main:
- Experimental code
- Work-in-progress features
- Debug logging (console.log, debugger)
- Commented-out code
- Half-finished implementations
- Development-only files (feat-dev/*, etc.)

## ✅ Development Checklist

Before pushing ANY code:

- [ ] On correct branch? (`git status` shows `develop` or `feature/...`)
- [ ] Not on main? (Double-check with `git branch`)
- [ ] Changes are appropriate for development? (experimental, in-progress, etc.)
- [ ] .npmignore updated if needed? (new dev files excluded)
- [ ] .gitignore updated if needed? (secrets are excluded)
- [ ] No hardcoded credentials? (use environment variables)
- [ ] No console.log/debugger statements? (remove before final commit)
- [ ] Commit message is descriptive? (`feat:`, `fix:`, `docs:`, etc.)
- [ ] PR description explains what/why? (for code review)

## 📊 Branch Status Reference

```
main (3e3f1ba)
├─ Status: ✅ PRODUCTION READY
├─ Version: v1.0.0
├─ Published: Yes (on npm)
├─ Protection: 🔒 HIGH (PRs required, reviews required)
└─ Last commit: "fix: Correct contact information..."

develop (3329b41)
├─ Status: ✅ READY FOR DEVELOPMENT
├─ Version: v1.0.1-dev (unreleased)
├─ Published: No (kept private)
├─ Protection: 🔒 MEDIUM (PRs recommended)
├─ Contains: feat-dev/ (24 docs), TypeScript code
└─ Last commit: "docs: Add branch strategy..."
```

## 🔄 Release Process (For Humans Only)

Only authorized users perform releases:

```bash
# 1. Develop stable feature on develop branch
git checkout develop
git pull origin develop
# ... create feature branch, develop, merge via PR ...

# 2. When ready for release:
git checkout -b release/v1.0.1
npm version minor                              # Updates version
git add package*.json
git commit -m "chore: Bump to v1.0.1"
git push -u origin release/v1.0.1

# 3. Create PR: release/v1.0.1 → main
# 4. After approval, merge
# 5. Create git tag: v1.0.1
# 6. npm publish (or automatic via GitHub Actions)
# 7. Merge back to develop
```

**Agents:** Do not perform releases. Releases are human-only operations.

## 🛡️ Safety Nets

### If You Accidentally Commit to main

```bash
# IMMEDIATELY stop and undo:
git reset HEAD~1                               # Undo last commit (keep changes)
git reset --hard HEAD~1                        # Undo last commit (discard changes)
git push -f origin main                        # Force push back (will be blocked)
# Alert the maintainer - they'll need to fix branch protection
```

### If You Accidentally Push to main

GitHub branch protection will **BLOCK** the push. This is intentional.

```
remote: error: GH006: Protected branch update failed for refs/heads/main.
remote: error: Pushing to a protected branch is not allowed
```

**DO NOT force push.** Tell the maintainer - it's a sign something went wrong.

### If You See Uncommitted Changes

```bash
# Never lose work - stash it:
git stash                                      # Save changes temporarily
git stash list                                 # View stashed changes
git stash pop                                  # Restore changes

# Then commit properly:
git add .
git commit -m "feat: Description"
git push origin your-branch
```

## 📝 Commit Message Convention

Follow this format for clarity:

```
feat: Add new MCP tool for image processing       # New feature
fix: Correct error in spend calculation           # Bug fix
docs: Update README with new API docs             # Documentation
refactor: Simplify axios error handling           # Code improvement
test: Add tests for create_virtual_key            # Tests
chore: Update dependencies                        # Maintenance
```

Good commit messages help reviewers and future maintainers.

## 🔍 Code Review Requirements

Every PR to develop must have:

- [ ] Descriptive title and description
- [ ] Reference to related issues/features
- [ ] No hardcoded secrets (credentials, API keys, etc.)
- [ ] Proper error handling
- [ ] TypeScript strict mode compliance
- [ ] Updates to relevant documentation

## ❓ When in Doubt

**Ask these questions:**

1. **"Is this code production-ready?"**
   - YES → Target: main (via release PR)
   - NO → Target: develop (via feature PR)

2. **"Could this break existing functionality?"**
   - YES → Get code review before merging
   - NO → Still get review (good practice)

3. **"Should users see this?"**
   - YES → It goes on main
   - NO → Keep it on develop

4. **"Is this in .npmignore?"**
   - YES → Safe to put on develop (won't publish)
   - NO → Don't put on develop unless it's production code

## 🚀 You Got This!

Remember:
- ✅ develop = Safe space for experiments
- ✅ main = Sacred (production only)
- ✅ PRs = Safety mechanism (requires review)
- ✅ .npmignore = Protection (prevents leaks)
- ✅ Ask when unsure (better safe than sorry)

---

**Questions?** See DEVELOPMENT.md and BRANCH_STRATEGY.md for more details.

**Last Updated:** November 7, 2025
**Applies To:** develop branch only
**Status:** INTERNAL DOCUMENTATION (not published to npm)
