# Tool: Chat Completions

**Description:** This tool provides a set of functions to interact with the chat completions endpoints of the LiteLLM API. It allows you to create a chat completion, which is the primary way to interact with the language models.

**Functions:**

- `create_chat_completion(model, messages, **kwargs)`: Creates a chat completion. This function uses the `/chat/completions`, `/v1/chat/completions`, `/openai/deployments/{model}/chat/completions`, and `/engines/{model}/chat/completions` endpoints.

**API Endpoints:**

- **POST /chat/completions**: Creates a chat completion.
- **POST /v1/chat/completions**: Creates a chat completion.
- **POST /openai/deployments/{model}/chat/completions**: Creates a chat completion for a specific model deployment.
- **POST /engines/{model}/chat/completions**: Creates a chat completion for a specific model engine.