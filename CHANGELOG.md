# Changelog# Changelog



All notable changes to this project will be documented in this file.All notable changes to this project will be documented in this file.



The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),

and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).



## [1.0.0] - 2025-11-07## [1.0.0] - 2025-11-07



### Added### Added

- **Complete TypeScript rewrite** of the LiteLLM MCP Server for improved performance and type safety- **Complete TypeScript rewrite** of the LiteLLM MCP Server for improved performance and type safety

- **4 MCP tools** for LiteLLM management:- **4 MCP tools** for LiteLLM management:

  - `list_models` - List available models  - `mcp_litellm-manag_list_models` - List available models

  - `get_model_info` - Get detailed model information  - `mcp_litellm-manag_get_model_info` - Get detailed model information

  - `create_virtual_key` - Create virtual API keys  - `mcp_litellm-manag_create_virtual_key` - Create virtual API keys

  - `get_spend` - Get user spend information  - `mcp_litellm-manag_get_spend` - Get user spend information

- **Docker deployment** option for production environments- **Docker deployment** option for production environments

- **npm package** distribution for easy installation at https://www.npmjs.com/package/litellm-mcp- **npm package** distribution for easy installation

- **Comprehensive documentation** including SECURITY.md, deployment guides and testing plans- **Comprehensive documentation** including deployment guides and testing plans

- **Environment-based configuration** for secure credential management- **Environment-based configuration** for secure credential management

- **Global executable** via npm: `npm install -g litellm-mcp`

- **GitHub Sponsors** support with multiple sponsorship options### Changed

- **Migrated from Python to TypeScript** for 40x faster development iteration

### Changed- **Updated deployment strategy** with npm for development, Docker for production

- **Migrated from Python to TypeScript** for 40x faster development iteration- **Improved error handling** with proper TypeScript types

- **Updated deployment strategy** with npm for development, Docker for production- **Enhanced security** with environment variable validation

- **Improved error handling** with proper TypeScript types

- **Enhanced security** with environment variable validation### Removed

- **npm package name** finalized as `litellm-mcp` (short and memorable)- **Python implementation** (`mcp_server/` directory)

- **Legacy dependencies** (httpx, pydantic, psycopg2, redis)

### Removed- **Database requirements** for simplified MCP server deployment

- **Python implementation** (`mcp_server/` directory)

- **Legacy dependencies** (httpx, pydantic, psycopg2, redis)### Technical Details

- **Database requirements** for simplified MCP server deployment- **Runtime**: Node.js 18+

- **Unnecessary files** from npm package via `.npmignore`- **Type Safety**: Full TypeScript with strict mode

- **Dependencies**: @modelcontextprotocol/sdk, axios

### Security- **Build**: Automated TypeScript compilation

- Comprehensive security policy in SECURITY.md- **Distribution**: npm registry with executable binary
- Vulnerability reporting procedures
- API key management guidelines
- Network security best practices

### Technical Details
- **Runtime**: Node.js 18+
- **Type Safety**: Full TypeScript with strict mode
- **Dependencies**: @modelcontextprotocol/sdk, axios
- **Build**: Automated TypeScript compilation
- **Distribution**: npm registry with executable binary
- **Package Size**: 8.5 KB (lightweight)
