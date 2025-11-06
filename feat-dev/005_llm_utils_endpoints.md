# Tool: LLM Utils

**Description:** This tool provides a set of utility functions to interact with the LiteLLM API. It allows you to count tokens, get a list of supported OpenAI parameters, and transform requests.

**Functions:**

- `count_tokens(request)`: Counts the number of tokens in a given request. This function uses the `/utils/token_counter` endpoint.
- `get_supported_openai_params(model)`: Retrieves a list of supported OpenAI parameters for a given model. This function uses the `/utils/supported_openai_params` endpoint.
- `transform_request(request)`: Transforms a request to be compatible with the LiteLLM API. This function uses the `/utils/transform_request` endpoint.

**API Endpoints:**

- **POST /utils/token_counter**: Counts the number of tokens in a given request.
- **GET /utils/supported_openai_params**: Retrieves a list of supported OpenAI parameters for a given model.
- **POST /utils/transform_request**: Transforms a request to be compatible with the LiteLLM API.