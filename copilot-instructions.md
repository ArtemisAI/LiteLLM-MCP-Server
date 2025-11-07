# copilot-instructions.md - GitHub Copilot Guidelines

**INTERNAL DOCUMENTATION - NOT FOR NPM**

Specific instructions for GitHub Copilot when working on LiteLLM MCP Server development.

## 🎯 Copilot's Role

GitHub Copilot helps with:
- ✅ Code generation (TypeScript, JavaScript)
- ✅ Bug fixes and refactoring
- ✅ Documentation improvements
- ✅ Test writing
- ✅ Type definitions and interfaces

Copilot does NOT:
- ❌ Make decisions about which branch to use
- ❌ Merge code to production
- ❌ Publish to npm
- ❌ Change version numbers without explicit instruction
- ❌ Commit without user review

## 🔒 Branch Rules for Copilot

### Rule 1: ALWAYS Check Current Branch First

Before ANY code changes:

```typescript
// ✅ DO THIS FIRST
$ git branch

// Example output:
  develop
  feature/streaming-support
  main
* develop                    // ← You should see develop or feature/*

// ❌ NEVER see:
  * main                     // ❌ STOP if you see this!
```

**If on main:** Stop immediately and ask user to `git checkout develop`

### Rule 2: Development Branch is Safe, Main is Sacred

```
develop branch (SAFE ZONE - development work)
├─ Create feature branches here
├─ Commit experimental code
├─ Test new ideas
├─ Update feat-dev/ documentation
└─ All work is isolated from production

main branch (SACRED ZONE - PRODUCTION ONLY)
├─ ❌ Never commit directly
├─ ❌ Never experiment here
├─ ❌ Never push incomplete work
└─ Only receives PRs from develop during releases
```

### Rule 3: Feature Branch Pattern

```bash
# ✅ CORRECT PATTERN
git checkout develop          # Start from develop
git pull origin develop       # Get latest
git checkout -b feature/FEATURE_NAME
# ... make changes ...

# ❌ WRONG PATTERNS
git checkout main             # ❌ Wrong base
git checkout -b feature/FEATURE_NAME

git checkout develop
git checkout -b main          # ❌ Creates branch named "main" - WRONG
```

**Valid feature branch names:**
- `feature/streaming-support`
- `feature/add-rerank-endpoint`
- `bugfix/fix-spend-calculation`
- `docs/update-api-docs`
- `refactor/simplify-axios-errors`

**Invalid names that indicate a problem:**
- `main` (wrong base!)
- `develop` (wrong base!)
- Any branch that IS main or develop

## 📦 The .npmignore Protection

**CRITICAL:** Copilot must understand what .npmignore does:

Files in `.npmignore` are **excluded from npm package**:
- They can be in git version control ✅
- They can be on GitHub ✅
- But npm users will NOT download them ✅

### Files Explicitly Excluded (Safe for develop):

```
# Always safe to modify on develop branch:
feat-dev/001_model_management_endpoints.md
feat-dev/002_chat_completions_endpoints.md
feat-dev/... (all 24 files)
AGENTS.md (this file)
copilot-instructions.md
DEVELOPMENT.md
BRANCH_STRATEGY.md
tests/
.vscode/mcp.json
tsconfig.json
```

These are NOT published to npm, so users won't see them.

### Files That MUST Stay Clean (Production Code):

```
# Must only appear on main, production-ready:
src/index.ts
package.json (version must be accurate)
README.md
SECURITY.md
CONTRIBUTING.md
LICENSE
```

**Rule:** If the file is NOT in .npmignore, it's published to npm. Be careful.

## 💻 Code Generation Rules

### When Generating TypeScript Code

✅ DO:
```typescript
// ✅ Good: Strict types, error handling
async function listModels(): Promise<string[]> {
  try {
    const response = await axios.get(`${apiBase}/models`);
    return response.data.data.map((m: any) => m.id);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error:', error.response?.status);
    }
    throw error;
  }
}
```

❌ DON'T:
```typescript
// ❌ Bad: No types, no error handling, loose
async function listModels() {
  const response = await axios.get(`${apiBase}/models`);
  return response.data.data.map(m => m.id);  // Could crash
}
```

### Error Handling Standards

```typescript
// ✅ REQUIRED ERROR HANDLING PATTERN
try {
  // API call or operation
} catch (error) {
  if (axios.isAxiosError(error)) {
    // Handle API errors specifically
    const status = error.response?.status;
    const message = error.response?.data?.detail || error.message;
    console.error(`API Error [${status}]: ${message}`);
    throw new Error(`Failed to [operation]: ${message}`);
  } else if (error instanceof Error) {
    // Handle standard errors
    console.error(`Unexpected error: ${error.message}`);
    throw error;
  } else {
    // Handle unknown errors
    throw new Error('Unknown error occurred');
  }
}
```

### TypeScript Strict Mode

✅ All code must pass TypeScript strict mode:

```bash
$ npm run build
# Must compile with NO errors
```

If Copilot generates code that doesn't compile:
1. User will see the error
2. Fix and re-commit
3. Repeat until `npm run build` succeeds

## 📝 Documentation Standards

### When Updating Documentation

✅ DO:
- Update README for user-facing features
- Update DEVELOPMENT.md for developer processes
- Update feat-dev/ documents for upcoming features
- Add comments to complex code

❌ DON'T:
- Remove important sections without explanation
- Change contact information without explicit instruction
- Move files to main that should stay on develop
- Expose feat-dev/ information to README

### Documentation Files by Branch

**On main (published to npm):**
- README.md
- SECURITY.md
- CONTRIBUTING.md

**On develop (NOT published):**
- DEVELOPMENT.md
- AGENTS.md (this file)
- copilot-instructions.md
- BRANCH_STRATEGY.md
- feat-dev/ (all 24 files)

## 🔍 Code Review Checklist

Before committing, verify:

- [ ] Code is on develop or feature/* branch (not main)
- [ ] TypeScript compiles: `npm run build`
- [ ] No hardcoded credentials (check for API keys, passwords)
- [ ] No console.log statements (except for debugging)
- [ ] Error handling is comprehensive
- [ ] Changes match the feature description
- [ ] Documentation updated if needed
- [ ] Commit message is descriptive

## 🚨 Red Flags - Stop If You See These

**STOP and ask user if:**

```
git status shows:
  On branch main                    # ❌ STOP - should be develop
  Your branch is ahead of ...       # ❌ STOP - shouldn't have unpushed commits to main
  deleted by us:                    # ❌ STOP - merge conflict
  both added:                        # ❌ STOP - merge conflict

Code contains:
  console.log('DEBUG:')             # ⚠️ WARN - remove unless intentional
  debugger;                         # ⚠️ WARN - remove
  'sk-'                             # ⚠️ CRITICAL - API key hardcoded!
  'password: '                      # ⚠️ CRITICAL - password hardcoded!
  'secret: '                        # ⚠️ CRITICAL - secret hardcoded!

Package.json:
  "version": "1.0.0" → "1.0.1"     # ⚠️ WARN - version bumps only during releases
  New dependency added              # ⚠️ WARN - discuss before adding

.npmignore or .gitignore:
  # Deletion of protections         # ❌ CRITICAL STOP - never remove protections
```

If ANY red flag appears: **STOP and ask the user before proceeding.**

## 🔄 PR Workflow for Copilot

When user says "create a PR":

1. **Verify branch:** `git status` must show develop or feature/*
2. **Commit changes:** `git add .` then `git commit -m "..."`
3. **Push branch:** `git push -u origin feature-name`
4. **Suggest PR details:** Create on GitHub UI
   - Title: Clear, descriptive
   - Description: What, why, how
   - Target: `develop` branch (NOT main!)

✅ CORRECT:
```
PR Title: "feat: Add streaming support for chat completions"
Description: 
- Adds WebSocket streaming for real-time responses
- Updates create_virtual_key to handle streaming
- Adds tests in feat-dev/tests/streaming.test.ts
Base: develop
Head: feature/streaming-support
```

❌ WRONG:
```
PR Title: "Update stuff"
Description: "Made changes"
Base: main               # ❌ WRONG - should be develop
```

## 📊 Repository Structure Reminder

```
.
├── src/
│   └── index.ts              # Main MCP server (PRODUCTION CODE)
├── dist/                     # Compiled JavaScript (generated)
├── feat-dev/                 # Planning docs (NOT published)
│   ├── 001_*.md
│   ├── 002_*.md
│   └── ... (24 files)
├── DEVELOPMENT.md            # Developer guide (NOT published)
├── AGENTS.md                 # This file (NOT published)
├── copilot-instructions.md   # This file (NOT published)
├── BRANCH_STRATEGY.md        # Branching info (NOT published)
├── README.md                 # User guide (PUBLISHED)
├── SECURITY.md               # Security policy (PUBLISHED)
├── CONTRIBUTING.md           # Contributor guide (PUBLISHED)
├── .npmignore                # Exclusion list (NOT published)
├── .gitignore                # Git exclusion list
├── package.json              # Dependencies (PUBLISHED)
├── tsconfig.json             # TS config (NOT published)
└── LICENSE                   # MIT License (PUBLISHED)
```

Files without "NOT published" note = **go to npm users**

## 🎓 Learning Resources

For Copilot understanding context better:

- **Branch Strategy:** BRANCH_STRATEGY.md
- **Development Guide:** DEVELOPMENT.md  
- **Contribution Rules:** CONTRIBUTING.md
- **Security:** SECURITY.md
- **Agent Rules:** AGENTS.md (this file!)

## 📞 When Copilot Gets Stuck

**If unsure, ask the user:**

- "Which branch should this go on?"
- "Is this code production-ready?"
- "Should this be published to npm?"
- "Should I update package.json version?"
- "Do I need to update documentation?"

**Better to ask than to make a mistake!**

## ✅ Final Checklist - Before Every Commit

```
EVERY SINGLE TIME before git commit:

☐ What branch am I on?                    (git branch)
☐ Is it develop or feature/*?             (NOT main!)
☐ Is my code complete?                    (Not work-in-progress)
☐ Does it compile?                        (npm run build)
☐ Any hardcoded secrets?                  (Check for credentials)
☐ Should this be published?               (Check .npmignore)
☐ Is my commit message descriptive?       (feat:, fix:, docs:, etc.)
☐ Should I create a PR?                   (User decision)

If ANY answer is wrong or unclear → ASK USER FIRST
```

---

**Remember:** Protect production. Keep develop safe. Ask when unsure.

**Last Updated:** November 7, 2025
**Status:** INTERNAL (not published to npm)
**Scope:** GitHub Copilot usage on develop branch
