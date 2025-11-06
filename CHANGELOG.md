# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-06

### Added
- Initial release of LiteLLM MCP Server
- Model management functionality (`list_models`, `get_model_info`)
- Virtual API key generation (`create_virtual_key`)
- User spend tracking (`get_spend`)
- Docker support for containerized deployment
- TypeScript implementation with full type safety
- Integration with Model Context Protocol (MCP) SDK
- VSCode configuration examples
- Comprehensive documentation (README, DEPLOYMENT, CONTRIBUTING)
- Security policy and guidelines
- MIT License

### Features
- List and inspect all available models in LiteLLM instance
- Create virtual API keys with custom aliases for rate limiting
- Monitor API usage and costs per user
- Seamless integration with Claude AI through MCP protocol
- Support for both Docker and local Node.js deployments

### Security
- Environment variable-based configuration for sensitive data
- Master key authentication with LiteLLM proxy
- No hardcoded credentials in codebase
- Secure stdio communication protocol

[1.0.0]: https://github.com/ArtemisAI/LiteLLM-MCP-Server/releases/tag/v1.0.0
