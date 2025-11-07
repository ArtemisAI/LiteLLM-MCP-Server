# Security Policy

## 🔐 Security Commitment

The `litellm-mcp` project takes security seriously. This document outlines our security practices and procedures for reporting vulnerabilities.

## 📋 Table of Contents

- [Secure Installation](#secure-installation)
- [Environment Variables](#environment-variables)
- [API Key Management](#api-key-management)
- [Network Security](#network-security)
- [Best Practices](#best-practices)
- [Vulnerability Reporting](#vulnerability-reporting)

---

## 🛡️ Secure Installation

### From npm Registry

```bash
# Verify package authenticity
npm view litellm-mcp version

# Install globally
npm install -g litellm-mcp

# Verify installation
litellm-mcp --version
```

**Note:** Always install from the official npm registry. Verify the package owner is `artemisai`.

### From Source

```bash
# Clone from official repository only
git clone https://github.com/ArtemisAI/LiteLLM-MCP-Server.git
cd LiteLLM-MCP-Server

# Verify integrity
git verify-commit HEAD

# Install dependencies
npm install

# Audit dependencies for vulnerabilities
npm audit

# Build
npm run build
```

---

## 🔑 Environment Variables

**NEVER hardcode secrets in your code or configuration files.**

### Secure Configuration Template

Create a `.env` file (add to `.gitignore`):

```bash
# .env - DO NOT COMMIT THIS FILE
LITELLM_API_BASE=http://localhost:4001
LITELLM_MASTER_KEY=sk-your-actual-api-key-here
DEBUG=false
```

### Load Environment Variables

```bash
# Using direnv (recommended)
direnv allow

# Using dotenv-cli
npx dotenv -- litellm-mcp

# Manually
export LITELLM_API_BASE=http://localhost:4001
export LITELLM_MASTER_KEY=sk-your-key
litellm-mcp
```

### VSCode MCP Configuration

Ensure `.vscode/mcp.json` is in `.gitignore`:

```json
{
  "servers": {
    "mcp-litellm": {
      "type": "stdio",
      "command": "litellm-mcp",
      "args": [],
      "env": {
        "LITELLM_API_BASE": "http://localhost:4001",
        "LITELLM_MASTER_KEY": "${env:LITELLM_MASTER_KEY}",
        "DEBUG": false
      }
    }
  }
}
```

---

## 🔑 API Key Management

### Key Rotation

1. **Generate new key in LiteLLM**
2. **Update environment variables**
3. **Test with new key**
4. **Invalidate old key in LiteLLM**
5. **Verify no services still use old key**

### Virtual Keys for Applications

Use `create_virtual_key` to generate application-specific keys:

```
"Create a virtual key for the production app"
```

**Benefits:**
- ✅ Granular access control
- ✅ Easy revocation per application
- ✅ Audit trail per key
- ✅ Rate limiting per key

### Key Storage

**Recommended locations:**
- ✅ Environment variables
- ✅ Secrets management (HashiCorp Vault, AWS Secrets Manager)
- ✅ CI/CD pipeline secrets
- ✅ Encrypted configuration files

**Never store in:**
- ❌ Git repositories
- ❌ Configuration files
- ❌ Application logs
- ❌ Comments
- ❌ Version control history

---

## 🌐 Network Security

### Local Development

```bash
# Use localhost (default)
LITELLM_API_BASE=http://localhost:4001
```

### Production Deployment

```bash
# Use HTTPS only
LITELLM_API_BASE=https://llm.example.com

# Enable authentication
# Use VPN or private network
# Implement firewall rules
```

### Docker Deployment

```bash
# Use named networks (not exposed to host)
docker network create llm-net

# Run LiteLLM
docker run -d --name litellm --network llm-net \
  -p 127.0.0.1:4001:4000 \
  litellm

# Run MCP Server
docker run -d --name mcp-litellm --network llm-net \
  -e LITELLM_API_BASE=http://litellm:4000 \
  litellm-mcp
```

### Network Access Control

```bash
# Restrict to local network only
LITELLM_API_BASE=http://192.168.1.100:4001

# Use VPN for remote access
# ssh -L 4001:llm.internal:4001 vpn-gateway
LITELLM_API_BASE=http://localhost:4001
```

---

## ✅ Best Practices

### 1. Keep Software Updated

```bash
# Check for updates
npm outdated

# Update packages
npm update

# Audit for vulnerabilities
npm audit
npm audit fix
```

### 2. Disable Debug Mode in Production

```bash
# Development
DEBUG=true

# Production
DEBUG=false
```

### 3. Monitor Access Logs

Track API key usage:
```bash
# Enable LiteLLM logging
# Enable MCP server logging
# Review access patterns regularly
```

### 4. Firewall Configuration

```bash
# Allow only necessary ports
ufw allow 4001/tcp  # LiteLLM
# Restrict source IPs
ufw allow from 192.168.1.0/24 to any port 4001
```

### 5. SSL/TLS Certificates

For production deployments:
- Use valid SSL/TLS certificates
- Implement certificate rotation
- Use HTTPS only
- Enable HSTS headers

### 6. Principle of Least Privilege

- Create application-specific API keys
- Limit key permissions to necessary scopes
- Rotate keys regularly
- Audit key usage

### 7. Input Validation

The MCP server validates all inputs:
- ✅ Model names validated
- ✅ User IDs validated
- ✅ Key aliases validated
- ✅ Environment variables validated

### 8. Rate Limiting

Configure rate limits in LiteLLM:
- Per-user limits
- Per-key limits
- Per-IP limits
- Total system limits

---

## 🚨 Vulnerability Reporting

### Report Privately

If you discover a security vulnerability, **do not create a public GitHub issue**.

Instead, email: **daniel@artemis-ai.ca**

Please include:
- **Description**: What is the vulnerability?
- **Steps to Reproduce**: How can it be triggered?
- **Impact**: What are the consequences?
- **Suggested Fix**: Do you have a proposed solution?
- **Timeline**: When should this be fixed?

### Disclosure Timeline

1. **Immediate**: Report to security@artemisai.com
2. **48 hours**: Initial acknowledgment
3. **7 days**: Assessment and fix timeline
4. **30 days**: Security patch release (if applicable)
5. **30+ days**: Public disclosure (with your permission)

---

## 🔄 Security Updates

### Staying Informed

- ⭐ Watch the [GitHub repository](https://github.com/ArtemisAI/LiteLLM-MCP-Server)
- 📧 Subscribe to security notifications
- 📰 Follow [ArtemisAI](https://github.com/ArtemisAI) on GitHub

### Update Procedure

```bash
# Check current version
npm list -g litellm-mcp

# Update to latest
npm update -g litellm-mcp

# Verify update
litellm-mcp --version
```

---

## 📊 Security Checklist

Before deploying to production:

- [ ] API keys stored in environment variables (not code)
- [ ] DEBUG mode disabled
- [ ] HTTPS/TLS enabled
- [ ] Firewall rules configured
- [ ] Network access restricted
- [ ] Secrets managed securely
- [ ] Dependencies audited and updated
- [ ] SSL certificates valid
- [ ] Rate limiting configured
- [ ] Access logs monitored
- [ ] Backup and recovery plan in place
- [ ] Incident response plan prepared

---

## 📚 Additional Resources

- [OWASP Security Best Practices](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [npm Security Advisories](https://www.npmjs.com/advisories)
- [LiteLLM Documentation](https://docs.litellm.ai/)

---

## 📞 Contact

- **Security Issues**: daniel@artemis-ai.ca
- **GitHub Issues**: [GitHub Issues](https://github.com/ArtemisAI/LiteLLM-MCP-Server/issues)
- **Website**: www.artemis-ai.ca

---

**Last Updated:** November 7, 2025  
**Version:** 1.0.0  
**Maintainer:** [ArtemisAI](https://github.com/ArtemisAI)
