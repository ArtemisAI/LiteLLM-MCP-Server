# Tool: MCP

**Description:** This tool provides a set of functions to interact with the MCP endpoints of the LiteLLM API. It allows you to manage and interact with MCP servers, tools, and access groups.

**Functions:**

- `get_mcp_tools()`: Retrieves a list of all available MCP tools.
- `get_mcp_access_groups()`: Retrieves a list of all available MCP access groups.
- `health_check_mcp_server(server_id)`: Performs a health check on a specific MCP server.
- `health_check_all_mcp_servers()`: Performs a health check on all accessible MCP servers.
- `fetch_all_mcp_servers()`: Retrieves a list of all MCP servers.
- `add_mcp_server(server_name, **kwargs)`: Adds a new MCP server.
- `edit_mcp_server(server_id, **kwargs)`: Edits a specific MCP server.
- `fetch_mcp_server(server_id)`: Retrieves a specific MCP server.
- `remove_mcp_server(server_id)`: Removes a specific MCP server.
- `authorize(client_id, redirect_uri, **kwargs)`: Authorizes a client.
- `token_endpoint(grant_type, client_id, **kwargs)`: Exchanges an authorization code for a token.
- `register_client()`: Registers a new client.
- `list_tool_rest_api()`: Retrieves a list of all available tools from the REST API.
- `call_tool_rest_api(tool_name, **kwargs)`: Calls a specific tool from the REST API.
- `test_connection(server_name, **kwargs)`: Tests the connection to a specific MCP server.
- `test_tools_list(server_name, **kwargs)`: Retrieves a list of all available tools from a specific MCP server.

**API Endpoints:**

- `/v1/mcp/tools`: GET
- `/v1/mcp/access_groups`: GET
- `/v1/mcp/server/{server_id}/health`: GET
- `/v1/mcp/server/health`: GET
- `/v1/mcp/server`: GET, POST, PUT
- `/v1/mcp/server/{server_id}`: GET, DELETE
- `/authorize`: GET
- `/{mcp_server_name}/authorize`: GET
- `/token`: POST
- `/{mcp_server_name}/token`: POST
- `/register`: POST
- `/{mcp_server_name}/register`: POST
- `/mcp-rest/tools/list`: GET
- `/mcp-rest/tools/call`: POST
- `/mcp-rest/test/connection`: POST
- `/mcp-rest/test/tools/list`: POST