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
        "DEBUG": "false"
      }
    }
  }
}
```

### 3. Start Container

```bash
docker run -d --name litellm_mcp \
  --network litellm_litellm_network \
  -e LITELLM_API_BASE=http://litellm-llm-1:4000 \
  -e LITELLM_MASTER_KEY=sk-your-key \
  -e DATABASE_URL="postgresql://user:password@host:5432/litellm_db" \
  -e REDIS_HOST=localhost \
  -e REDIS_PORT=6379 \
  -e REDIS_PASSWORD=your-password \
  -e DEBUG=true \
  litellm_mcp:latest sleep infinity
```

### 4. Verify Connection

Check Docker logs:

```bash
docker logs litellm_mcp
```

Look for:

```
[DEBUG] Starting LiteLLM MCP Server
[DEBUG] LiteLLM API Base: http://litellm-llm-1:4000
[DEBUG] Server ready and listening on stdio
```

### 5. Enable in VSCode

1. Reload VSCode settings (Cmd+Shift+P → "Reload Window")
2. Check MCP connection status in VSCode output
3. Available tools should appear in Claude interface

## Production Deployment

### Network Architecture

```
┌─────────────────────────────────┐
│     VSCode with MCP Support     │
└─────────────┬───────────────────┘
              │ (stdio connection)
              ↓
┌─────────────────────────────────┐
│      litellm_mcp Container      │ ← This server
├─────────────────────────────────┤
│  - Python 3.11                  │
│  - MCP Server                   │
│  - HTTP Client                  │
└─────────────┬───────────────────┘
              │ (internal network)
    ┌─────────┴──────────┬─────────┐
    ↓                    ↓         ↓
┌────────────┐ ┌──────────────┐ ┌───────┐
│ LiteLLM    │ │ PostgreSQL   │ │ Redis │
│ Proxy      │ │ Database     │ │ Cache │
└────────────┘ └──────────────┘ └───────┘
```

### Environment Setup

Create `.env` file (never commit):

```bash
LITELLM_API_BASE=http://litellm-llm-1:4000
LITELLM_MASTER_KEY=sk-prod-key-xxxxx
DATABASE_URL=postgresql://prod_user:prod_pass@db.internal:5432/litellm_prod
REDIS_HOST=redis.internal
REDIS_PORT=6379
REDIS_PASSWORD=prod-redis-password-strong-and-unique
DEBUG=false
```

Load environment:

```bash
export $(cat .env | xargs)
```

### Docker Compose (Production)

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  litellm_mcp:
    image: litellm_mcp:latest
    container_name: litellm_mcp
    networks:
      - litellm_network
    environment:
      LITELLM_API_BASE: ${LITELLM_API_BASE}
      LITELLM_MASTER_KEY: ${LITELLM_MASTER_KEY}
      DATABASE_URL: ${DATABASE_URL}
      REDIS_HOST: ${REDIS_HOST}
      REDIS_PORT: ${REDIS_PORT}
      REDIS_PASSWORD: ${REDIS_PASSWORD}
      DEBUG: "false"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "python", "-c", "import sys; sys.exit(0)"]
      interval: 30s
      timeout: 10s
      retries: 3
    depends_on:
      - litellm-llm-1
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

networks:
  litellm_network:
    external: true
```

Start production deployment:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Security Checklist

Before going to production:

- [ ] Environment variables secured (never in code)
- [ ] Database using SSL/TLS connections
- [ ] Redis password protected (32+ chars)
- [ ] Network access restricted to private network
- [ ] API keys rotated (not default/test keys)
- [ ] DEBUG mode disabled
- [ ] Container logs monitored
- [ ] Regular backups enabled
- [ ] Firewall rules configured
- [ ] Rate limiting enabled in LiteLLM
- [ ] `.vscode/mcp.json` added to `.gitignore`
- [ ] No secrets in git history

### Monitoring

Monitor container health:

```bash
# Watch container stats
docker stats litellm_mcp

# Follow logs
docker logs --follow litellm_mcp

# Check uptime
docker ps | grep litellm_mcp
```

Set up alerts for:

- Container restart failures
- High memory usage
- Connection errors to LiteLLM
- Database connectivity issues
- API rate limiting

### Troubleshooting

#### Container won't start

```bash
# Check logs
docker logs litellm_mcp

# Verify image exists
docker images | grep litellm_mcp

# Test MCP server directly
docker exec litellm_mcp python __main__.py
```

#### Can't connect to LiteLLM

```bash
# Check network connectivity
docker exec litellm_mcp ping litellm-llm-1

# Test LiteLLM endpoint
docker exec litellm_mcp curl http://litellm-llm-1:4000/health/liveliness

# Verify API key
docker exec -e LITELLM_MASTER_KEY=sk-your-key litellm_mcp \
  curl -H "Authorization: Bearer sk-your-key" \
  http://litellm-llm-1:4000/models
```

#### Database connection errors

```bash
# Test PostgreSQL connection
docker exec litellm_mcp \
  psql "postgresql://user:pass@host:5432/litellm_db" -c "SELECT 1"

# Check DATABASE_URL format
# postgresql://user:password@host:port/database
```

#### Redis connection issues

```bash
# Test Redis connection
docker exec litellm_mcp \
  redis-cli -h redis-host -a your-password ping

# Should return: PONG
```

## Scaling

For multiple instances:

1. Build and tag image with version:
   ```bash
   docker tag litellm_mcp:latest litellm_mcp:1.0.0
   docker tag litellm_mcp:latest your-registry/litellm_mcp:1.0.0
   ```

2. Push to registry:
   ```bash
   docker push your-registry/litellm_mcp:1.0.0
   ```

3. Deploy multiple containers:
   ```yaml
   services:
     litellm_mcp_1:
       image: your-registry/litellm_mcp:1.0.0
       # ... config ...
     litellm_mcp_2:
       image: your-registry/litellm_mcp:1.0.0
       # ... config ...
   ```

4. Configure load balancing or failover

## Backup & Recovery

### Database Backup

```bash
# Full backup
pg_dump -h localhost -U user litellm_db > backup_$(date +%Y%m%d).sql

# Compressed backup
pg_dump -h localhost -U user -Fc litellm_db > backup_$(date +%Y%m%d).dump

# Restore from backup
pg_restore -h localhost -U user -d litellm_db backup_20251106.dump
```

### Configuration Backup

```bash
# Backup .env and credentials
cp .env .env.backup_$(date +%Y%m%d)
cp .vscode/mcp.json .vscode/mcp.json.backup_$(date +%Y%m%d)

# Store backups securely (encrypted)
```

### Redis Backup

```bash
# Redis creates RDB snapshots automatically
# Backup the dump file
docker exec litellm_redis cp /data/dump.rdb /backup/redis_$(date +%Y%m%d).rdb

# Restore
docker exec litellm_redis cp /backup/redis_backup.rdb /data/dump.rdb
docker restart litellm_redis
```

## Rollback

If deployment fails:

```bash
# Stop current version
docker stop litellm_mcp

# Remove current container
docker rm litellm_mcp

# Start previous version
docker run -d --name litellm_mcp \
  --network litellm_litellm_network \
  -e LITELLM_API_BASE=http://litellm-llm-1:4000 \
  -e LITELLM_MASTER_KEY=sk-your-key \
  ... [previous configuration]
  litellm_mcp:previous-tag sleep infinity

# Verify
docker logs litellm_mcp
```

## Updates

To update the server:

1. **Pull latest code**:
   ```bash
   git fetch origin
   git checkout origin/001-mcp-litellm-server
   ```

2. **Rebuild image**:
   ```bash
   docker build -f mcp_server/Dockerfile -t litellm_mcp:latest .
   ```

3. **Stop and remove old container**:
   ```bash
   docker stop litellm_mcp
   docker rm litellm_mcp
   ```

4. **Start new container**:
   ```bash
   docker run -d --name litellm_mcp \
     [... configuration ...]
     litellm_mcp:latest sleep infinity
   ```

5. **Verify**:
   ```bash
   docker logs litellm_mcp
   ```

## Support

For deployment issues:

- 📖 **Check logs**: `docker logs litellm_mcp`
- 🐛 **Create issue**: [GitHub Issues](https://github.com/ArtemisAI/LiteLLM-MCP-Server/issues)
- 💬 **Discussion**: [GitHub Discussions](https://github.com/ArtemisAI/LiteLLM-MCP-Server/discussions)
- 📧 **Email**: deployment-support@artemisai.com

---

**Last Updated**: November 6, 2025
