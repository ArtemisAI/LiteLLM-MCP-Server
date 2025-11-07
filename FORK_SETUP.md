# 🍴 Fork Setup Guide - Get Started with Your Development Fork

This guide will walk you through creating and setting up your personal fork of the LiteLLM MCP Server repository.

## Quick Setup (5 minutes)

### 1. Fork on GitHub

1. Go to: https://github.com/ArtemisAI/LiteLLM-MCP-Server
2. Click **"Fork"** button (top-right corner)
3. Choose your personal account as the fork destination
4. Wait for fork to complete

You now have: **YOUR_USERNAME/LiteLLM-MCP-Server** ✅

### 2. Clone Your Fork Locally

```bash
# Replace YOUR_USERNAME with your GitHub username
git clone https://github.com/YOUR_USERNAME/LiteLLM-MCP-Server.git
cd LiteLLM-MCP-Server
```

### 3. Add Upstream Remote

```bash
# This lets you sync with the original repository
git remote add upstream https://github.com/ArtemisAI/LiteLLM-MCP-Server.git

# Verify both remotes are set up correctly
git remote -v
# Output should show:
# origin    https://github.com/YOUR_USERNAME/LiteLLM-MCP-Server.git (fetch)
# origin    https://github.com/YOUR_USERNAME/LiteLLM-MCP-Server.git (push)
# upstream  https://github.com/ArtemisAI/LiteLLM-MCP-Server.git (fetch)
# upstream  https://github.com/ArtemisAI/LiteLLM-MCP-Server.git (push)
```

### 4. Sync Your Fork's Develop Branch

```bash
# Fetch the latest from upstream
git fetch upstream

# Checkout your develop branch
git checkout develop

# Merge upstream/develop into your develop
git merge upstream/develop

# Push to your fork
git push origin develop

# Verify you're on the right branch
git branch -a
# Should show:
# * develop
#   remotes/origin/develop
#   remotes/origin/HEAD -> origin/develop
#   remotes/upstream/develop
```

## ✅ You're Ready!

Your fork is now set up and synced with the original repository.

### Next Steps:

1. **Read the guides:**
   - `FORK_WORKFLOW.md` - Complete workflow guide
   - `AGENTS.md` - Agent development rules
   - `copilot-instructions.md` - Copilot guidelines

2. **Verify feat-dev/ folder:**
   ```bash
   ls feat-dev/
   # Should show all 24 development documents
   ```

3. **Start developing:**
   - See `FORK_WORKFLOW.md` for daily workflow
   - Create your first feature branch
   - Make changes safely in your fork

## 📊 Fork Structure

```
YOUR_FORK/
├── main
│   └─ Synced from upstream/main (v1.0.0)
│
├── develop
│   ├─ Your development work
│   ├─ feat-dev/ (24 development documents)
│   └─ Where you create features
│
└── feature/*
    └─ Your temporary feature branches
```

## 🔄 Daily Workflow Quick Reference

```bash
# Each day, before starting work:
git checkout develop
git fetch upstream
git merge upstream/develop
git push origin develop

# Create a feature:
git checkout -b feature/your-feature-name
# ... make changes ...
git add .
git commit -m "feat: Your feature description"
git push -u origin feature/your-feature-name

# Create PR in YOUR fork:
# On GitHub: feature/your-feature → YOUR_FORK/develop
```

## 🆘 Troubleshooting

### "I'm not sure where to commit"

✅ **Always commit to YOUR fork** (`origin`)
```bash
git push origin feature/your-feature   # ✅ Correct
git push upstream feature/your-feature # ❌ Will fail - you don't have access
```

### "I want to contribute to main repository"

1. Make sure your work is in `YOUR_FORK/develop`
2. Sync with `upstream/develop`
3. Create a PR: `YOUR_FORK/develop` → `ArtemisAI/develop`
4. Wait for the team to review and merge

See `FORK_WORKFLOW.md` for detailed contribution workflow.

### "My fork is out of sync"

```bash
git fetch upstream
git checkout develop
git merge upstream/develop
git push origin develop
```

### "I made a mistake - can I fix it?"

Yes! Your fork is independent. You can:
- Force push to your own fork: `git push -f origin your-branch`
- Delete branches and start over
- Reset commits locally and repush

## 📚 Documentation

- **FORK_WORKFLOW.md** - Complete fork workflow guide
- **AGENTS.md** - AI agent development rules
- **copilot-instructions.md** - GitHub Copilot guidelines
- **DEVELOPMENT.md** - General development guide
- **BRANCH_STRATEGY.md** - Branch management strategy
- **CONTRIBUTING.md** - Contribution guidelines (upstream project)

## 🚀 You Got This!

Remember:
- Your fork is YOUR playground 🛝
- Experiment freely without breaking the main project
- Sync with upstream regularly
- When you're ready, contribute back via PRs
- Ask questions - there's no such thing as a dumb question!

---

**Happy developing!** 🎉

For more information, see `FORK_WORKFLOW.md`
