# MCP Server Testing Configuration Guide

## Overview

The `mcp.json` file has been configured to connect the LiteLLM MCP Server to your running LiteLLM instance for testing purposes.

## Configuration Details

### Server Connection

```json
{
  "servers": {
    "litellm-manager": {
      "type": "stdio",
      "command": "docker",
      "args": [
        "exec",
        "-i",
        "litellm_mcp",
        "python",
        "-m",
        "mcp_server"
      ]
    }
  }
}
```

**Key Components:**
- **type**: `stdio` - Uses standard input/output for communication with the MCP server
- **command**: `docker` - Runs the server inside a Docker container
- **container**: `litellm_mcp` - The running MCP server container

### Environment Variables

The configuration passes the following environment variables to the MCP server:

```json
{
  "env": {
    "LITELLM_API_BASE": "http://localhost:4001",
    "LITELLM_MASTER_KEY": "sk-peaceispossible-0812=",
    "DATABASE_URL": "postgresql://user:password@localhost:5432/litellm_db",
    "REDIS_HOST": "localhost",
    "REDIS_PORT": "6379",
    "REDIS_PASSWORD": "redis_password_litellm",
    "DEBUG": "true"
  }
}
```

**Configuration Details:**

| Variable | Value | Purpose |
|----------|-------|---------|
| `LITELLM_API_BASE` | `http://localhost:4001` | LiteLLM Proxy API endpoint (localhost with Docker port mapping) |
| `LITELLM_MASTER_KEY` | `sk-peaceispossible-0812=` | Master authentication key from `.env` |
| `DATABASE_URL` | `postgresql://user:password@localhost:5432/litellm_db` | PostgreSQL database connection (localhost from host machine) |
| `REDIS_HOST` | `localhost` | Redis host (accessible from host machine) |
| `REDIS_PORT` | `6379` | Redis port |
| `REDIS_PASSWORD` | `redis_password_litellm` | Redis authentication password |
| `DEBUG` | `true` | Enable verbose logging for debugging |

## LiteLLM Instance Details

Your LiteLLM Docker Compose setup includes:

### Services
- **llm**: LiteLLM Proxy (Port 4000 internally, 4001 on localhost)
- **litellm_db**: PostgreSQL database (Port 5432)
- **litellm_redis**: Redis cache (Port 6379)
- **cloudflared**: Cloudflare tunnel for external access

### Database Credentials
- **User**: `user`
- **Password**: `password`
- **Database**: `litellm_db`

### API Credentials
- **Master Key**: From `LITELLM_MASTER_KEY` in `.env`
- **Gemini API Keys**: 9 keys configured for multi-key resilience

### Configuration File
- **Config**: `litellm_config.yaml` - Mounted in the container for model management

## Testing the Configuration

### Prerequisites

1. **Docker Compose Running**: Ensure LiteLLM services are running
   ```bash
   cd C:\Users\Laptop\Desktop\Projects\LiteLLM
   docker-compose up -d
   ```

2. **MCP Server Container**: Build and start the MCP server container
   ```bash
   docker-compose up -d --build mcp_server
   ```

3. **Health Check**: Verify LiteLLM is accessible
   ```bash
   curl http://localhost:4001/health/liveliness
   # Should respond: "I'm alive!"
   ```

### VSCode Testing

Once configured, the MCP server should be available in VSCode:

1. Open VSCode
2. The MCP server "litellm-manager" should appear in the tools/MCP panel
3. Verify connection by checking the Claude/Copilot output panel for:
   - Connection status: `Connected`
   - Available tools listed

### Available Tools

After successful connection, the following tools should be available:

#### Model Management
- `add_model` - Add a new model deployment
- `remove_model` - Remove a model deployment
- `list_models` - List all active models
- `update_model_limits` - Modify RPM/TPM limits
- `get_model_info` - Get detailed model information

#### API Key Management
- `create_virtual_key` - Create a new API key with budget
- `revoke_key` - Revoke/disable an API key
- `list_keys` - List all API keys with spend data
- `update_key_budget` - Modify key budget and limits

#### Monitoring & Analytics
- `get_spend_analytics` - View spend by model/user/time
- `get_health_status` - Check system health
- `get_request_logs` - Query request history
- `tail_logs` - Real-time log streaming

## Network Configuration

### From MCP Server Container (Docker)
- `LITELLM_API_BASE`: Uses `http://llm:4000` (internal Docker network)
- `DATABASE_URL`: Uses `litellm_db:5432` (internal Docker network)
- `REDIS_HOST`: Uses `litellm_redis:6379` (internal Docker network)

### From VSCode Host Machine
- `LITELLM_API_BASE`: Uses `http://localhost:4001` (Docker port mapping)
- Database: Uses `localhost:5432` (Docker port mapping)
- Redis: Uses `localhost:6379` (Docker port mapping)

## Troubleshooting

### MCP Server Not Connecting

1. **Check Docker container is running**:
   ```bash
   docker ps | grep litellm_mcp
   ```

2. **View MCP server logs**:
   ```bash
   docker logs litellm_mcp
   ```

3. **Verify LiteLLM is accessible**:
   ```bash
   Invoke-WebRequest -Uri "http://localhost:4001/models" -UseBasicParsing
   ```

### Database Connection Issues

1. **Check PostgreSQL is running**:
   ```bash
   docker exec litellm_db psql -U user -d litellm_db -c "SELECT 1"
   ```

2. **Verify connection string**:
   ```bash
   # From MCP container
   docker exec litellm_mcp python -c "import psycopg2; psycopg2.connect('postgresql://user:password@litellm_db:5432/litellm_db')"
   ```

### Redis Connection Issues

1. **Check Redis is running**:
   ```bash
   docker exec litellm_redis redis-cli -a redis_password_litellm ping
   ```

2. **Verify connection from MCP**:
   ```bash
   docker exec litellm_mcp python -c "import redis; redis.Redis(host='litellm_redis', port=6379, password='redis_password_litellm').ping()"
   ```

## Security Considerations

### For Development/Testing
- Credentials in `mcp.json` are acceptable for local testing
- Ensure `.env` file is in `.gitignore` (already configured)
- Master key should be rotated in production

### For Production
- Use environment variable files instead of hardcoded values
- Implement secret management (e.g., HashiCorp Vault, AWS Secrets Manager)
- Restrict database access to MCP server container only
- Use network policies to limit inter-service communication
- Enable SSL/TLS for all connections

## Next Steps

1. **Verify Connection**: Test that Copilot/Claude can access the MCP tools
2. **Run Integration Tests**: Create test scenarios for each tool
3. **Load Testing**: Test with realistic usage patterns
4. **Documentation**: Document expected responses and edge cases
5. **Deployment**: Create production configuration with proper secrets management
