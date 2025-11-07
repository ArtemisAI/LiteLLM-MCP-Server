# AGENTS.md - Development Instructions for Coding Agents

**CRITICAL: This document is ONLY for the develop branch. It is NOT published to npm.**

This document provides strict guidelines for AI agents (Copilot, Claude, etc.) working on the LiteLLM MCP Server development.

## 🎯 Core Principles - FORK-BASED WORKFLOW

1. **Fork-Based Development:**
   - `YOUR_FORK/main` = Your copy of production (synced from upstream)
   - `YOUR_FORK/develop` = Your development work
   - `upstream/main` = Original production (ArtemisAI - read-only)
   - `upstream/develop` = Original development (ArtemisAI - read-only)

2. **Safety Rules for Forks:**
   - ✅ Push to YOUR fork freely: `git push origin ...`
   - ✅ Create PRs in your fork: `feature/* → YOUR_FORK/develop`
   - ✅ Contribute via PR: YOUR_FORK/develop → upstream/develop
   - ❌ NEVER push to upstream (you don't have access)
   - ❌ NEVER commit secrets to fork (it may become public)
   - ❌ ALWAYS sync upstream before major work

3. **Protect Production:**
   - upstream/main is SACRED (production code only)
   - Your fork can be messy - it's learning space!
   - Only contribute polished code via PRs to upstream

## 📋 Mandatory Workflow - FORK-BASED

### Before Starting ANY Work

```bash
# 1. Check your remotes (should show origin=YOUR_FORK, upstream=ArtemisAI)
git remote -v

# 2. Verify you're on develop
git branch -a
# Must see: * develop (YOUR_FORK develop)

# 3. Sync with upstream before major work
git fetch upstream
git merge upstream/develop

# 4. Push updated develop to your fork
git push origin develop

# 5. Verify feat-dev/ folder exists
ls feat-dev/  # Should list 24 development files
```

### Creating a Feature (In Your Fork)

```bash
# ✅ CORRECT WAY
git checkout develop                          # Start from YOUR develop
git pull origin develop                       # Get latest from your fork
git checkout -b feature/your-feature          # Create feature branch
# ... make changes ...
git add .
git commit -m "feat: Description"
git push -u origin feature/your-feature       # Push to YOUR fork

# Then create PR on GitHub:
# FROM: YOUR_FORK/feature/your-feature
# TO: YOUR_FORK/develop
# (NOT to ArtemisAI yet!)

# ❌ WRONG WAYS (DO NOT DO)
git checkout upstream/main                    # ❌ Wrong base
git checkout upstream/develop                 # ❌ Can't push here

git push upstream feature/your-feature        # ❌ Access denied
# You don't have push access to upstream!
```

### Merging Within Your Fork

```bash
# ✅ CORRECT (in your fork)
1. Create PR: YOUR_FORK/feature/* → YOUR_FORK/develop
2. Review and merge on GitHub UI
3. Delete feature branch
4. Pull updated develop locally:
   git checkout develop
   git pull origin develop
5. Continue development

# ❌ WRONG
git push upstream develop                     # ❌ Access denied
```

### When Ready to Contribute to ArtemisAI

```bash
# 1. Make sure your develop is synced with upstream
git fetch upstream
git merge upstream/develop
git push origin develop

# 2. Create PR on GitHub:
# FROM: YOUR_FORK/develop
# TO: ArtemisAI/LiteLLM-MCP-Server/develop
# (This is a cross-fork PR!)

# 3. Wait for ArtemisAI team to review
# 4. Address feedback if needed
# 5. Team merges when approved

# 6. Sync your fork after merge
git fetch upstream
git merge upstream/develop
git push origin develop
```

## 🔒 The Forbidden Zone (DO NOT TOUCH)

### Never Push To Upstream (You Don't Have Access)

```bash
# These commands will FAIL - you don't have push access:
git push upstream feature/your-feature        # ❌ Permission denied
git push upstream main                        # ❌ Permission denied
git push upstream develop                     # ❌ Permission denied

# ✅ ALWAYS push to origin (your fork):
git push origin feature/your-feature          # ✅ Success - to your fork
git push origin develop                       # ✅ Success - to your fork

# ✅ Contribute via PR only:
# Go to GitHub and create a PR:
# FROM: YOUR_FORK/develop (or YOUR_FORK/feature/*)
# TO: ArtemisAI/develop
# This is the ONLY way to contribute code to upstream
```

### Never Commit These to Your Fork

```
NEVER commit to your fork:
├── Hardcoded API keys
├── Passwords or credentials
├── Personal information
├── Database backups
├── Large binary files
└── Any secrets (use .env files instead)
```

Even though your fork is "yours", if you ever make it public or give access to others, secrets are exposed!

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

## 📊 Repository Structure Reference

```
UPSTREAM (ArtemisAI/LiteLLM-MCP-Server) ← Read-only for you
├── main (v1.0.0) - PRODUCTION
├── develop - Team development
└── feature/* - Team features

YOUR FORK (YOUR_USERNAME/LiteLLM-MCP-Server) ← You have full access
├── main - Synced from upstream/main
├── develop - Your development work
└── feature/* - Your feature branches

REMOTES in your local repo:
├── origin → YOUR_FORK (where you push)
└── upstream → ArtemisAI (where you pull/PR to)
```

## 🔄 Release Process (For ArtemisAI Team Only)

Only authorized ArtemisAI maintainers perform releases to npm:

```bash
# This happens in the UPSTREAM repo, not your fork

# 1. Merge develop → main PR is approved
# 2. Tag created: v1.0.1
# 3. npm publish runs (automated or manual)

# YOUR ROLE:
# ✅ Create high-quality PRs to upstream/develop
# ✅ Address review feedback
# ✅ Help test before merge
# ✅ Wait for team to manage releases

# YOUR LIMITS:
# ❌ Don't create PRs to main (only ArtemisAI team does)
# ❌ Don't bump versions in your fork
# ❌ Don't publish to npm (no access)
# ❌ Don't manage releases

**Agents:** Do not perform releases. Releases are human-only, ArtemisAI-team-only operations.

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
