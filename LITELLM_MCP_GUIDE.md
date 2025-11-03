# LiteLLM MCP Management Server: The Complete Guide

## 1. Introduction & Goal

**Goal:** This project provides a custom Python-based MCP (Model-Context-Protocol) server designed to give AI assistants dynamic, natural-language-based control over a LiteLLM gateway. It eliminates the need for manual YAML configuration edits and container restarts to manage the LiteLLM infrastructure.

An AI assistant (like Claude, GPT-4, or a VSCode Copilot) can use the tools provided by this server to manage model deployments, create and revoke API keys, update routing strategies, monitor health, and debug issues in real-time.

**Core Problem Solved:** Existing MCP servers allow an AI to *use* LiteLLM to call other models. This server does the opposite: it allows an AI to *manage the LiteLLM gateway itself*.

## 2. System Architecture

The system is composed of three main layers: the AI Assistant, the MCP Management Server, and the LiteLLM Infrastructure. The MCP server runs as a standalone Docker container and communicates with the AI assistant via the stdio-based MCP protocol. It interacts with the LiteLLM PostgreSQL database and Admin API to perform management tasks.

```mermaid
graph TD
    subgraph AI Assistant Layer
        A[AI Assistant e.g., Claude, GPT-4]
    end

    subgraph Custom MCP Server (Docker Container)
        B[MCP Server Logic]
        C[Tool Registry - 15+ Tools]
        D[Database Connector]
        E[Admin API Client]
        F[Config Sync Worker]
    end

    subgraph LiteLLM Infrastructure
        G[PostgreSQL Database]
        H[LiteLLM Admin UI API]
        I[litellm_config.yaml]
    end

    A -- "MCP Protocol (stdio)" --> B
    B --> C
    C --> D
    C --> E
    D -- "Manages" --> G
    E -- "Calls" --> H
    F -- "Reads from" --> G
    F -- "Writes to" --> I
```

**Key Components:**

*   **AI Assistant:** The MCP client that sends tool-use requests (e.g., VSCode with an AI extension).
*   **MCP Server:** The core of this project. It receives requests, executes the corresponding tool, and returns the result.
    *   **Tool Registry:** Contains the definitions and logic for all management tools.
    *   **Database Connector:** Manages the connection and transactions with the LiteLLM PostgreSQL database.
    *   **Admin API Client:** Interacts with the LiteLLM Admin UI's REST API.
    *   **Config Sync Worker:** A background process that periodically syncs the configuration from the database to a persistent `litellm_config.yaml` file.
*   **LiteLLM Infrastructure:**
    *   **PostgreSQL Database:** The source of truth for virtual keys, model configurations, and audit logs.
    *   **LiteLLM Admin UI API:** An API for performing administrative actions.
    *   **litellm_config.yaml:** The persistent configuration file used by LiteLLM, which this server keeps in sync with the database.


---

## 3. Deployment & Installation

This server is designed to run as a Docker container within your existing LiteLLM stack.

### Prerequisites

*   A running LiteLLM environment, including `litellm_db` (PostgreSQL), `llm` (Admin UI), and `litellm_redis`.
*   Docker and Docker Compose installed.

### Step 1: Create the Project Directory and Dockerfile

1.  Create a directory for the MCP server (e.g., `mcp_server/`).
2.  Inside `mcp_server/`, create a `Dockerfile` with the following content:

    ```dockerfile
    FROM python:3.11-slim

    WORKDIR /app

    COPY requirements.txt .
    RUN pip install --no-cache-dir -r requirements.txt

    COPY . .

    # Run as stdio server
    # The entrypoint will be a python script that handles MCP communication.
    CMD ["python", "-m", "mcp_server"]
    ```

3.  Create a `requirements.txt` file in the same directory:

    ```
    mcp>=0.9.0
    psycopg2-binary>=2.9.9
    httpx>=0.25.0
    pydantic>=2.5.0
    pyyaml>=6.0.1
    python-dotenv>=1.0.0
    asyncio>=3.4.3
    ```

### Step 2: Update Docker Compose

Add the `mcp_server` service to your main `docker-compose.yaml` file. This service will build the image from the `mcp_server` directory and connect it to the LiteLLM network.

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

### Step 3: Configure VSCode for MCP

To allow your AI assistant in VSCode to discover and use the server's tools, create or update your `.vscode/mcp.json` file in the project root:

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
This configuration tells the MCP extension to communicate with the server by executing a command inside the running `litellm_mcp` container.

### Step 4: Build and Run

From your project's root directory, run the following command to build the new `mcp_server` image and start all services:

```bash
docker-compose up -d --build
```

Your MCP management server is now running and ready to accept commands from a connected AI assistant.


---

## 4. Tool Catalog

This section details the 15+ management tools provided by the MCP server. They are grouped by category.

### Category 1: Model Deployment Management

Tools for adding, removing, and managing model deployments in the LiteLLM gateway.

#### 1.1 `add_model`
**Purpose:** Adds a new model deployment to the LiteLLM gateway without requiring a container restart.

**Parameters:**
```json
{
  "model_name": "str,          // e.g., 'gpt-4-turbo-new' or 'gemini-pro-vision'",
  "provider": "str,            // 'openai' | 'gemini' | 'anthropic' | 'azure'",
  "api_key": "str,             // Raw key or env var reference '${OPENAI_KEY_2}'",
  "api_base": "Optional[str],  // Custom endpoint for Azure or self-hosted models",
  "rpm": "int,                 // Rate limit: requests per minute (default: 100)",
  "tpm": "int,                 // Token limit: tokens per minute (default: 100000)",
  "max_parallel": "int,        // Max concurrent requests (default: 8)",
  "pool_name": "Optional[str], // Add to an existing pool or create a new one",
  "region": "Optional[str],    // e.g., AWS region or Azure location",
  "timeout": "int              // Request timeout in seconds (default: 600)"
}
```

**Returns:** A JSON object confirming the creation and health status of the new deployment.
```json
{
  "success": true,
  "deployment_id": "uuid-1234-5678",
  "model_name": "gpt-4-turbo-new",
  "pool_name": "gpt-4-pool",
  "health_check": "passed",
  "available_in_routing": true
}
```

---

#### 1.2 `remove_model`
**Purpose:** Removes a model deployment from the routing pool.

**Parameters:**
```json
{
  "deployment_id": "str,       // The UUID of the deployment from the database",
  "drain_time": "int           // Seconds to wait for inflight requests to complete (default: 0)"
}
```

**Returns:** A confirmation object with details of the removed deployment.
```json
{
  "success": true,
  "removed_deployment": {
    "deployment_id": "uuid-1234-5678",
    "model_name": "gpt-4-old-key",
    "removed_at": "2025-11-03T10:30:00Z"
  }
}
```

---

#### 1.3 `list_models`
**Purpose:** Retrieves all active model deployments, optionally including health and performance metrics.

**Parameters:**
```json
{
  "filter_by_pool": "Optional[str],    // Filter results by a specific pool name",
  "filter_by_provider": "Optional[str], // Filter by provider, e.g., 'openai', 'gemini'",
  "include_health": "bool,             // Include real-time health check status (default: false)",
  "include_metrics": "bool             // Include request counts and latency (default: false)"
}
```

**Returns:** A list of model objects and a total count.
```json
{
  "models": [
    {
      "deployment_id": "uuid-1234",
      "model_name": "gpt-4-turbo",
      "provider": "openai",
      "pool_name": "gpt-4-pool",
      "rpm_limit": 100,
      "tpm_limit": 100000,
      "health_status": "healthy",
      "avg_latency_ms": 1250,
      "requests_last_hour": 234
    }
  ],
  "total_count": 13
}
```

---

#### 1.4 `update_model_limits`
**Purpose:** Modifies the rate limits or timeout for an existing model deployment.

**Parameters:**
```json
{
  "deployment_id": "str",
  "rpm": "Optional[int]",
  "tpm": "Optional[int]",
  "max_parallel": "Optional[int]",
  "timeout": "Optional[int]"
}
```

**Returns:** A confirmation object showing the updated values.
```json
{
    "success": true,
    "deployment_id": "uuid-1234",
    "updated_fields": {
        "rpm": 200,
        "tpm": 200000
    }
}
```


---

### Category 2: Virtual Key Management

Tools for creating, revoking, and managing virtual API keys for clients.

#### 2.1 `create_virtual_key`
**Purpose:** Generates a secure API key for clients, with configurable budgets, rate limits, and model access.

**Parameters:**
```json
{
  "key_name": "str,                    // A human-readable name, e.g., 'client-acme-prod'",
  "budget_usd": "float,                // The budget amount (e.g., 500.00)",
  "budget_duration": "str,             // 'monthly' | 'daily' | 'total'",
  "allowed_models": "List[str],        // Models this key can access, e.g., ['gpt-4', 'gpt-3.5-turbo']",
  "rpm_limit": "int,                   // Per-key rate limit (requests per minute)",
  "tpm_limit": "int,                   // Per-key token limit (tokens per minute)",
  "max_budget_usd": "float,            // A hard spending cap (default: budget_usd * 2)",
  "expires_at": "Optional[datetime],   // A specific expiration date",
  "metadata": "Optional[dict],         // Custom tags, e.g., {'client_id': '12345'}",
  "allowed_cache_controls": "List[str] // Caching permissions, e.g., ['no-cache', 'no-store']"
}
```

**Returns:** The newly generated key (this is the only time it will be shown in plaintext), along with its metadata.
```json
{
  "success": true,
  "key": "sk-litellm-abc123def456...",
  "key_id": "uuid-key-1234",
  "key_name": "client-acme-prod",
  "budget_usd": 500.00,
  "expires_at": "2025-12-03T00:00:00Z",
  "warning": "Store this key securely. It will not be shown again."
}
```

---

#### 2.2 `revoke_key`
**Purpose:** Immediately disables a virtual API key.

**Parameters:**
```json
{
  "key_id": "str,              // The UUID of the key or the key string itself (sk-litellm-...)",
  "reason": "Optional[str]     // A reason for the revocation, e.g., 'budget_exceeded'"
}
```

**Returns:** A confirmation object with the revocation status.
```json
{
    "success": true,
    "revoked_key_id": "uuid-key-1234",
    "revoked_at": "2025-11-03T11:00:00Z"
}
```

---

#### 2.3 `list_keys`
**Purpose:** Views all virtual keys, including their current spend, status, and budget.

**Parameters:**
```json
{
  "show_spend": "bool,                 // Include spend metrics in the response (default: true)",
  "filter_by_status": "Optional[str],  // 'active' | 'revoked' | 'expired'",
  "include_hashed_key": "bool          // Show a partial key preview (sk-...xyz) (default: false)"
}
```

**Returns:** A list of key objects and a total count.
```json
{
  "keys": [
    {
      "key_id": "uuid-key-1234",
      "key_name": "client-acme-prod",
      "key_preview": "sk-litellm-abc...xyz",
      "status": "active",
      "budget_usd": 500.00,
      "spend_usd": 123.45,
      "remaining_usd": 376.55,
      "requests_count": 1250,
      "created_at": "2025-11-01T00:00:00Z",
      "expires_at": "2025-12-01T00:00:00Z"
    }
  ],
  "total_count": 8
}
```

---

#### 2.4 `update_key_budget`
**Purpose:** Increases or decreases a key's budget without needing to recreate it.

**Parameters:**
```json
{
  "key_id": "str",
  "new_budget_usd": "float",
  "reset_spend": "bool         // If true, resets the current spend counter to 0 (default: false)"
}
```

**Returns:** A confirmation object with the updated budget details.
```json
{
    "success": true,
    "key_id": "uuid-key-1234",
    "old_budget_usd": 500.00,
    "new_budget_usd": 1000.00
}
```


---

### Category 3: Routing & Fallback Management

Tools for controlling how LiteLLM routes requests and handles failures.

#### 3.1 `update_routing_strategy`
**Purpose:** Changes the load balancing algorithm used to distribute requests across model deployments.

**Parameters:**
```json
{
  "strategy": "str,  // 'least-busy' | 'simple-shuffle' | 'cost-based' | 'latency-based'",
  "apply_to_pool": "Optional[str]  // Apply to a specific pool or globally if omitted"
}
```

**Supported Strategies:**
*   `least-busy`: Routes to the deployment with the fewest active requests.
*   `simple-shuffle`: Randomly selects a healthy deployment.
*   `cost-based`: Prioritizes the cheapest provider.
*   `latency-based`: Prioritizes the fastest provider based on a rolling average.

**Returns:** A confirmation object showing the old and new strategies.
```json
{
    "success": true,
    "previous_strategy": "least-busy",
    "new_strategy": "cost-based"
}
```

---

#### 3.2 `add_fallback_chain`
**Purpose:** Defines a sequence of fallback models to use when a primary model deployment fails.

**Parameters:**
```json
{
  "primary_model": "str,           // e.g., 'gpt-4-turbo'",
  "fallback_models": "List[str],   // e.g., ['gpt-4', 'claude-3-opus', 'gpt-3.5']",
  "fallback_on_errors": "List[str] // Errors that trigger fallback, e.g., ['rate_limit', 'timeout', '5xx'] (default: all)"
}
```

**Returns:** A confirmation object with the details of the newly created fallback chain.
```json
{
  "success": true,
  "chain_id": "uuid-chain-1234",
  "primary_model": "gpt-4-turbo",
  "fallback_models": ["gpt-4", "claude-3-opus", "gpt-3.5"],
  "active": true
}
```

---

#### 3.3 `remove_fallback_chain`
**Purpose:** Deletes a configured fallback chain.

**Parameters:**
```json
{
  "chain_id": "str" // The UUID of the chain to remove
}
```

**Returns:** A confirmation object.
```json
{
    "success": true,
    "removed_chain_id": "uuid-chain-1234"
}
```

---

#### 3.4 `list_fallback_chains`
**Purpose:** Views all configured fallback chains.

**Parameters:** None

**Returns:** A list of all active fallback chains.
```json
{
  "chains": [
    {
      "chain_id": "uuid-chain-1234",
      "primary_model": "gpt-4-turbo",
      "fallback_models": ["gpt-4", "claude-3-opus"],
      "fallback_on_errors": ["rate_limit", "timeout"],
      "active": true,
      "fallback_triggered_count": 23
    }
  ]
}
```


---

### Category 4: Monitoring & Health Checks

Tools for checking the status and health of the LiteLLM proxy and its dependent services.

#### 4.1 `get_proxy_health`
**Purpose:** Checks the health status of all running LiteLLM proxy instances.

**Parameters:**
```json
{
  "instance_filter": "Optional[str],   // Filter by instance ID ('proxy-05') or port ('8705')",
  "include_metrics": "bool,            // Include request counts and latency (default: false)",
  "include_errors": "bool              // Include recent error counts (default: false)"
}
```

**Returns:** A list of proxy instance statuses and an overall summary.
```json
{
  "proxies": [
    {
      "instance_id": "proxy-01",
      "port": 8701,
      "status": "healthy",
      "uptime_seconds": 86400,
      "avg_latency_ms": 1200,
      "requests_last_hour": 145,
      "errors_last_hour": 2,
      "last_health_check": "2025-11-03T10:40:00Z"
    }
  ],
  "total_healthy": 13,
  "total_unhealthy": 0
}
```

---

#### 4.2 `get_service_health`
**Purpose:** Performs an overall system health check on the MCP server's critical dependencies (Database, Redis, Admin API).

**Parameters:** None

**Returns:** A JSON object with the status of each dependent service.
```json
{
  "database": {
    "status": "healthy",
    "latency_ms": 5,
    "connection_pool": "8/20 active"
  },
  "redis": {
    "status": "healthy",
    "latency_ms": 2,
    "memory_used_mb": 45
  },
  "admin_api": {
    "status": "healthy",
    "response_time_ms": 120
  },
  "overall_status": "healthy"
}
```


---

### Category 5: Spend Analytics & Debugging

Tools for querying cost metrics and troubleshooting errors.

#### 5.1 `get_spend_dashboard`
**Purpose:** Queries cost and usage metrics with flexible timeframes and groupings.

**Parameters:**
```json
{
  "timeframe": "str,           // 'last_hour' | 'today' | 'this_week' | 'this_month'",
  "group_by": "str,            // 'key' | 'model' | 'user' | 'provider'",
  "key_filter": "Optional[str], // Filter by a specific key_id",
  "model_filter": "Optional[str]// Filter by a specific model name"
}
```

**Returns:** A summary of total spend and a detailed breakdown by the specified group.
```json
{
  "timeframe": "today",
  "total_spend_usd": 45.67,
  "total_requests": 2345,
  "breakdown": [
    {
      "entity": "gpt-4-turbo",
      "spend_usd": 32.50,
      "requests": 1200,
      "avg_cost_per_request": 0.027
    },
    {
      "entity": "gpt-3.5-turbo",
      "spend_usd": 13.17,
      "requests": 1145,
      "avg_cost_per_request": 0.011
    }
  ]
}
```

---

#### 5.2 `debug_failed_requests`
**Purpose:** Queries error logs to find the root cause of failed requests.

**Parameters:**
```json
{
  "timeframe": "str,               // ISO 8601 or relative time, e.g., 'last_hour'",
  "key_id": "Optional[str],
  "model": "Optional[str],
  "error_type": "Optional[str],    // 'timeout' | 'rate_limit' | 'auth' | '5xx'",
  "limit": "int                    // Max number of results to return (default: 50)"
}
```

**Returns:** A list of failed request logs matching the query.
```json
{
  "failed_requests": [
    {
      "timestamp": "2025-11-03T10:35:22Z",
      "request_id": "req-abc123",
      "key_id": "uuid-key-1234",
      "model": "gpt-4-turbo",
      "error_type": "rate_limit",
      "error_message": "Rate limit exceeded (429)",
      "provider_response": "You exceeded your current quota",
      "retry_after_seconds": 60
    }
  ],
  "total_errors": 12
}
```

---

#### 5.3 `get_recent_logs`
**Purpose:** Tails the LiteLLM proxy logs with filtering capabilities.

**Parameters:**
```json
{
  "level": "str,               // 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR'",
  "limit": "int,               // Max number of lines to return (default: 50)",
  "grep": "Optional[str],      // A search pattern to filter logs",
  "instance": "Optional[str]   // Filter by a specific proxy instance ID"
}
```

**Returns:** A list of log entries.
```json
{
    "logs": [
        "2025-11-03T10:35:22.123Z [ERROR] [proxy-05] Request failed: Rate limit exceeded for model gpt-4-turbo"
    ]
}
```


---

### Category 6: Configuration Management

Tools for managing the synchronization between the database and the persistent `litellm_config.yaml` file.

#### 6.1 `sync_config_to_yaml`
**Purpose:** Manually triggers the synchronization process from the database to the `litellm_config.yaml` file. This process also runs automatically every 60 seconds.

**Parameters:**
```json
{
  "backup": "bool,             // If true, creates a timestamped backup before syncing (default: true)",
  "force": "bool               // If true, overwrites the YAML file even if external changes are detected (default: false)"
}
```

**Returns:** A report detailing the synchronization results.
```json
{
  "success": true,
  "backup_path": "_Backups/litellm_config.backup_20251103_103000.yaml",
  "synced_models": 13,
  "synced_routing_rules": 1,
  "sync_timestamp": "2025-11-03T10:30:00Z"
}
```

---

#### 6.2 `reload_config_from_yaml`
**Purpose:** Imports configuration from the `litellm_config.yaml` file into the database. This serves as a powerful rollback or recovery mechanism.

**Parameters:**
```json
{
  "backup_file": "Optional[str], // If provided, loads from a specific backup file instead of the main config",
  "dry_run": "bool               // If true, previews the changes without applying them (default: false)"
}
```

**Returns:** A summary of the changes that were or would be applied.
```json
{
  "success": true,
  "loaded_models": 13,
  "changes_detected": {
    "added_models": 2,
    "removed_models": 1,
    "updated_routing": true
  },
  "dry_run": false
}
```

---

#### 6.3 `list_config_backups`
**Purpose:** Views the available configuration backup files that can be used for restoration.

**Parameters:** None

**Returns:** A list of available backup files.
```json
{
  "backups": [
    {
      "filename": "litellm_config.backup_20251103_103000.yaml",
      "created_at": "2025-11-03T10:30:00Z",
      "size_bytes": 5432,
      "models_count": 13
    }
  ]
}
```

---

#### 6.4 `restore_config_backup`
**Purpose:** Rolls the entire configuration back to a previous state using a backup file.

**Parameters:**
```json
{
  "backup_file": "str,         // The filename of the backup to restore, from list_config_backups",
  "restart_required": "bool    // Whether to restart the proxy containers after restore (default: false)"
}
```

**Returns:** A confirmation object.
```json
{
    "success": true,
    "restored_from": "litellm_config.backup_20251103_103000.yaml"
}
```


---

### Category 7: Audit & Compliance

Tools for reviewing the history of operations performed by the MCP server.

#### 7.1 `get_audit_log`
**Purpose:** Queries the history of all MCP operations, providing a full audit trail for compliance and accountability.

**Parameters:**
```json
{
  "timeframe": "str,               // e.g., 'last_hour', 'today', or an ISO 8601 range",
  "tool_name": "Optional[str],     // Filter by a specific tool name, e.g., 'add_model'",
  "executed_by": "Optional[str],   // Filter by the AI assistant identifier",
  "success_only": "bool            // If true, only returns successful operations (default: false)"
}
```

**Returns:** A list of audit log entries.
```json
{
  "audit_entries": [
    {
      "id": "uuid-audit-1234",
      "timestamp": "2025-11-03T10:35:00Z",
      "tool_name": "add_model",
      "parameters": {"model_name": "gpt-4-turbo-new", "provider": "openai"},
      "executed_by": "claude-desktop",
      "result": {"success": true, "deployment_id": "uuid-deploy-5678"},
      "duration_ms": 234
    }
  ]
}
```


---

## 5. Development Guide

This section provides instructions for developers working on the MCP server itself.

### Project Structure

The server code should be organized as follows within the `mcp_server/` directory:

```
mcp_server/
├── Dockerfile
├── requirements.txt
├── __init__.py
├── __main__.py          # Entry point for the stdio server
├── litellm_mcp.py       # Main MCP server logic and tool registration
├── db_connector.py      # PostgreSQL client and transaction management
├── admin_api.py         # Client for the LiteLLM Admin UI REST API
├── config_sync.py       # Background worker for YAML synchronization
└── schema/
    └── database_schema.md  # Documentation of relevant DB table structures
```

### Adding a New Tool

To add a new tool to the server:

1.  **Define the Logic:** Create a new function for your tool in a relevant file (e.g., a new key management tool would go in `litellm_mcp.py` or a dedicated key management module). The function should handle parameter validation, interact with the database or Admin API, and return a JSON-serializable dictionary.
2.  **Use Transactions:** For any operation that involves multiple database writes, wrap the logic in a transaction using the `db_connector` to ensure atomicity. If any step fails, the entire transaction will be rolled back.
3.  **Add Audit Logging:** Add the `@audit_tool` decorator to your tool's function. This automatically logs the tool call, its parameters, the result, and its duration to the `mcp_audit_log` table.
4.  **Register the Tool:** In `litellm_mcp.py`, import your new tool function and add it to the tool registry. This will make it discoverable by the MCP server.

### Audit Logging Decorator

To ensure all operations are logged, a decorator is used. Here is a conceptual example:

```python
# In a shared utilities file
import time
from functools import wraps

# Assume 'db' is an accessible database connector instance
# Assume 'get_current_assistant' is a function that gets the client ID from MCP context

def audit_tool(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        start_time = time.time()
        tool_name = func.__name__

        try:
            result = await func(*args, **kwargs)
            success = True
            error_message = None
        except Exception as e:
            result = None
            success = False
            error_message = str(e)
            raise # Re-raise the exception after logging
        finally:
            duration_ms = int((time.time() - start_time) * 1000)

            # Asynchronously log the audit entry to the database
            await db.insert_audit_log(
                tool_name=tool_name,
                parameters=kwargs,
                executed_by=get_current_assistant(),
                result=result,
                success=success,
                duration_ms=duration_ms,
                error_message=error_message
            )
        return result
    return wrapper
```

### Database Transaction Safety

All tools that perform write operations must use database transactions to prevent leaving the system in an inconsistent state.

**Example: `add_model` with transaction handling:**

```python
# In litellm_mcp.py

@audit_tool
async def add_model(self, params: dict) -> dict:
    async with self.db.transaction() as tx:
        try:
            # 1. Validate API key (external call)
            health_check = await self.admin_api.test_key(params['api_key'])
            if not health_check['valid']:
                raise ValueError("Invalid API key")

            # 2. Insert model record into the database
            deployment_id = await tx.insert('LiteLLM_ProxyModelTable', {...})

            # 3. Add model to a routing pool
            await tx.insert('LiteLLM_RoutingPool', {...})

            # 4. If all steps succeed, the transaction is automatically committed

            # 5. Trigger a non-blocking config sync
            asyncio.create_task(self.config_sync.sync_to_yaml())

            return {'success': True, 'deployment_id': deployment_id}

        except Exception as e:
            # If any error occurs, the transaction is automatically rolled back
            raise
```


---

## 6. Operations & Maintenance

This section covers best practices for running and maintaining the MCP server.

### Configuration Persistence Strategy

To ensure that changes made by the AI assistant persist across container restarts, the server uses an **"Auto-Sync to YAML"** strategy with automatic backups.

**How it works:**
1.  **Primary Storage:** The PostgreSQL database is the single source of truth for all configuration (models, keys, routing, etc.). Every tool operation writes directly to the database for an immediate effect.
2.  **Background Sync:** A background worker process (`config_sync.py`) runs in a loop. Every 60 seconds, it queries the database for the complete configuration.
3.  **Automatic Backups:** Before writing to the main config file, the worker creates a timestamped backup of the current `litellm_config.yaml` and saves it to the `/_Backups/` directory (e.g., `litellm_config.backup_YYYYMMDD_HHMMSS.yaml`). This prevents data loss.
4.  **YAML Write:** The worker then serializes the configuration from the database into the correct YAML format and overwrites the `litellm_config.yaml` file.
5.  **Rollback:** You can use the `restore_config_backup` and `reload_config_from_yaml` tools to roll back to a previous state if needed.

### Error Handling

The server provides detailed error responses to help the AI assistant understand and recover from failures.

**Error Categories:**
*   **Validation Errors:** Invalid or missing parameters in a tool call.
*   **Authentication Errors:** The server's `LITELLM_MASTER_KEY` is invalid.
*   **Database Errors:** The server cannot connect to the database or a query fails.
*   **API Errors:** The server fails to communicate with the LiteLLM Admin UI API.
*   **System Errors:** Filesystem issues (e.g., disk full), network problems, etc.

**Example Error Response:**
```json
{
  "success": false,
  "error": {
    "type": "ValidationError",
    "message": "Invalid RPM limit: must be between 1 and 10000",
    "field": "rpm",
    "provided_value": -5
  },
  "recoverable": true,
  "suggested_action": "Provide an RPM value between 1 and 10000."
}
```

### Logging Strategy

The server produces structured logs to provide insight into its operations.

**Log Levels:**
*   **DEBUG:** Detailed information for troubleshooting, including database queries and API calls.
*   **INFO:** High-level information about tool execution start/completion and sync operations.
*   **WARNING:** Potentially harmful situations, like detecting that the `litellm_config.yaml` file was modified externally.
*   **ERROR:** Tool execution failures, database errors, and API errors.
*   **CRITICAL:** Service-breaking events, like a complete loss of database or Redis connectivity.

By default, logs are written to the container's standard output. You can view them using `docker logs litellm_mcp`.
