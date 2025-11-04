# Data Model Specification

**Status**: Completed

This document details the structure of the key data entities managed by the LiteLLM MCP server. These models are primarily stored in and retrieved from the LiteLLM PostgreSQL database.

---

## 1. Model Deployment

Represents a specific LLM endpoint available to the gateway. This corresponds to entries in the `LiteLLM_ProxyModelTable`.

| Field | Type | Description | Example |
|---|---|---|---|
| `deployment_id` | UUID | Primary key, uniquely identifying the deployment. | `a1b2c3d4-e5f6-7890-1234-567890abcdef` |
| `model_name` | String | The primary identifier for the model used in requests. | `gpt-4-turbo` |
| `provider` | String | The LLM provider. | `openai`, `azure`, `gemini` |
| `api_key` | String | The API key for the provider. Stored securely. | `sk-...` or `${env:VAR}` |
| `api_base` | String (Optional) | The base URL for the API, used for self-hosted or custom endpoints. | `https://my-proxy.com/v1` |
| `rpm` | Integer | Rate limit in Requests Per Minute. | `100` |
| `tpm` | Integer | Rate limit in Tokens Per Minute. | `100000` |
| `max_parallel` | Integer | Maximum number of concurrent requests allowed for this deployment. | `8` |
| `pool_name` | String (Optional) | The routing pool this deployment belongs to. | `gpt-4-pool` |
| `timeout` | Integer | Request timeout in seconds. | `600` |

---

## 2. Virtual API Key

Represents a client's credential for accessing the gateway. This corresponds to entries in the `LiteLLM_VerificationToken` table.

| Field | Type | Description | Example |
|---|---|---|---|
| `key_id` | UUID | Primary key, uniquely identifying the virtual key. | `k1b2c3d4-e5f6-7890-1234-567890abcdef` |
| `key` | String | The plaintext API key. **Note: Only shown on creation.** | `sk-litellm-xyz...` |
| `hashed_key` | String | The securely hashed version of the key stored in the database. | `bcrypt_hash_string` |
| `key_name` | String | A human-readable name for the key. | `client-acme-prod` |
| `budget_usd` | Float | The spending budget allocated to this key. | `500.00` |
| `budget_duration` | String | The period over which the budget is measured. | `monthly`, `daily`, `total` |
| `allowed_models` | Array[String] | A list of `model_name` values this key is permitted to use. | `["gpt-4", "gpt-3.5-turbo"]` |
| `rpm_limit` | Integer | Per-key rate limit in Requests Per Minute. | `50` |
| `tpm_limit` | Integer | Per-key rate limit in Tokens Per Minute. | `50000` |
| `expires_at` | DateTime (Optional) | A specific timestamp when the key will expire. | `2025-12-31T23:59:59Z` |
| `metadata` | JSON (Optional) | A flexible field for storing custom tags. | `{"client_id": "c_123"}` |
| `status` | String | The operational status of the key. | `active`, `revoked`, `expired` |

---

## 3. Audit Log Entry

An immutable record of a management operation performed by the MCP server. Stored in the `mcp_audit_log` table.

| Field | Type | Description | Example |
|---|---|---|---|
| `id` | UUID | Primary key for the log entry. | `log-abc...` |
| `timestamp` | DateTime | The exact time the operation was executed. | `2025-11-04T10:30:00Z` |
| `tool_name` | String | The name of the tool that was called. | `add_model` |
| `parameters` | JSON | The parameters provided to the tool. | `{"model_name": "gpt-4o"}` |
| `executed_by` | String | An identifier for the AI assistant that initiated the call. | `claude-desktop` |
| `result` | JSON | The result returned by the tool execution. | `{"success": true}` |
| `success` | Boolean | Whether the operation completed successfully. | `true` |
| `duration_ms` | Integer | The total execution time of the tool in milliseconds. | `150` |
| `error_message` | String (Optional) | The error message if the operation failed. | `Invalid API key` |

---

## 4. Routing & Fallback

Defines the logic for how requests are distributed and how failures are handled.

### 4.1 Routing Strategy

| Field | Type | Description | Example |
|---|---|---|---|
| `strategy` | String | The load balancing algorithm to use. | `least-busy`, `cost-based` |
| `apply_to_pool` | String (Optional) | The specific model pool this strategy applies to. Global if null. | `gpt-4-pool` |

### 4.2 Fallback Chain

| Field | Type | Description | Example |
|---|---|---|---|
| `chain_id` | UUID | Primary key for the fallback chain. | `chain-abc...` |
| `primary_model` | String | The model that triggers the fallback on failure. | `gpt-4-turbo` |
| `fallback_models` | Array[String] | An ordered list of models to try in sequence. | `["gpt-4", "claude-3-opus"]` |
| `fallback_on_errors` | Array[String] | The specific error types that trigger this fallback. | `["rate_limit", "5xx"]` |

---
