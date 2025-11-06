# Tool: Search

**Description:** This tool provides a set of functions to interact with the search endpoints of the LiteLLM API. It allows you to perform web searches.

**Functions:**

- `search(query, **kwargs)`: Performs a web search. This function uses the `/search`, `/v1/search`, `/search/{search_tool_name}`, and `/v1/search/{search_tool_name}` endpoints.

**API Endpoints:**

- **POST /search**: Performs a web search.
- **POST /v1/search**: Performs a web search.
- **POST /search/{search_tool_name}**: Performs a web search with a specific search tool.
- **POST /v1/search/{search_tool_name}**: Performs a web search with a specific search tool.