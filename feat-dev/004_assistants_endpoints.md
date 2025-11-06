# Tool: Assistants

**Description:** This tool provides a set of functions to interact with the assistants' endpoints of the LiteLLM API. It allows you to create, manage, and interact with assistants, which are high-level agents that can be configured to perform a variety of tasks.

**Functions:**

- `get_assistants()`: Retrieves a list of all available assistants. This function uses the `/assistants` and `/v1/assistants` endpoints.
- `create_assistant()`: Creates a new assistant. This function uses the `/assistants` and `/v1/assistants` endpoints.
- `delete_assistant(assistant_id)`: Deletes a specific assistant. This function uses the `/assistants/{assistant_id}` and `/v1/assistants/{assistant_id}` endpoints.
- `create_thread()`: Creates a new thread. This function uses the `/threads` and `/v1/threads` endpoints.
- `get_thread(thread_id)`: Retrieves a specific thread. This function uses the `/threads/{thread_id}` and `/v1/threads/{thread_id}` endpoints.
- `add_message(thread_id, message)`: Adds a message to a specific thread. This function uses the `/threads/{thread_id}/messages` and `/v1/threads/{thread_id}/messages` endpoints.
- `get_messages(thread_id)`: Retrieves all messages from a specific thread. This function uses the `/threads/{thread_id}/messages` and `/v1/threads/{thread_id}/messages` endpoints.
- `run_thread(thread_id)`: Runs a specific thread. This function uses the `/threads/{thread_id}/runs` and `/v1/threads/{thread_id}/runs` endpoints.

**API Endpoints:**

- **GET /assistants**: Retrieves a list of all available assistants.
- **POST /assistants**: Creates a new assistant.
- **GET /v1/assistants**: Retrieves a list of all available assistants.
- **POST /v1/assistants**: Creates a new assistant.
- **DELETE /assistants/{assistant_id}**: Deletes a specific assistant.
- **DELETE /v1/assistants/{assistant_id}**: Deletes a specific assistant.
- **POST /threads**: Creates a new thread.
- **POST /v1/threads**: Creates a new thread.
- **GET /threads/{thread_id}**: Retrieves a specific thread.
- **GET /v1/threads/{thread_id}**: Retrieves a specific thread.
- **POST /threads/{thread_id}/messages**: Adds a message to a specific thread.
- **GET /threads/{thread_id}/messages**: Retrieves all messages from a specific thread.
- **POST /v1/threads/{thread_id}/messages**: Adds a message to a specific thread.
- **GET /v1/threads/{thread_id}/messages**: Retrieves all messages from a specific thread.
- **POST /threads/{thread_id}/runs**: Runs a specific thread.
- **POST /v1/threads/{thread_id}/runs**: Runs a specific thread.