# LiteLLM MCP Server Implementation Plan

## Executive Summary

**Goal:** Build a custom Python MCP server that wraps LiteLLM's Admin UI API and PostgreSQL database, enabling AI assistants (Claude, GPT-4, etc.) to dynamically manage the LiteLLM gateway through natural language commands—eliminating the need for manual YAML configuration edits and container restarts.

**Architecture:** Standalone Docker container exposing stdio-based MCP protocol, providing 15+ management tools for model deployments, virtual keys, routing strategies, monitoring, and debugging.

**Timeline:** 2-3 weeks for full implementation and testing

**Status:** Approved - All design decisions confirmed

---

## Why Build Custom? (Existing MCP Servers Don't Solve Our Problem)

### Existing MCP Servers Analyzed

**1. mcp-server-litellm (itsdarianngo):**
- **Purpose:** Allows AI assistants to CALL LLMs through LiteLLM
- **Tools:** `chat()`, `list_models()`, `get_model_info()`
- **Use Case:** MCP client uses tools to send prompts to GPT-4/Claude/etc.
- **Direction:** MCP Client → LiteLLM → AI Provider

**2. mcp-ai-hub (feiskyer):**
- **Purpose:** Unified interface for AI assistants to CHAT with 100+ models
- **Tools:** `chat()`, `list_models()`, `get_model_info()`
- **Use Case:** Claude Desktop calls tools to talk to different AI models
- **Direction:** MCP Client → LiteLLM → AI Provider

### Our Requirement is THE OPPOSITE

**What We Need:**
- **Purpose:** Allows AI assistants to MANAGE the LiteLLM gateway itself
- **Tools:** `add_model()`, `create_virtual_key()`, `update_routing_strategy()`, `debug_failed_requests()`
- **Use Case:** Claude Desktop uses tools to configure/monitor/debug the LiteLLM gateway
- **Direction:** MCP Client → Our Custom Server → LiteLLM Admin API/PostgreSQL

### Key Differences Table

| Aspect | Existing MCP Servers | Our Custom MCP Server |
|--------|---------------------|----------------------|
| **What they manage** | AI model conversations | LiteLLM gateway operations |
| **Target system** | External AI providers (OpenAI, Anthropic) | LiteLLM infrastructure itself |
| **Example tool** | `chat("gpt-4", "Hello!")` | `add_model("gpt-4-new-key", rpm=100)` |
| **Data source** | LiteLLM proxy for routing requests | PostgreSQL database + Admin UI API |
| **Write operations** | None (read-only, just queries models) | Many (create keys, add models, change routing) |
| **Configuration** | Static YAML (models to route to) | Dynamic management (modify running system) |
| **Analogy** | Using Postman to test APIs | Using Kubernetes Dashboard to manage cluster |

### Why Can't We Use Existing Servers?

**Problem 1: Wrong Direction**
- Existing: "Let AI use LiteLLM to call other AIs"
- We need: "Let AI configure and manage LiteLLM itself"

**Problem 2: No Management Tools**
- Existing: `chat()`, `list_models()`, `get_model_info()`
- We need: `add_model()`, `create_virtual_key()`, `update_routing_strategy()`, `revoke_key()`, `debug_failed_requests()`

**Problem 3: No Database Access**
- Existing: Only call LiteLLM proxy endpoints (inference)
- We need: Direct PostgreSQL access for virtual keys, spend logs, audit trails

**Problem 4: Read-Only Operation**
- Existing: Query models, send prompts (safe, read-only)
- We need: Write operations (add keys, remove models, change routing)

### Real-World Analogy

**Existing MCP servers are like:**
> "A phone app that lets you make calls through your phone carrier"

**Our custom MCP server is like:**
> "A control panel that lets you add new phone lines, change your plan, view your bill, block numbers, and debug connection issues"

### Conclusion

**We MUST build custom because:**
1. No existing MCP server manages LiteLLM infrastructure
2. Existing servers expose **inference tools** (chat with models)
3. We need **operations tools** (manage the gateway)
4. Our use case is fundamentally different: operational management vs. model usage

The existing repos are excellent references for MCP protocol implementation, but they solve a completely different problem.

---

## Design Decisions (CONFIRMED)

### Decision 1: Deployment Method
**✅ CONFIRMED: Docker Container Deployment**

**Rationale:**
- Consistent with existing stack (llm, litellm_db, litellm_redis, cloudflared)
- Isolated environment with managed dependencies
- Easy to restart, update, and version control
- Proper network access to internal services (litellm_db, llm:4000)

**Implementation:**
- New service in `docker-compose.yaml`: `mcp_server`
- Dockerfile with Python 3.11+ base image
- Volume mounts for config file access and logs
- stdio interface via `docker exec -i` for MCP communication

### Decision 2: Configuration Persistence Strategy
**✅ CONFIRMED: Auto-Sync to YAML with Automatic Backups**

**Rationale:**
- Changes persist across container restarts
- Git-trackable configuration history
- Automatic timestamped backups before each sync prevent data loss
- Best of both worlds: immediate database changes + durable file persistence

**Implementation:**
- Every tool operation writes to PostgreSQL first (immediate effect)
- Background sync process updates `litellm_config.yaml` every 60 seconds
- Pre-sync backup: `litellm_config.backup_YYYYMMDD_HHMMSS.yaml` → `_Backups/`
- Rollback capability via `reload_config_from_yaml()` tool
- Conflict detection: warn if YAML modified externally since last sync

### Decision 3: Tool Safety Guards
**✅ CONFIRMED: Trust AI Completely (No Confirmation Prompts)**

**Rationale:**
- User trusts AI assistant for operational decisions
- Confirmation prompts slow down workflows
- Audit logging provides full accountability trail
- Rollback capabilities mitigate mistakes

**Implementation:**
- All tools execute immediately without confirmation
- Comprehensive audit log captures every operation
- Undo/rollback tools available: `restore_config_backup()`, `revoke_key()`, `remove_model()`
- Non-blocking: AI can make rapid successive changes

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   AI Assistant Layer                        │
│  (Claude Desktop, VSCode Copilot, GPT-4 CLI)               │
│  Natural Language: "Add new OpenAI key with $100 budget"   │
└──────────────────────────┬──────────────────────────────────┘
                           │ MCP Protocol (stdio)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              MCP Server Container (litellm_mcp)             │
│  ┌────────────────────────────────────────────────────┐    │
│  │  litellm_mcp.py (Main Server)                      │    │
│  │  - Tool Registry (15+ tools)                       │    │
│  │  - stdio Protocol Handler                          │    │
│  │  - Tool Dispatcher                                 │    │
│  └────────────────┬───────────────────┬────────────────┘    │
│                   │                   │                     │
│  ┌────────────────▼──────┐  ┌────────▼───────────────┐    │
│  │  db_connector.py      │  │  admin_api.py          │    │
│  │  - PostgreSQL Client  │  │  - REST API Client     │    │
│  │  - Transaction Mgmt   │  │  - Bearer Auth         │    │
│  │  - Schema Mapping     │  │  - Error Handling      │    │
│  └────────────────┬──────┘  └────────┬───────────────┘    │
│                   │                   │                     │
│  ┌────────────────▼──────────────────▼───────────────┐    │
│  │  config_sync.py (Background Worker)               │    │
│  │  - Monitor database changes                        │    │
│  │  - Auto-sync to litellm_config.yaml (60s)         │    │
│  │  - Create timestamped backups                      │    │
│  └────────────────────────────────────────────────────┘    │
└──────────────────┬────────────────────┬────────────────────┘
                   │                    │
       ┌───────────▼────────┐    ┌─────▼──────────────────┐
       │  PostgreSQL DB     │    │  LiteLLM Admin UI API  │
       │  (litellm_db:5432) │    │  (llm:4000)            │
       │  ┌──────────────┐  │    │  ┌──────────────────┐  │
       │  │ virtual_keys │  │    │  │ /key/generate    │  │
       │  │ model_configs│  │    │  │ /model/new       │  │
       │  │ spend_logs   │  │    │  │ /health          │  │
       │  │ budgets      │  │    │  │ /spend/dashboard │  │
       │  │ audit_log    │  │    │  │ /config/update   │  │
       │  └──────────────┘  │    │  └──────────────────┘  │
       └────────────────────┘    └────────────────────────┘
                   │
                   ▼
       ┌───────────────────────┐
       │  litellm_config.yaml  │
       │  (Persistent Storage) │
       │  - Model deployments  │
       │  - Routing config     │
       │  - Fallback chains    │
       └───────────────────────┘
```

---

## Tool Catalog (15 Management Operations)

### Category 1: Model Deployment Management

#### 1.1 `add_model`
**Purpose:** Add new model deployment to LiteLLM gateway without container restart

**Parameters:**
```python
{
  "model_name": str,          # "gpt-4-turbo-new" or "gemini-pro-vision"
  "provider": str,            # "openai" | "gemini" | "anthropic" | "azure"
  "api_key": str,             # Raw key or env var reference "${OPENAI_KEY_2}"
  "api_base": Optional[str],  # Custom endpoint (Azure/self-hosted)
  "rpm": int,                 # Rate limit: requests per minute (default: 100)
  "tpm": int,                 # Token limit: tokens per minute (default: 100000)
  "max_parallel": int,        # Concurrent requests (default: 8)
  "pool_name": Optional[str], # Add to existing pool or create new
  "region": Optional[str],    # AWS region or Azure location
  "timeout": int              # Request timeout seconds (default: 600)
}
```

**Implementation Steps:**
1. Validate provider and model name against supported providers
2. Test API key validity with health check request
3. Insert into `LiteLLM_ProxyModelTable` with generated UUID
4. Add to routing pool or create new pool
5. Trigger config sync to YAML
6. Return deployment_id and health status

**Response:**
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

#### 1.2 `remove_model`
**Purpose:** Remove model deployment from routing pool

**Parameters:**
```python
{
  "deployment_id": str,       # UUID from database
  "drain_time": int           # Graceful shutdown seconds (default: 0)
}
```

**Implementation Steps:**
1. Query database for deployment details
2. If drain_time > 0: mark as draining, wait for inflight requests
3. Remove from `LiteLLM_ProxyModelTable`
4. Update routing pool configuration
5. Trigger config sync to YAML
6. Log removal in audit table

**Response:**
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

#### 1.3 `list_models`
**Purpose:** Get all active model deployments with health status

**Parameters:**
```python
{
  "filter_by_pool": Optional[str],    # Filter by pool name
  "filter_by_provider": Optional[str], # "openai", "gemini", etc.
  "include_health": bool,             # Include real-time health checks
  "include_metrics": bool             # Include request counts, latency
}
```

**Response:**
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

#### 1.4 `update_model_limits`
**Purpose:** Modify rate limits for existing deployment

**Parameters:**
```python
{
  "deployment_id": str,
  "rpm": Optional[int],
  "tpm": Optional[int],
  "max_parallel": Optional[int],
  "timeout": Optional[int]
}
```

### Category 2: Virtual Key Management

#### 2.1 `create_virtual_key`
**Purpose:** Generate API key for clients with budget and rate limits

**Parameters:**
```python
{
  "key_name": str,                    # "client-acme-prod"
  "budget_usd": float,                # Monthly budget (e.g., 500.00)
  "budget_duration": str,             # "monthly" | "daily" | "total"
  "allowed_models": List[str],        # ["gpt-4", "gpt-3.5-turbo"]
  "rpm_limit": int,                   # Per-key rate limit
  "tpm_limit": int,                   # Per-key token limit
  "max_budget_usd": float,            # Hard cap (default: budget_usd * 2)
  "expires_at": Optional[datetime],   # Expiration date
  "metadata": Optional[dict],         # Custom tags (client_id, project)
  "allowed_cache_controls": List[str] # ["no-cache", "no-store"] permissions
}
```

**Implementation Steps:**
1. Generate secure key: `sk-litellm-{random_32_chars}`
2. Hash key for storage (bcrypt)
3. Insert into `LiteLLM_VerificationToken` table
4. Create budget entry in `LiteLLM_BudgetTable`
5. Set rate limits in Redis cache
6. Return plaintext key (only shown once)

**Response:**
```json
{
  "success": true,
  "key": "sk-litellm-abc123def456...",
  "key_id": "uuid-key-1234",
  "key_name": "client-acme-prod",
  "budget_usd": 500.00,
  "expires_at": "2025-12-03T00:00:00Z",
  "created_at": "2025-11-03T10:35:00Z",
  "warning": "Store this key securely. It will not be shown again."
}
```

#### 2.2 `revoke_key`
**Purpose:** Immediately disable virtual key

**Parameters:**
```python
{
  "key_id": str,              # UUID or key string (sk-litellm-...)
  "reason": Optional[str]     # "budget_exceeded", "client_request", etc.
}
```

**Implementation Steps:**
1. Look up key in database (by ID or hash)
2. Set `revoked=true` and `revoked_at=NOW()`
3. Invalidate Redis cache entry
4. Log revocation in audit table
5. Return confirmation with revocation details

#### 2.3 `list_keys`
**Purpose:** View all virtual keys with current spend and status

**Parameters:**
```python
{
  "show_spend": bool,                 # Include spend metrics (default: true)
  "filter_by_status": Optional[str],  # "active" | "revoked" | "expired"
  "include_hashed_key": bool          # Show partial key (sk-...xyz)
}
```

**Response:**
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

#### 2.4 `update_key_budget`
**Purpose:** Increase or decrease key budget without recreating

**Parameters:**
```python
{
  "key_id": str,
  "new_budget_usd": float,
  "reset_spend": bool         # Reset spend counter to 0 (default: false)
}
```

### Category 3: Routing & Fallback Management

#### 3.1 `update_routing_strategy`
**Purpose:** Change load balancing algorithm

**Parameters:**
```python
{
  "strategy": str,  # "least-busy" | "simple-shuffle" | "cost-based" | "latency-based"
  "apply_to_pool": Optional[str]  # Apply to specific pool or global
}
```

**Supported Strategies:**
- `least-busy`: Route to instance with fewest active requests (current default)
- `simple-shuffle`: Random selection across healthy instances
- `cost-based`: Route to cheapest provider first
- `latency-based`: Route to fastest provider (rolling avg)

**Implementation Steps:**
1. Validate strategy name
2. Update `router_settings.routing_strategy` in database
3. Trigger config sync to YAML `router_settings` section
4. Clear routing cache in Redis
5. Return previous and new strategy

#### 3.2 `add_fallback_chain`
**Purpose:** Define fallback sequence when primary model fails

**Parameters:**
```python
{
  "primary_model": str,           # "gpt-4-turbo"
  "fallback_models": List[str],   # ["gpt-4", "claude-3-opus", "gpt-3.5"]
  "fallback_on_errors": List[str] # ["rate_limit", "timeout", "5xx"] (default: all)
}
```

**Implementation Steps:**
1. Validate all models exist in deployment pool
2. Create fallback entry in `LiteLLM_FallbackTable`
3. Update routing logic to check fallbacks on error
4. Trigger config sync to YAML `model_list[].fallbacks`
5. Return chain_id for later removal

**Response:**
```json
{
  "success": true,
  "chain_id": "uuid-chain-1234",
  "primary_model": "gpt-4-turbo",
  "fallback_models": ["gpt-4", "claude-3-opus", "gpt-3.5"],
  "active": true
}
```

#### 3.3 `remove_fallback_chain`
**Purpose:** Delete fallback chain

**Parameters:**
```python
{
  "chain_id": str
}
```

#### 3.4 `list_fallback_chains`
**Purpose:** View all configured fallback chains

**Response:**
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

### Category 4: Monitoring & Health Checks

#### 4.1 `get_proxy_health`
**Purpose:** Check health status of all 13 multi-proxy instances

**Parameters:**
```python
{
  "instance_filter": Optional[str],   # "proxy-05" or port "8705"
  "include_metrics": bool,            # Include request counts, latency
  "include_errors": bool              # Include recent error counts
}
```

**Response:**
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

#### 4.2 `get_service_health`
**Purpose:** Overall system health check (DB, Redis, API)

**Response:**
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

### Category 5: Spend Analytics & Debugging

#### 5.1 `get_spend_dashboard`
**Purpose:** Query cost metrics with flexible grouping

**Parameters:**
```python
{
  "timeframe": str,           # "last_hour" | "today" | "this_week" | "this_month"
  "group_by": str,            # "key" | "model" | "user" | "provider"
  "key_filter": Optional[str], # Filter by specific key_id
  "model_filter": Optional[str]
}
```

**Response:**
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

#### 5.2 `debug_failed_requests`
**Purpose:** Query error logs for troubleshooting

**Parameters:**
```python
{
  "timeframe": str,               # ISO 8601 or relative ("last_hour")
  "key_id": Optional[str],
  "model": Optional[str],
  "error_type": Optional[str],    # "timeout" | "rate_limit" | "auth" | "5xx"
  "limit": int                    # Max results (default: 50)
}
```

**Response:**
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

#### 5.3 `get_recent_logs`
**Purpose:** Tail LiteLLM proxy logs with filtering

**Parameters:**
```python
{
  "level": str,               # "DEBUG" | "INFO" | "WARNING" | "ERROR"
  "limit": int,               # Max lines (default: 50)
  "grep": Optional[str],      # Search pattern
  "instance": Optional[str]   # Filter by proxy instance
}
```

### Category 6: Configuration Management

#### 6.1 `sync_config_to_yaml`
**Purpose:** Manually trigger database → YAML sync (also runs auto every 60s)

**Parameters:**
```python
{
  "backup": bool,             # Create timestamped backup first (default: true)
  "force": bool               # Overwrite even if external changes detected
}
```

**Implementation Steps:**
1. Check if YAML modified externally (compare mtime vs last_sync_time)
2. If backup=true: Copy to `_Backups/litellm_config.backup_{timestamp}.yaml`
3. Query database for all models, routing settings, fallback chains
4. Serialize to YAML format matching LiteLLM schema
5. Write to `litellm_config.yaml`
6. Update last_sync_time in database
7. Return sync report

**Response:**
```json
{
  "success": true,
  "backup_path": "_Backups/litellm_config.backup_20251103_103000.yaml",
  "synced_models": 13,
  "synced_keys": 0,
  "synced_routing_rules": 1,
  "synced_fallback_chains": 2,
  "sync_timestamp": "2025-11-03T10:30:00Z"
}
```

#### 6.2 `reload_config_from_yaml`
**Purpose:** Import YAML changes into database (rollback mechanism)

**Parameters:**
```python
{
  "backup_file": Optional[str], # Load from backup instead of main config
  "dry_run": bool               # Preview changes without applying
}
```

**Response:**
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

#### 6.3 `list_config_backups`
**Purpose:** View available backup files for rollback

**Response:**
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

#### 6.4 `restore_config_backup`
**Purpose:** Rollback to previous configuration

**Parameters:**
```python
{
  "backup_file": str,         # Filename from list_config_backups
  "restart_required": bool    # Whether to restart proxy containers
}
```

### Category 7: Audit & Compliance

#### 7.1 `get_audit_log`
**Purpose:** Query MCP operation history

**Parameters:**
```python
{
  "timeframe": str,
  "tool_name": Optional[str],
  "executed_by": Optional[str],   # AI assistant identifier
  "success_only": bool
}
```

**Response:**
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

## Implementation Roadmap

### Phase 1: Foundation (Week 1, Days 1-3)

#### Day 1: Project Structure & Database
**Tasks:**
1. Create `mcp_server/` directory structure
2. Set up Python virtual environment with dependencies
3. Implement `db_connector.py` with PostgreSQL connection pooling
4. Map LiteLLM database schema (analyze existing tables)
5. Write database helper functions (CRUD operations with transactions)

**Files Created:**
```
mcp_server/
├── Dockerfile
├── requirements.txt
├── __init__.py
├── __main__.py          # Entry point for stdio server
├── litellm_mcp.py       # Main MCP server
├── db_connector.py      # PostgreSQL client
├── admin_api.py         # Admin UI REST client (stub)
├── config_sync.py       # Background sync worker (stub)
└── schema/
    └── database_schema.md  # Documented table structures
```

**requirements.txt:**
```
mcp>=0.9.0
psycopg2-binary>=2.9.9
httpx>=0.25.0
pydantic>=2.5.0
pyyaml>=6.0.1
python-dotenv>=1.0.0
asyncio>=3.4.3
```

**Database Connection Test:**
```python
# Test script: test_db_connection.py
from db_connector import DatabaseConnector

db = DatabaseConnector()
models = db.get_all_models()
print(f"Found {len(models)} models in database")
```

#### Day 2: Admin UI Client & First 3 Tools
**Tasks:**
1. Implement `admin_api.py` with bearer token authentication
2. Test Admin UI endpoints (`/health`, `/key/info`)
3. Implement core MCP server in `litellm_mcp.py`
4. Build first 3 tools: `add_model`, `create_virtual_key`, `get_proxy_health`
5. Set up stdio protocol handler

**admin_api.py Structure:**
```python
class LiteLLMAdminClient:
    def __init__(self, base_url: str, master_key: str):
        self.base_url = base_url
        self.headers = {"Authorization": f"Bearer {master_key}"}
    
    async def health_check(self) -> dict:
        # GET /health
    
    async def create_key(self, params: dict) -> dict:
        # POST /key/generate
    
    async def add_model(self, params: dict) -> dict:
        # POST /model/new
    
    async def get_spend(self, params: dict) -> dict:
        # GET /spend/dashboard
```

#### Day 3: Docker Integration & Testing
**Tasks:**
1. Create `Dockerfile` for MCP server
2. Add `mcp_server` service to `docker-compose.yaml`
3. Configure environment variables (DATABASE_URL, LITELLM_MASTER_KEY)
4. Test tool discovery from VSCode
5. Test first 3 tools end-to-end

**Dockerfile:**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Run as stdio server
CMD ["python", "-m", "mcp_server"]
```

**docker-compose.yaml Addition:**
```yaml
services:
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
    stdin_open: true
    tty: true
```

**VSCode MCP Config Update (.vscode/mcp.json):**
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

### Phase 2: Core Tools Implementation (Week 1, Days 4-7)

#### Day 4: Model Management Tools
**Tools to Implement:**
- `remove_model`
- `list_models`
- `update_model_limits`

**Testing:**
```
Test Workflow:
1. AI: "Add a test Gemini model with 50 RPM limit"
   → Uses add_model tool
2. AI: "Show me all Gemini models"
   → Uses list_models with filter_by_provider="gemini"
3. AI: "Increase RPM to 100"
   → Uses update_model_limits
4. AI: "Remove the test model"
   → Uses remove_model
5. Verify: Database empty of test model, no container restart occurred
```

#### Day 5: Virtual Key Management Tools
**Tools to Implement:**
- `revoke_key`
- `list_keys`
- `update_key_budget`

**Testing:**
```
Test Workflow:
1. AI: "Create a test key with $10 budget for GPT-3.5"
2. AI: "Show all keys with their spend"
3. AI: "Increase budget to $20"
4. AI: "Revoke the test key"
5. Verify: Key shows revoked=true, Redis cache invalidated
```

#### Day 6: Routing & Fallback Tools
**Tools to Implement:**
- `update_routing_strategy`
- `add_fallback_chain`
- `remove_fallback_chain`
- `list_fallback_chains`

**Testing:**
```
Test Workflow:
1. AI: "Switch routing to cost-based strategy"
   → Verify YAML updated, Redis cache cleared
2. AI: "Add fallback from GPT-4 to Claude if rate limited"
   → Verify fallback chain created
3. AI: "Show all fallback chains"
4. Trigger rate limit → Verify fallback activated
```

#### Day 7: Monitoring & Debug Tools
**Tools to Implement:**
- `get_service_health`
- `get_spend_dashboard`
- `debug_failed_requests`
- `get_recent_logs`

**Testing:**
```
Test Workflow:
1. AI: "Check system health"
   → Should show all services healthy
2. AI: "Show me today's spend by model"
3. AI: "Why did proxy-05 fail in the last hour?"
   → Uses debug_failed_requests
4. AI: "Show recent errors"
   → Uses get_recent_logs with level="ERROR"
```

### Phase 3: Configuration Sync & Audit (Week 2, Days 1-3)

#### Day 1: Auto-Sync Implementation
**Tasks:**
1. Implement `config_sync.py` background worker
2. Set up 60-second sync loop
3. Implement backup creation logic
4. Add conflict detection (external YAML modifications)

**config_sync.py Structure:**
```python
class ConfigSyncWorker:
    def __init__(self, db_connector, yaml_path: str):
        self.db = db_connector
        self.yaml_path = yaml_path
        self.last_sync_time = None
        self.last_yaml_mtime = None
    
    async def sync_loop(self):
        while True:
            await asyncio.sleep(60)  # Sync every 60 seconds
            await self.sync_to_yaml()
    
    async def sync_to_yaml(self):
        # 1. Check for external modifications
        current_mtime = os.path.getmtime(self.yaml_path)
        if self.last_yaml_mtime and current_mtime > self.last_yaml_mtime:
            logger.warning("External YAML modification detected!")
        
        # 2. Create backup
        backup_path = self._create_backup()
        
        # 3. Query database for current config
        models = self.db.get_all_models()
        routing = self.db.get_routing_config()
        fallbacks = self.db.get_fallback_chains()
        
        # 4. Serialize to YAML
        config = self._serialize_config(models, routing, fallbacks)
        
        # 5. Write to file
        with open(self.yaml_path, 'w') as f:
            yaml.dump(config, f)
        
        self.last_sync_time = datetime.now()
        self.last_yaml_mtime = os.path.getmtime(self.yaml_path)
    
    def _create_backup(self) -> str:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_path = f"_Backups/litellm_config.backup_{timestamp}.yaml"
        shutil.copy(self.yaml_path, backup_path)
        return backup_path
```

#### Day 2: Configuration Management Tools
**Tools to Implement:**
- `sync_config_to_yaml` (manual trigger)
- `reload_config_from_yaml`
- `list_config_backups`
- `restore_config_backup`

**Testing:**
```
Test Workflow:
1. AI: "Make several changes to models"
2. Wait 60 seconds → Verify auto-sync occurred
3. AI: "List available backups"
4. AI: "Manually sync config now"
5. AI: "Restore config from 10 minutes ago"
6. Verify: Database reverted to previous state
```

#### Day 3: Audit Logging System
**Tasks:**
1. Create `mcp_audit_log` table in PostgreSQL
2. Implement audit logging decorator for all tools
3. Implement `get_audit_log` tool
4. Test audit trail integrity

**Database Schema:**
```sql
CREATE TABLE mcp_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMP DEFAULT NOW(),
    tool_name VARCHAR(100) NOT NULL,
    parameters JSONB NOT NULL,
    executed_by VARCHAR(100),  -- AI assistant identifier
    result JSONB,
    success BOOLEAN DEFAULT true,
    duration_ms INTEGER,
    error_message TEXT,
    INDEX idx_timestamp (timestamp DESC),
    INDEX idx_tool_name (tool_name),
    INDEX idx_executed_by (executed_by)
);
```

**Audit Decorator:**
```python
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
            raise
        finally:
            duration_ms = int((time.time() - start_time) * 1000)
            
            # Log to database
            db.insert_audit_log(
                tool_name=tool_name,
                parameters=kwargs,
                executed_by=get_current_assistant(),  # From MCP context
                result=result,
                success=success,
                duration_ms=duration_ms,
                error_message=error_message
            )
        
        return result
    
    return wrapper
```

### Phase 4: Testing & Documentation (Week 2, Days 4-7)

#### Day 4: Integration Testing
**Test Suite:**
1. **Smoke Tests:** All tools discoverable, basic execution
2. **Workflow Tests:** Multi-step operations (add → test → remove)
3. **Error Handling:** Invalid parameters, auth failures, DB errors
4. **Concurrency Tests:** Multiple tool calls in parallel
5. **Sync Tests:** Verify YAML accuracy after database changes

**Test Script (test_mcp_integration.ps1):**
```powershell
# Test 1: Tool Discovery
Write-Host "Test 1: Tool Discovery"
docker exec -i litellm_mcp python -c "from mcp_server import list_tools; print(len(list_tools()))"

# Test 2: Add Model
Write-Host "Test 2: Add Model"
$result = docker exec -i litellm_mcp python -c @"
from mcp_server import MCPServer
server = MCPServer()
result = server.call_tool('add_model', {
    'model_name': 'test-gpt4',
    'provider': 'openai',
    'api_key': '$env:OPENAI_API_KEY',
    'rpm': 50
})
print(result)
"@

# Test 3: List Models
Write-Host "Test 3: List Models"
docker exec -i litellm_mcp python -c "..."

# Test 4: Remove Model
Write-Host "Test 4: Remove Model"
# ... etc
```

#### Day 5: Documentation
**Documents to Create:**

**1. MCP_USER_GUIDE.md:**
- Overview of available tools
- Parameter reference for each tool
- Example workflows with AI prompts
- Troubleshooting common issues
- Safety best practices

**2. MCP_DEVELOPER_GUIDE.md:**
- Architecture overview
- Adding new tools (step-by-step)
- Database schema documentation
- API endpoint mapping
- Testing procedures

**3. MCP_DEPLOYMENT_GUIDE.md:**
- Docker setup instructions
- Environment variable configuration
- VSCode integration setup
- Claude Desktop integration
- Monitoring and logs

#### Day 6: Performance & Security Review
**Tasks:**
1. Profile database queries (optimize slow operations)
2. Test connection pooling under load
3. Review audit logging completeness
4. Test backup/restore procedures
5. Validate API key security (no leaks in logs)

**Performance Targets:**
- Tool execution: <500ms (p95)
- Database queries: <100ms (p95)
- Config sync: <2 seconds (full YAML write)
- Concurrent tools: 10+ without blocking

#### Day 7: Final Testing & Production Readiness
**Tasks:**
1. End-to-end workflow test with real AI assistant
2. Verify all 15 tools working in production environment
3. Test failure scenarios (DB down, API unreachable)
4. Create monitoring dashboard (optional)
5. Final code review and cleanup

**Production Checklist:**
- [ ] All 15 tools implemented and tested
- [ ] Auto-sync running without errors
- [ ] Audit logging capturing all operations
- [ ] Backups created automatically
- [ ] Documentation complete
- [ ] VSCode integration working
- [ ] Claude Desktop integration working (optional)
- [ ] Error handling robust
- [ ] Security review passed
- [ ] Performance targets met

### Phase 5: Git & Deployment (Week 3, Day 1)

**Tasks:**
1. Commit MCP server code to Git repository
2. Update main README.md with MCP section
3. Push to GitHub (ArtemisAI/litellm-gateway)
4. Create release tag: `v1.0.0-mcp`
5. Deploy to production stack

**Git Commands:**
```powershell
# Stage MCP server files
git add mcp_server/
git add docker-compose.yaml
git add .vscode/mcp.json
git add MCP_USER_GUIDE.md MCP_DEVELOPER_GUIDE.md MCP_DEPLOYMENT_GUIDE.md

# Commit
git commit -m "Add custom MCP server for dynamic LiteLLM management

- Implements 15 management tools (models, keys, routing, monitoring)
- Auto-sync to YAML with timestamped backups
- Audit logging for all operations
- Docker deployment with stdio protocol
- VSCode and Claude Desktop integration"

# Push to GitHub
git push origin main

# Create release tag
git tag -a v1.0.0-mcp -m "MCP Server v1.0.0 - Full management capabilities"
git push origin v1.0.0-mcp
```

---

## Technical Specifications

### MCP Protocol Implementation

**stdio Transport:**
```python
import sys
import json

class StdioMCPServer:
    def __init__(self):
        self.tools = self._register_tools()
    
    async def run(self):
        while True:
            try:
                # Read JSON-RPC request from stdin
                line = sys.stdin.readline()
                if not line:
                    break
                
                request = json.loads(line)
                
                # Handle request
                if request['method'] == 'tools/list':
                    response = self._list_tools()
                elif request['method'] == 'tools/call':
                    response = await self._call_tool(
                        request['params']['name'],
                        request['params']['arguments']
                    )
                else:
                    response = {'error': 'Unknown method'}
                
                # Write JSON-RPC response to stdout
                sys.stdout.write(json.dumps(response) + '\n')
                sys.stdout.flush()
                
            except Exception as e:
                error_response = {
                    'error': str(e),
                    'type': type(e).__name__
                }
                sys.stdout.write(json.dumps(error_response) + '\n')
                sys.stdout.flush()
```

### Database Transaction Safety

**Example: add_model with rollback:**
```python
async def add_model(self, params: dict) -> dict:
    async with self.db.transaction() as tx:
        try:
            # 1. Validate API key (external call)
            health_check = await self.admin_api.test_key(params['api_key'])
            if not health_check['valid']:
                raise ValueError("Invalid API key")
            
            # 2. Insert model record
            deployment_id = await tx.insert(
                'LiteLLM_ProxyModelTable',
                {
                    'model_name': params['model_name'],
                    'litellm_params': json.dumps({
                        'model': params['model_name'],
                        'api_key': params['api_key'],
                        'rpm': params['rpm'],
                        'tpm': params['tpm']
                    })
                }
            )
            
            # 3. Add to routing pool
            await tx.insert(
                'LiteLLM_RoutingPool',
                {
                    'pool_name': params.get('pool_name', 'default-pool'),
                    'model_id': deployment_id
                }
            )
            
            # 4. Commit transaction
            await tx.commit()
            
            # 5. Trigger config sync (async, non-blocking)
            asyncio.create_task(self.config_sync.sync_to_yaml())
            
            return {
                'success': True,
                'deployment_id': deployment_id,
                'model_name': params['model_name'],
                'health_check': 'passed'
            }
            
        except Exception as e:
            # Rollback on any error
            await tx.rollback()
            raise
```

### Error Handling Strategy

**Error Categories:**
1. **Validation Errors:** Invalid parameters, missing required fields
2. **Authentication Errors:** Invalid LITELLM_MASTER_KEY, expired tokens
3. **Database Errors:** Connection failures, constraint violations
4. **API Errors:** Admin UI endpoint failures, timeouts
5. **System Errors:** Disk full, OOM, network issues

**Error Response Format:**
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
  "suggested_action": "Provide RPM between 1 and 10000"
}
```

### Logging Strategy

**Log Levels:**
- **DEBUG:** Tool parameters, database queries, API requests
- **INFO:** Tool execution start/complete, sync operations
- **WARNING:** External YAML modifications, slow queries (>1s)
- **ERROR:** Tool failures, database errors, API errors
- **CRITICAL:** System failures (DB down, Redis down)

**Log Format:**
```
2025-11-03T10:35:22.123Z [INFO] [add_model] Starting execution
  - model_name: gpt-4-turbo-new
  - provider: openai
  - executed_by: claude-desktop

2025-11-03T10:35:22.456Z [DEBUG] [add_model] Database query
  - query: INSERT INTO LiteLLM_ProxyModelTable...
  - duration_ms: 45

2025-11-03T10:35:22.789Z [INFO] [add_model] Execution complete
  - deployment_id: uuid-1234-5678
  - duration_ms: 666
  - success: true
```

---

## Success Metrics

### Week 1 Completion (Foundation):
- [ ] MCP server discovers 15+ tools in VSCode
- [ ] Can add model via MCP without YAML edit
- [ ] Can create virtual key via MCP
- [ ] Database integration working (read/write operations)
- [ ] Docker deployment functional

### Week 2 Completion (Full Implementation):
- [ ] All 15 core tools implemented
- [ ] Auto-sync running (60s interval)
- [ ] Audit logging capturing all operations
- [ ] VSCode integration working smoothly
- [ ] End-to-end test: "Add key → Use → Revoke" workflow passes

### Week 3 Completion (Production Ready):
- [ ] Documentation complete (3 guides)
- [ ] Security review passed (no key leaks, audit trail complete)
- [ ] Performance targets met (p95 <500ms)
- [ ] Committed to Git and pushed to GitHub
- [ ] Production deployment successful

---

## Risk Mitigation

### Risk 1: Database Schema Changes
**Mitigation:** Document schema in `schema/database_schema.md`, version-check on startup

### Risk 2: YAML Conflicts
**Mitigation:** Automatic backups before every sync, conflict detection with warnings

### Risk 3: API Key Exposure
**Mitigation:** Never log full keys (only show `sk-...xyz`), audit log review

### Risk 4: Performance Degradation
**Mitigation:** Connection pooling, query optimization, async operations

### Risk 5: Docker stdio Issues
**Mitigation:** Test `docker exec -i` extensively, fallback to HTTP transport if needed

---

## Future Enhancements (Post-v1.0)

### Phase 2 Features:
1. **Prometheus Metrics Export:** Expose tool usage metrics
2. **Web UI Dashboard:** Visual interface for MCP operations
3. **Slack/Discord Integration:** ChatOps for gateway management
4. **Advanced Routing:** A/B testing, canary deployments
5. **Cost Optimization:** Auto-scaling models based on demand

---

**Status:** Ready for Implementation ✅  
**Approved:** All design decisions confirmed  
**Timeline:** 2-3 weeks  
**Next Step:** Create `mcp_server/` directory and begin Phase 1, Day 1 tasks
