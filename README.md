# LiteLLM MCP Server

A powerful Model Context Protocol (MCP) server that enables seamless integration between Claude AI and LiteLLM proxy instances. Manage models, API keys, and monitoring directly through Claude's interface.

## 🚀 Features

- **Model Management**: List and inspect all available models in your LiteLLM instance
- **API Key Generation**: Create virtual API keys with custom aliases for rate limiting and monitoring
- **User Management**: Organize and manage users and their associated API keys
- **Spend Tracking**: Monitor API usage and costs per user
- **Docker Native**: Runs as a containerized service with secure stdio communication
- **Seamless Integration**: Works directly with VSCode and Claude through MCP protocol

## 📋 Prerequisites

- Docker & Docker Compose
- Running LiteLLM proxy instance (v1.79.0+)
- PostgreSQL database (for LiteLLM)
- Redis instance (for caching/rate limiting)
- VSCode with MCP extension support

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/ArtemisAI/LiteLLM-MCP-Server.git
cd LiteLLM-MCP-Server
```

### 2. Configure Environment

Copy the example configuration and update with your credentials:

```bash
cp .vscode/mcp.json.example .vscode/mcp.json
```

Edit `.vscode/mcp.json` with your LiteLLM proxy details:

```json
{
  "servers": {
    "litellm-manager": {
      "type": "stdio",
      "command": "docker",
      "args": ["exec", "-i", "litellm_mcp", "python", "__main__.py"],
      "env": {
        "LITELLM_API_BASE": "http://localhost:4001",
        "LITELLM_MASTER_KEY": "sk-your-api-key",
        "DATABASE_URL": "postgresql://user:password@localhost:5432/litellm_db",
        "REDIS_HOST": "localhost",
        "REDIS_PORT": "6379",
        "REDIS_PASSWORD": "your-redis-password",
        "DEBUG": "false"
      }
    }
  }
}
```

### 3. Build Docker Image

```bash
docker build -f mcp_server/Dockerfile -t litellm_mcp:latest .
```

### 4. Run Container

```bash
docker run -d --name litellm_mcp \
  --network litellm_litellm_network \
  -e LITELLM_API_BASE=http://litellm-llm-1:4000 \
  -e LITELLM_MASTER_KEY=sk-your-key \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e REDIS_HOST=localhost \
  -e REDIS_PORT=6379 \
  -e REDIS_PASSWORD=your-password \
  litellm_mcp:latest sleep infinity
```

### 5. Enable in VSCode

The MCP server will automatically connect when configured in `.vscode/mcp.json`. VSCode will discover and register the following tools available in Claude:

## 🛠️ Available Tools

### list_models

List all available models in your LiteLLM instance.

**Usage in Claude:**
```
"List the models available in LiteLLM"
```

**Returns:** Array of model IDs with metadata

---

### get_model_info

Retrieve detailed information about a specific model.

**Parameters:**
- `model` (string): Model name/ID

**Usage in Claude:**
```
"Tell me about the Gem-2.5-flash model"
```

**Returns:** Model metadata including owner and creation info

---

### create_virtual_key

Generate a new virtual API key for rate limiting and user management.

**Parameters:**
- `key_alias` (string): Friendly name for the key
- `user_id` (string): User identifier to associate

**Usage in Claude:**
```
"Create an API key called 'production-app' for user 'app-001'"
```

**Returns:** New API key with full configuration

---

### get_spend

Monitor API usage and costs for a specific user.

**Parameters:**
- `user_id` (string): User to check spend for

**Usage in Claude:**
```
"Show me the spend for user 'app-001'"
```

**Returns:** Usage statistics and cost breakdown

---

## 📁 Project Structure

```
LiteLLM-MCP-Server/
├── mcp_server/
│   ├── __init__.py              # Package initialization
│   ├── __main__.py              # MCP server implementation
│   ├── requirements.txt         # Python dependencies
│   ├── Dockerfile               # Container build config
│   └── schema/                  # API schemas
├── .vscode/
│   ├── mcp.json.example         # Configuration template
│   └── mcp.json                 # User config (gitignored)
├── .github/
│   └── FUNDING.yml              # GitHub sponsorship config
├── README.md                    # This file
├── CONTRIBUTING.md              # Contribution guidelines
├── SECURITY.md                  # Security policy
├── DEPLOYMENT.md                # Deployment guide
├── LICENSE                      # MIT License
├── .gitignore                   # Git ignore rules
└── pyproject.toml               # Package metadata
```

## 🔐 Security

This project handles sensitive information including API keys and database credentials. Security is paramount.

### Key Guidelines

1. **Never commit secrets** - Use `.vscode/mcp.json.example` as a template
2. **Use environment variables** - All sensitive data via env vars only
3. **Rotate credentials regularly** - Update keys and passwords periodically
4. **Restrict network access** - Run on secured networks only
5. **Disable DEBUG mode** - Set `DEBUG=false` in production

### Reporting Security Issues

If you discover a security vulnerability, **do not open a public issue**. Instead, email: **security@artemisai.com**

See [SECURITY.md](SECURITY.md) for detailed security policies and procedures.

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Code style and standards
- Testing requirements
- Pull request process
- Issue reporting

### Quick Start for Contributors

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/LiteLLM-MCP-Server.git
cd LiteLLM-MCP-Server

# Create feature branch
git checkout -b feature/your-feature

# Make changes and test
# ... your code ...

# Submit pull request
```

## 💰 Support the Project

If you find this project useful, consider supporting it:

- ⭐ **Star on GitHub** - Help others discover the project
- 💬 **Contribute** - Submit issues and pull requests
- 🤝 **Sponsor** - Support ongoing development
  - [GitHub Sponsors](https://github.com/sponsors/ArtemisAI)
  - [Ko-fi](https://ko-fi.com/artemisai)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### MIT License Summary

✅ Commercial use  
✅ Modification  
✅ Distribution  
✅ Private use  
⚠️ Liability  
⚠️ Warranty  

## 🔗 Related Projects

- [LiteLLM](https://github.com/BerriAI/litellm) - Proxy server for LLM APIs
- [Model Context Protocol](https://modelcontextprotocol.io/) - Open standards for AI communication
- [Claude](https://claude.ai) - AI assistant by Anthropic

## 📚 Documentation

- **[Setup Guide](DEPLOYMENT.md)** - Full deployment instructions
- **[Security Policy](SECURITY.md)** - Security guidelines and vulnerability reporting
- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute to the project

## 📞 Support

- 📖 **Documentation**: [DEPLOYMENT.md](DEPLOYMENT.md)
- 🐛 **Issues**: [GitHub Issues](https://github.com/ArtemisAI/LiteLLM-MCP-Server/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/ArtemisAI/LiteLLM-MCP-Server/discussions)
- 📧 **Email**: support@artemisai.com

## 🙏 Acknowledgments

- [LiteLLM](https://github.com/BerriAI/litellm) - Excellent proxy server for LLM APIs
- [Anthropic](https://anthropic.com) - Claude AI and MCP protocol
- [OpenAI](https://openai.com) - ChatGPT and foundation models

---

**Made with ❤️ by [ArtemisAI](https://github.com/ArtemisAI)**

*Last Updated: November 6, 2025*
