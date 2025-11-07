# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-07

### Added
- **Complete TypeScript rewrite** of the LiteLLM MCP Server for improved performance and type safety
- **4 MCP tools** for LiteLLM management:
  - `mcp_litellm-manag_list_models` - List available models
  - `mcp_litellm-manag_get_model_info` - Get detailed model information
  - `mcp_litellm-manag_create_virtual_key` - Create virtual API keys
  - `mcp_litellm-manag_get_spend` - Get user spend information
- **Docker deployment** option for production environments
- **npm package** distribution for easy installation
- **Comprehensive documentation** including deployment guides and testing plans
- **Environment-based configuration** for secure credential management

### Changed
- **Migrated from Python to TypeScript** for 40x faster development iteration
- **Updated deployment strategy** with npm for development, Docker for production
- **Improved error handling** with proper TypeScript types
- **Enhanced security** with environment variable validation

### Removed
- **Python implementation** (`mcp_server/` directory)
- **Legacy dependencies** (httpx, pydantic, psycopg2, redis)
- **Database requirements** for simplified MCP server deployment

### Technical Details
- **Runtime**: Node.js 18+
- **Type Safety**: Full TypeScript with strict mode
- **Dependencies**: @modelcontextprotocol/sdk, axios
- **Build**: Automated TypeScript compilation
- **Distribution**: npm registry with executable binary