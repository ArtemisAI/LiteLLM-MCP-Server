# Tool: Google GenAI

**Description:** This tool provides a set of functions to interact with the Google GenAI endpoints of the LiteLLM API. It allows you to generate content, stream content, and count tokens.

**Functions:**

- `generate_content(model_name, **kwargs)`: Generates content.
- `stream_generate_content(model_name, **kwargs)`: Streams generated content.
- `count_tokens(model_name, **kwargs)`: Counts the number of tokens in a given request.

**API Endpoints:**

- `/models/{model_name}:generateContent`: POST
- `/v1beta/models/{model_name}:generateContent`: POST
- `/models/{model_name}:streamGenerateContent`: POST
- `/v1beta/models/{model_name}:streamGenerateContent`: POST
- `/models/{model_name}:countTokens`: POST
- `/v1beta/models/{model_name}:countTokens`: POST