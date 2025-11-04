# Feature Specification: MCP Server for LiteLLM Administration

**Feature Branch**: `001-mcp-litellm-server`  
**Created**: 2025-11-04  
**Status**: Draft  
**Input**: User description: "Please read @mcp_plan.md and @LITELLM_MCP.md for requirements of this project and write the specifications for this project to build a MCP server for administration of LiteLLM"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Dynamic Model Management (Priority: P1)

As an AI assistant, I need to add, remove, list, and update model deployments in the LiteLLM gateway in real-time, so that I can manage the available models without manual intervention or service downtime.

**Why this priority**: This is the core functionality of the server. Without it, the AI assistant cannot perform its primary task of managing the gateway's model infrastructure.

**Independent Test**: The system can be tested by instructing the AI to add a new model, verifying it appears in the active model list, and then removing it. This journey delivers immediate value by enabling dynamic configuration.

**Acceptance Scenarios**:

1. **Given** the gateway has 5 active models, **When** the AI assistant uses the `add_model` tool with valid parameters for a new model, **Then** the gateway's active model count becomes 6, and the new model is immediately available for routing requests.
2. **Given** a model deployment exists with an RPM of 100, **When** the AI assistant uses the `update_model_limits` tool to set the RPM to 200, **Then** the system reflects the new 200 RPM limit for that deployment within 5 seconds.
3. **Given** a specific model deployment ID, **When** the AI assistant uses the `remove_model` tool, **Then** the model is no longer listed as active and is removed from the routing pool.

---

### User Story 2 - Secure Client Access Control (Priority: P2)

As an AI assistant, I need to create, revoke, list, and manage virtual API keys with specific budgets and model permissions, so that I can securely control and monitor client access to the LLM gateway.

**Why this priority**: This is crucial for security, billing, and client management. It allows the AI to enforce usage policies and control costs.

**Independent Test**: The AI can be tasked to create a new key for a client, assign it a budget, and then revoke it. This demonstrates the full lifecycle of client access management.

**Acceptance Scenarios**:

1. **Given** a request to create a key for "client-x" with a $50 monthly budget, **When** the AI assistant uses the `create_virtual_key` tool, **Then** a new API key is generated and returned, and a corresponding budget is created in the system.
2. **Given** an active API key ID, **When** the AI assistant uses the `revoke_key` tool, **Then** any subsequent API calls using that key are rejected with an authentication error.
3. **Given** multiple keys exist, **When** the AI assistant uses the `list_keys` tool with `show_spend=true`, **Then** a list of all keys is returned, including their current spend and remaining budget.
4. **Given** an active API key with a current budget of $100 and a spend of $50, **When** the AI assistant uses the `update_key_budget` tool to set the new budget to $150 and `reset_spend=false`, **Then** the key's budget is updated to $150 and its spend remains $50.

---

### User Story 3 - Real-time Operational Oversight (Priority: P3)

As an AI assistant, I need to monitor system health, query spend analytics, and debug failed requests, and tail logs so that I can proactively maintain the reliability and cost-effectiveness of the LiteLLM service.

**Why this priority**: This enables the AI to act as a first-line support and operations engineer, identifying and diagnosing issues before they escalate.

**Independent Test**: The AI can be asked "Show me today's spend by model" or "Why did requests fail in the last hour?". A successful test provides a clear, actionable answer.

**Acceptance Scenarios**:

1. **Given** the system is running, **When** the AI assistant uses the `get_service_health` tool, **Then** it receives a status report ('healthy' or 'unhealthy') for the database, Redis, and Admin API.
2. **Given** multiple LiteLLM proxy instances are running, **When** the AI assistant uses the `get_proxy_health` tool, **Then** it receives the health status for each proxy instance.
3. **Given** there has been traffic for the day, **When** the AI assistant uses the `get_spend_dashboard` tool with `group_by='model'`, **Then** it receives a correct breakdown of cost per model.
4. **Given** a rate limit error occurred for a specific key, **When** the AI assistant uses the `debug_failed_requests` tool filtering by that key and error type, **Then** it receives the log entry for that specific failed request.
5. **Given** there are recent logs, **When** the AI assistant uses the `get_recent_logs` tool with a specified level, **Then** it receives a list of log entries matching the criteria.

---

### User Story 4 - Advanced Gateway Configuration (Priority: P4)

As an AI assistant, I need to modify routing strategies and manage configuration persistence (backups, restores), so that I can optimize traffic flow and ensure the system state is recoverable.

**Why this priority**: This provides advanced control, allowing the AI to fine-tune performance and recover from misconfigurations.

**Independent Test**: The AI can be instructed to change the routing strategy to 'cost-based', then restore a previous configuration from a backup. This validates the full configuration management loop.

**Acceptance Scenarios**:

1. **Given** the current routing strategy is 'least-busy', **When** the AI assistant uses the `update_routing_strategy` tool to set it to 'cost-based', **Then** the system immediately begins routing new requests based on cost.
2. **Given** a configuration change was just made, **When** the AI assistant uses the `sync_config_to_yaml` tool with `backup=true`, **Then** a timestamped backup of the previous configuration is created before the new state is written to `litellm_config.yaml`.
3. **Given** a valid backup file exists, **When** the AI assistant uses the `restore_config_backup` tool, **Then** the system's active configuration reverts to the state captured in that backup file.
4. **Given** recent configuration changes have been made to the YAML file, **When** the AI assistant uses the `reload_config_from_yaml` tool, **Then** the database configuration is updated to reflect the YAML file's content.
5. **Given** multiple configuration backups exist, **When** the AI assistant uses the `list_config_backups` tool, **Then** it receives a list of all available backup files with their metadata.

---

### User Story 5 - Flexible Routing and Fallback Configuration (Priority: P3)

As an AI assistant, I need to define and manage fallback sequences for model failures, so that I can ensure high availability and graceful degradation of the LLM service.

**Why this priority**: This directly impacts the reliability and resilience of the LLM service, ensuring continuous operation even when primary models fail.

**Independent Test**: The AI can be tasked to add a fallback chain, simulate a primary model failure, and verify that the fallback model is used. Then, the chain can be removed.

**Acceptance Scenarios**:

1. **Given** a primary model and a list of fallback models, **When** the AI assistant uses the `add_fallback_chain` tool, **Then** a new fallback chain is created and active in the system, and requests to the primary model will automatically route to fallbacks on specified errors.
2. **Given** an existing fallback chain ID, **When** the AI assistant uses the `remove_fallback_chain` tool, **Then** the specified fallback chain is removed from the system and no longer active.
3. **Given** multiple fallback chains are configured, **When** the AI assistant uses the `list_fallback_chains` tool, **Then** it receives a list of all active fallback chains, including their primary and fallback models.

---

### User Story 6 - Comprehensive Audit and Configuration Management (Priority: P2)

As an AI assistant, I need to access a comprehensive audit log of all operations and manage advanced configuration settings, so that I can ensure compliance, accountability, and system integrity.

**Why this priority**: Auditability is critical for security, compliance, and understanding system changes. Configuration management tools ensure the system can be effectively maintained and recovered.

**Independent Test**: The AI can perform several management actions, then query the audit log to verify all actions are recorded correctly.

**Acceptance Scenarios**:

1. **Given** multiple management operations have been performed, **When** the AI assistant uses the `get_audit_log` tool, **Then** it receives a chronological list of all recorded operations, including tool name, parameters, and results.

**Why this priority**: This provides advanced control, allowing the AI to fine-tune performance and recover from misconfigurations.

**Independent Test**: The AI can be instructed to change the routing strategy to 'cost-based', then restore a previous configuration from a backup. This validates the full configuration management loop.

**Acceptance Scenarios**:

1. **Given** the current routing strategy is 'least-busy', **When** the AI assistant uses the `update_routing_strategy` tool to set it to 'cost-based', **Then** the system immediately begins routing new requests based on cost.
2. **Given** a configuration change was just made, **When** the AI assistant uses the `sync_config_to_yaml` tool with `backup=true`, **Then** a timestamped backup of the previous configuration is created before the new state is written to `litellm_config.yaml`.
3. **Given** a valid backup file exists, **When** the AI assistant uses the `restore_config_backup` tool, **Then** the system's active configuration reverts to the state captured in that backup file.

### Edge Cases

- **What happens when** the database connection is lost? All tools that require DB access MUST fail gracefully with a "Database Unreachable" error.
- **How does the system handle** an invalid `LITELLM_MASTER_KEY`? All tools that call the Admin API MUST fail with a clear "Authentication Error".
- **What happens if** the `litellm_config.yaml` is modified externally? The auto-sync worker MUST detect the change and log a warning before overwriting it (unless `force` is used).
- **How does the system handle** a request to add a model with an invalid provider API key? The `add_model` tool MUST validate the key and fail with a "Invalid API Key" error, without adding the model to the database.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide tools for an AI assistant to perform full lifecycle management of model deployments (add, remove, list, update limits).
- **FR-002**: The system MUST provide tools for an AI assistant to perform full lifecycle management of virtual API keys (create, revoke, list, update budget).
- **FR-003**: The system MUST provide tools for an AI assistant to configure gateway routing, including load balancing strategies and model fallback chains.
- **FR-004**: The system MUST provide tools for an AI assistant to monitor the real-time health of the proxy and its critical dependencies (Database, Redis, Admin API).
- **FR-005**: The system MUST provide tools for an AI assistant to query and analyze spend/usage data and to retrieve and filter logs for debugging.
- **FR-006**: The system MUST provide tools for an AI assistant to manage the system's configuration, including triggering manual syncs, listing backups, and restoring from a backup.
- **FR-007**: The system MUST maintain a comprehensive and immutable audit log of all management operations performed by the AI assistant.
- **FR-008**: All configuration changes made via tools (e.g., adding a model) MUST persist across server restarts.
- **FR-009**: The system MUST operate without requiring interactive confirmation prompts from the user for any tool execution.

### Key Entities *(include if feature involves data)*

- **Model Deployment**: Represents a specific LLM endpoint available to the gateway. Key attributes include a unique deployment ID, `model_name`, `provider`, `api_key`, rate limits (RPM/TPM), and its association with a routing `pool_name`.
- **Virtual API Key**: Represents a client's credential for accessing the gateway. Key attributes include a unique `key_id`, a human-readable `key_name`, the hashed key, `budget_usd`, `budget_duration`, a list of `allowed_models`, and operational status (`active`, `revoked`).
- **Routing Strategy**: Defines the algorithm used to distribute requests across multiple deployments in a pool (e.g., `least-busy`, `cost-based`, `latency-based`).
- **Audit Log Entry**: An immutable record of a management operation. Key attributes include `tool_name`, the `parameters` used, the `executed_by` identifier, a `timestamp`, the `result`, and a `success` status.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An AI assistant can provision a new, fully functional model deployment into the gateway's routing pool in under 10 seconds, without requiring any manual configuration changes or service restarts.
- **SC-002**: An AI assistant can create a new virtual API key with a monthly budget and subsequently revoke it, with the revocation taking effect and blocking requests in under 5 seconds.
- **SC-003**: The system can handle at least 10 concurrent management tool executions without blocking, deadlocking, or failing.
- **SC-004**: 100% of management operations (successful or failed) are recorded in the audit log within 1 second of completion.
- **SC-005**: A full configuration backup is automatically created before the `litellm_config.yaml` file is overwritten by the sync process, with zero data loss.
- **SC-006**: An AI assistant can successfully query the total spend for the current day, grouped by model, and receive an accurate, aggregated breakdown from the database.