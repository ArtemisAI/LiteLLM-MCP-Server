# FORK-BASED DEVELOPMENT WORKFLOW

**Personal Development Strategy**

This document describes the fork-based workflow for learning and developing safely before contributing to the main repository.

## 🎯 The Fork Strategy

Instead of working directly on the ArtemisAI repository, you'll:

1. **Fork** the repo to your personal GitHub account
2. **Develop** freely in your fork (no risk to production)
3. **Learn** the workflow at your own pace
4. **Contribute** back to main via Pull Requests when ready

```
┌─────────────────────────────────────────────────────────────────┐
│  UPSTREAM (Original Repository)                                 │
│  ArtemisAI/LiteLLM-MCP-Server                                   │
│                                                                 │
│  main (v1.0.0) ← Production                                     │
│  develop ← Team development (don't touch yet)                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                        ↑ (Pull Requests when ready)
                        │
┌─────────────────────────────────────────────────────────────────┐
│  YOUR FORK (Learning & Development)                             │
│  YOUR_USERNAME/LiteLLM-MCP-Server                               │
│                                                                 │
│  main ← Synced from upstream main                               │
│  develop ← Your development work                                │
│  feature/* ← Your feature branches                              │
│                                                                 │
│  Safe to experiment! Fork is YOUR playground.                  │
└─────────────────────────────────────────────────────────────────┘
```

## ✅ Setup Steps

### Step 1: Fork on GitHub

1. Go to https://github.com/ArtemisAI/LiteLLM-MCP-Server
2. Click "Fork" button (top-right)
3. Choose to fork to your personal account
4. Wait for fork to complete
5. You now have: `YOUR_USERNAME/LiteLLM-MCP-Server`

### Step 2: Clone Your Fork (Not the Original)

```bash
# ❌ DON'T do this (clones original):
git clone https://github.com/ArtemisAI/LiteLLM-MCP-Server.git

# ✅ DO this (clones your fork):
git clone https://github.com/YOUR_USERNAME/LiteLLM-MCP-Server.git
cd LiteLLM-MCP-Server
```

### Step 3: Add Upstream Remote

```bash
# Add the original repo as "upstream" for syncing
git remote add upstream https://github.com/ArtemisAI/LiteLLM-MCP-Server.git

# Verify remotes
git remote -v
# Output should show:
# origin    https://github.com/YOUR_USERNAME/LiteLLM-MCP-Server.git (fetch/push)
# upstream  https://github.com/ArtemisAI/LiteLLM-MCP-Server.git (fetch)
```

### Step 4: Sync Your Fork With Upstream

```bash
# Fetch latest from upstream
git fetch upstream

# Checkout your main and sync
git checkout main
git merge upstream/main

# Push synced main back to your fork
git push origin main
```

## 🔄 Daily Workflow

### Before Starting Work

```bash
# 1. Make sure you're on develop
git checkout develop

# 2. Sync with upstream/develop
git fetch upstream
git merge upstream/develop

# 3. Push to your fork's develop
git push origin develop
```

### Creating a Feature

```bash
# 1. Create feature branch from develop
git checkout develop
git checkout -b feature/your-feature-name

# 2. Make changes
# ... edit files ...

# 3. Commit
git add .
git commit -m "feat: Description of your work"

# 4. Push to YOUR fork (origin)
git push -u origin feature/your-feature-name

# 5. Create Pull Request on GitHub
#    - PR from: YOUR_FORK/feature/... 
#    - TO: YOUR_FORK/develop
#    - (NOT to ArtemisAI/develop yet - that comes later!)
```

### Merge to Your Develop

```bash
# After PR approved in YOUR fork:
# 1. Merge on GitHub UI (or locally)
git checkout develop
git merge feature/your-feature-name
git push origin develop

# 2. Delete feature branch
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name
```

## 🚀 When Ready to Contribute to Main

Once your feature is complete and tested in your fork:

### Step 1: Sync Your Develop With Upstream/Develop

```bash
git checkout develop
git fetch upstream
git merge upstream/develop
git push origin develop
```

### Step 2: Create PR From Your Fork to ArtemisAI

1. Go to your fork: `YOUR_USERNAME/LiteLLM-MCP-Server`
2. Click "Contribute" → "Open Pull Request"
3. Set PR as:
   - **Base:** ArtemisAI/LiteLLM-MCP-Server `develop` (NOT main!)
   - **Head:** YOUR_USERNAME/LiteLLM-MCP-Server `develop`
4. Write clear PR description:
   - What: What feature are you adding?
   - Why: Why is this important?
   - How: How does it work?
5. Submit PR
6. Address any review feedback

### Step 3: After Merge

Once the ArtemisAI team merges your PR:

```bash
# 1. Sync your fork with upstream
git checkout develop
git fetch upstream
git merge upstream/develop
git push origin develop

# 2. Continue development
# Your next features start fresh from the updated develop
```

## 📊 Branches You Control

In your fork:

```
YOUR_FORK/LiteLLM-MCP-Server/

main
├─ Status: Synced from upstream/main
├─ Purpose: Stable production code
├─ Your PRs: Never commit directly, only pull from upstream
└─ Keep clean: git merge upstream/main regularly

develop
├─ Status: Your working branch
├─ Purpose: Integration point for your features
├─ Your PRs: Create when your feature is ready
└─ Push to: origin develop

feature/*
├─ Status: Your temporary branches
├─ Purpose: Develop individual features
├─ Your PRs: Create within your fork (feature → develop)
└─ Delete after: Merge to develop
```

## 🛡️ Safety Rules

### DO

✅ Push to your fork freely: `git push origin ...`
✅ Create PRs in your fork: `feature/* → develop`
✅ Experiment in your fork: Try new ideas safely
✅ Sync upstream regularly: `git fetch upstream`
✅ Keep main clean: Only pull from upstream/main

### DON'T

❌ Push directly to ArtemisAI repo (you don't have access anyway)
❌ Force push to upstream
❌ Commit secrets to your fork (it could become public later)
❌ Leave feature branches around (delete after merge)
❌ Forget to sync upstream before working

## 📝 Commit Message Standards

When committing to your fork:

```
feat: Add new feature with description             # New feature
fix: Fix bug in existing code                      # Bug fix
docs: Update documentation                        # Documentation
refactor: Improve code structure                  # Code quality
test: Add tests for feature                       # Tests
chore: Update dependencies                        # Maintenance
```

**Example commit:**
```
feat: Add streaming support for chat completions

- Implements WebSocket streaming for real-time responses
- Updates MCP tools to support streaming flag
- Adds comprehensive error handling for connection drops
- Updates documentation with streaming examples

Related to feat-dev/002_chat_completions_endpoints.md
```

## 🔄 Syncing Your Fork Regularly

```bash
# Daily sync to stay in sync with upstream

# Fetch all upstream branches
git fetch upstream

# Sync main
git checkout main
git merge upstream/main
git push origin main

# Sync develop
git checkout develop
git merge upstream/develop
git push origin develop
```

## 🎓 Learning Path

**Week 1-2: Basic Workflow**
- [ ] Create fork
- [ ] Create feature branch
- [ ] Make changes
- [ ] Create PR in your fork (feature → develop)
- [ ] Merge within your fork

**Week 3-4: Small Contributions**
- [ ] Sync with upstream/develop
- [ ] Create small PR to ArtemisAI (docs fix, bug fix)
- [ ] Get feedback and improve
- [ ] Learn code review process

**Month 2+: Confident Development**
- [ ] Work on features from feat-dev/ roadmap
- [ ] Create comprehensive PRs
- [ ] Take on more complex tasks
- [ ] Help review others' PRs

## 📚 References

- **GitHub Forking Guide:** https://guides.github.com/activities/forking/
- **Pull Request Help:** https://docs.github.com/en/pull-requests
- **Git Documentation:** https://git-scm.com/doc
- **Branch Strategy:** See BRANCH_STRATEGY.md in upstream

## 🆘 Common Questions

**Q: Can I lose my work?**
A: No! Your fork is independent. You can always push to `origin`. Worst case, your local commits are backed up on GitHub.

**Q: When should I fork vs branch?**
A: Fork when you want complete independence (like you're doing now for learning). Branch when you're on the team and have direct repo access.

**Q: How do I stay in sync with upstream?**
A: `git fetch upstream` and `git merge upstream/branch` regularly. Ideally before starting new work.

**Q: Can I contribute from a fork forever?**
A: Yes! Many developers do. Or when comfortable, you can get direct repository access and work on the main repo.

**Q: What if I mess up the fork?**
A: You can always delete the fork and create a new one. Your work on the upstream repo is safe in your merged PRs.

---

**Remember:**
- Fork = Your safe playground 🛝
- Upstream = The main project 🏗️
- PRs = How you contribute your work 📝

Happy developing! 🚀

---

**Created:** November 7, 2025
**Strategy:** Fork-based development workflow for learning
**Status:** Your preferred approach going forward
