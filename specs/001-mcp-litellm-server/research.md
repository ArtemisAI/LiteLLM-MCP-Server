# Research & Decisions for MCP Server

**Status**: Completed

This document records the technology and architectural decisions for the LiteLLM MCP Management Server. The feature specification did not contain any `NEEDS CLARIFICATION` markers, as the foundational project documentation (`LITELLM_MCP_GUIDE.md` and `mcp_plan.md`) provided a comprehensive technical blueprint.

This research phase serves to formally adopt and ratify those established decisions.

---

## Decision 1: Core Technology Stack

- **Decision**:
  - **Language**: Python 3.11+
  - **Primary Libraries**:
    - `mcp>=0.9.0`: For handling the stdio-based MCP protocol.
    - `psycopg2-binary>=2.9.9`: For direct communication with the LiteLLM PostgreSQL database.
    - `httpx>=0.25.0`: For making REST API calls to the LiteLLM Admin UI.
    - `pyyaml>=6.0.1`: For serializing database configurations into the `litellm_config.yaml` file.
    - `pydantic>=2.5.0`: For data validation and settings management.

- **Rationale**:
  - Python is the de-facto language of the AI/ML ecosystem and is consistent with LiteLLM itself.
  - The selected libraries are modern, async-first (where applicable), and directly address the project's core needs for database access, API communication, and protocol handling.
  - This stack was pre-defined in the project's implementation plan and is confirmed to be appropriate.

- **Alternatives Considered**:
  - **Node.js/TypeScript**: A viable alternative, but Python provides a more direct path for integration with other data science and ML tools.
  - **Go**: Offers better performance for high-concurrency services, but the management nature of this server does not require that level of performance, and Python offers faster development velocity.

---

## Decision 2: Deployment Architecture

- **Decision**: The server will be deployed as a **standalone Docker container** managed within the main `docker-compose.yaml` file of the LiteLLM stack.

- **Rationale**:
  - **Isolation**: Encapsulates all dependencies and ensures a consistent runtime environment.
  - **Integration**: As a Docker container on the same network, it can easily and securely communicate with the other services (`litellm_db`, `llm` admin UI, `litellm_redis`).
  - **Consistency**: Matches the existing deployment strategy of the LiteLLM project.
  - **STDIO Interface**: `docker exec -i` provides a clean mechanism for the MCP client to communicate with the server process running inside the container.

- **Alternatives Considered**:
  - **Bare-metal process**: Running the Python script directly on the host would create dependency management issues and complicate networking.
  - **HTTP Server**: Exposing an HTTP API instead of using the MCP stdio protocol would be a valid architectural choice, but the project requirements explicitly call for an MCP server to be used by AI assistants.

---

## Decision 3: Configuration Persistence Strategy

- **Decision**: A **"Database as Source of Truth with Auto-Sync to YAML"** strategy will be used.
  1. All tool operations write directly to the PostgreSQL database for immediate effect.
  2. A background worker process automatically and periodically syncs the state from the database to a persistent `litellm_config.yaml` file.
  3. Automatic, timestamped backups of the YAML file are created before each sync to prevent data loss.

- **Rationale**:
  - **Durability & Immediacy**: Combines the immediate consistency of database transactions with the durability and Git-trackable nature of a YAML file.
  - **Resilience**: The system can be fully restored from either the database or the YAML backups.
  - **Operational Transparency**: The YAML file provides a human-readable snapshot of the system's configuration.

- **Alternatives Considered**:
  - **YAML-first**: Writing changes to YAML and having LiteLLM reload it. This is slower, less transactional, and not all LiteLLM configurations can be dynamically reloaded this way.
  - **Database-only**: This would work but makes the configuration opaque and harder to inspect or version control externally.

---
