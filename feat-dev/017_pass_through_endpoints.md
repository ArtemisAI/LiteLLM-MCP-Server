# Tool: Pass-Through

**Description:** This tool provides a set of functions to interact with the pass-through endpoints of the LiteLLM API. It allows you to make direct requests to the underlying models.

**Functions:**

- `gemini_proxy_route(endpoint, **kwargs)`: Makes a request to the Gemini pass-through endpoint. This function uses the `/gemini/{endpoint}` endpoint.
- `cohere_proxy_route(endpoint, **kwargs)`: Makes a request to the Cohere pass-through endpoint. This function uses the `/cohere/{endpoint}` endpoint.
- `vllm_proxy_route(endpoint, **kwargs)`: Makes a request to the VLLM pass-through endpoint. This function uses the `/vllm/{endpoint}` endpoint.
- `mistral_proxy_route(endpoint, **kwargs)`: Makes a request to the Mistral pass-through endpoint. This function uses the `/mistral/{endpoint}` endpoint.
- `anthropic_proxy_route(endpoint, **kwargs)`: Makes a request to the Anthropic pass-through endpoint. This function uses the `/anthropic/{endpoint}` endpoint.
- `bedrock_proxy_route(endpoint, **kwargs)`: Makes a request to the Bedrock pass-through endpoint. This function uses the `/bedrock/{endpoint}` endpoint.
- `assemblyai_proxy_route(endpoint, **kwargs)`: Makes a request to the AssemblyAI pass-through endpoint. This function uses the `/eu.assemblyai/{endpoint}` and `/assemblyai/{endpoint}` endpoints.
- `azure_proxy_route(endpoint, **kwargs)`: Makes a request to the Azure pass-through endpoint. This function uses the `/azure/{endpoint}` endpoint.
- `vertex_proxy_route(endpoint, **kwargs)`: Makes a request to the Vertex AI pass-through endpoint. This function uses the `/vertex_ai/discovery/{endpoint}` and `/vertex_ai/{endpoint}` endpoints.
- `openai_proxy_route(endpoint, **kwargs)`: Makes a request to the OpenAI pass-through endpoint. This function uses the `/openai/{endpoint}` endpoint.
- `langfuse_proxy_route(endpoint, **kwargs)`: Makes a request to the Langfuse pass-through endpoint. This function uses the `/langfuse/{endpoint}` endpoint.

**API Endpoints:**

- **DELETE, PATCH, POST, GET, PUT /gemini/{endpoint}**: Makes a request to the Gemini pass-through endpoint.
- **DELETE, PATCH, POST, GET, PUT /cohere/{endpoint}**: Makes a request to the Cohere pass-through endpoint.
- **DELETE, PATCH, POST, GET, PUT /vllm/{endpoint}**: Makes a request to the VLLM pass-through endpoint.
- **DELETE, PATCH, POST, GET, PUT /mistral/{endpoint}**: Makes a request to the Mistral pass-through endpoint.
- **DELETE, PATCH, POST, GET, PUT /anthropic/{endpoint}**: Makes a request to the Anthropic pass-through endpoint.
- **DELETE, PATCH, POST, GET, PUT /bedrock/{endpoint}**: Makes a request to the Bedrock pass-through endpoint.
- **DELETE, PATCH, POST, GET, PUT /eu.assemblyai/{endpoint}**: Makes a request to the AssemblyAI pass-through endpoint.
- **DELETE, PATCH, POST, GET, PUT /assemblyai/{endpoint}**: Makes a request to the AssemblyAI pass-through endpoint.
- **DELETE, PATCH, POST, GET, PUT /azure/{endpoint}**: Makes a request to the Azure pass-through endpoint.
- **DELETE, PATCH, POST, GET, PUT /vertex_ai/discovery/{endpoint}**: Makes a request to the Vertex AI pass-through endpoint.
- **DELETE, PATCH, POST, GET, PUT /vertex_ai/{endpoint}**: Makes a request to the Vertex AI pass-through endpoint.
- **DELETE, PATCH, POST, GET, PUT /openai/{endpoint}**: Makes a request to the OpenAI pass-through endpoint.
- **DELETE, PATCH, POST, GET, PUT /langfuse/{endpoint}**: Makes a request to the Langfuse pass-through endpoint.