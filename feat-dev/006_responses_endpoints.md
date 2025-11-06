# Tool: Responses

**Description:** This tool provides a set of functions to interact with the responses endpoints of the LiteLLM API. It allows you to create, retrieve, and manage responses.

**Functions:**

- `create_response(model, input)`: Creates a new response. This function uses the `/openai/v1/responses`, `/responses`, and `/v1/responses` endpoints.
- `get_response(response_id)`: Retrieves a specific response. This function uses the `/openai/v1/responses/{response_id}`, `/responses/{response_id}`, and `/v1/responses/{response_id}` endpoints.
- `delete_response(response_id)`: Deletes a specific response. This function uses the `/openai/v1/responses/{response_id}`, `/responses/{response_id}`, and `/v1/responses/{response_id}` endpoints.
- `get_response_input_items(response_id)`: Retrieves the input items of a specific response. This function uses the `/openai/v1/responses/{response_id}/input_items`, `/responses/{response_id}/input_items`, and `/v1/responses/{response_id}/input_items` endpoints.
- `cancel_response(response_id)`: Cancels a specific response. This function uses the `/openai/v1/responses/{response_id}/cancel`, `/responses/{response_id}/cancel`, and `/v1/responses/{response_id}/cancel` endpoints.

**API Endpoints:**

- **POST /openai/v1/responses**: Creates a new response.
- **POST /responses**: Creates a new response.
- **POST /v1/responses**: Creates a new response.
- **GET /openai/v1/responses/{response_id}**: Retrieves a specific response.
- **DELETE /openai/v1/responses/{response_id}**: Deletes a specific response.
- **GET /responses/{response_id}**: Retrieves a specific response.
- **DELETE /responses/{response_id}**: Deletes a specific response.
- **GET /v1/responses/{response_id}**: Retrieves a specific response.
- **DELETE /v1/responses/{response_id}**: Deletes a specific response.
- **GET /openai/v1/responses/{response_id}/input_items**: Retrieves the input items of a specific response.
- **GET /responses/{response_id}/input_items**: Retrieves the input items of a specific response.
- **GET /v1/responses/{response_id}/input_items**: Retrieves the input items of a specific response.
- **POST /openai/v1/responses/{response_id}/cancel**: Cancels a specific response.
- **POST /responses/{response_id}/cancel**: Cancels a specific response.
- **POST /v1/responses/{response_id}/cancel**: Cancels a specific response.