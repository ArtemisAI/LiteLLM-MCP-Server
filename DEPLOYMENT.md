# Deployment Guide

## Prerequisites

- Node.js 18+ (for local development) OR Docker & Docker Compose (for containerized deployment)
- Running LiteLLM instance (v1.79.0+)
- VSCode with MCP support

## Local Development (Recommended)

### 1. Install Dependencies

```bash
cd LiteLLM-MCP-Server
npm install
```

### 2. Build TypeScript

```bash
npm run build
```

Verify the build:

```bash
ls -la dist/
# Should show index.js and other compiled files
```

### 3. Configure Environment

Copy the example configuration:

```bash
cp .vscode/mcp.json.example .vscode/mcp.json
```

Edit `.vscode/mcp.json` for local Node.js execution:

```json
{
  "servers": {
    "litellm-manager": {
      "type": "stdio",
      "command": "node",
      "args": ["/absolute/path/to/LiteLLM-MCP-Server/dist/index.js"],
      "env": {
        "LITELLM_API_BASE": "http://localhost:4001",
        "LITELLM_MASTER_KEY": "sk-your-actual-key",
        "DEBUG": "false"
      }
    }
  }
}
```

**Note:** Replace `/absolute/path/to/` with the actual path to your cloned repository.

### 4. Test the Server

You can test the server by running it directly:

```bash
node dist/index.js
```

The server will wait for MCP protocol input on stdin. Press Ctrl+C to stop.

### 5. Enable in VSCode

1. Reload VSCode settings (Cmd+Shift+P → "Reload Window")
2. Check MCP connection status in VSCode output
3. Available tools should appear in Claude interface

## Docker Deployment (Optional)

### 1. Build Docker Image

First, ensure you have built the TypeScript code locally:

```bash
npm run build
```

Then build the Docker image:

```bash
docker build -t litellm_mcp:latest .
```

### 2. Run Container

```bash
docker run -d --name litellm_mcp \
  --network litellm_litellm_network \
  -e LITELLM_API_BASE=http://litellm-llm-1:4000 \
  -e LITELLM_MASTER_KEY=sk-your-key \
  -e DEBUG=false \
  litellm_mcp:latest sleep infinity
```

### 3. Configure VSCode for Docker

Edit `.vscode/mcp.json` for Docker execution:

```json
{
  "servers": {
    "litellm-manager": {
      "type": "stdio",
      "command": "docker",
      "args": ["exec", "-i", "litellm_mcp", "node", "dist/index.js"],
      "env": {
        "LITELLM_API_BASE": "http://litellm-llm-1:4000",
        "LITELLM_MASTER_KEY": "sk-your-actual-key",
        "DEBUG": "false"
      }
    }
  }
}
```

## Troubleshooting

### Server won't start locally

```bash
# Check Node.js version
node --version  # Should be 18+

# Rebuild TypeScript
npm run build

# Check for TypeScript errors
npx tsc --noEmit
```

### Can't connect to LiteLLM

```bash
# Test LiteLLM endpoint
curl http://localhost:4001/health/liveliness

# Verify API key
curl -H "Authorization: Bearer sk-your-key" \
  http://localhost:4001/models
```

### Docker build issues

If npm install hangs in Docker, build locally and use the pre-built dist folder:

```bash
# Build locally first
npm install
npm run build

# Then build Docker image (which copies pre-built dist/)
docker build -t litellm_mcp:latest .
```

## Security Checklist

Before going to production:

- [ ] Environment variables secured (never in code)
- [ ] API keys rotated (not default/test keys)
- [ ] DEBUG mode disabled
- [ ] `.vscode/mcp.json` added to `.gitignore`
- [ ] No secrets in git history
- [ ] Dependencies updated (run `npm audit`)

## Support

For deployment issues:

- 📖 **Check logs**: Node.js console output or `docker logs litellm_mcp`
- 🐛 **Create issue**: [GitHub Issues](https://github.com/ArtemisAI/LiteLLM-MCP-Server/issues)
- 💬 **Discussion**: [GitHub Discussions](https://github.com/ArtemisAI/LiteLLM-MCP-Server/discussions)

---

**Last Updated**: November 6, 2025
