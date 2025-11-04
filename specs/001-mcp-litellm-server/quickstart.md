# Quickstart: Deploying the LiteLLM MCP Server

**Status**: Completed

This guide provides the essential steps to build and run the LiteLLM MCP Management Server using Docker and Docker Compose.

## Prerequisites

- A running LiteLLM environment, including `litellm_db` (PostgreSQL), `llm` (Admin UI), and `litellm_redis`.
- Docker and Docker Compose are installed on your system.
- You have cloned the project repository.

## Step 1: Define the Server in Docker Compose

Add the `mcp_server` service to your main `docker-compose.yaml` file. This service will build the server's image and connect it to the LiteLLM network.

```yaml
services:
  # ... your other services (llm, litellm_db, etc.)

  mcp_server:
    build: ./mcp_server
    container_name: litellm_mcp
    restart: always
    depends_on:
      - litellm_db
      - llm
      - litellm_redis
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - LITELLM_MASTER_KEY=${LITELLM_MASTER_KEY}
      - LITELLM_API_BASE=http://llm:4000
      - REDIS_URL=redis://:${REDIS_PASSWORD}@litellm_redis:6379
    volumes:
      - ./litellm_config.yaml:/app/litellm_config.yaml
      - ./_Backups:/app/_Backups
    networks:
      - litellm_network
    stdin_open: true # Required for stdio communication
    tty: true       # Required for stdio communication

# ... your network definitions
```

## Step 2: Create the Server Dockerfile

Inside the `mcp_server/` directory, create a `Dockerfile` and a `requirements.txt` file.

**`mcp_server/Dockerfile`**:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# The entrypoint will be the Python script that handles MCP communication.
CMD ["python", "-m", "mcp_server"]
```

**`mcp_server/requirements.txt`**:
```
mcp>=0.9.0
psycopg2-binary>=2.9.9
httpx>=0.25.0
pydantic>=2.5.0
pyyaml>=6.0.1
python-dotenv>=1.0.0
asyncio>=3.4.3
```

## Step 3: Configure VSCode for MCP

To allow your AI assistant in VSCode to connect to the server, create or update your `.vscode/mcp.json` file in the project root:

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

## Step 4: Build and Run

From your project's root directory, run the following command. This will build the new `mcp_server` image and start all services defined in your compose file.

```bash
docker-compose up -d --build
```

Your MCP management server is now running and ready to accept commands from a connected AI assistant.
