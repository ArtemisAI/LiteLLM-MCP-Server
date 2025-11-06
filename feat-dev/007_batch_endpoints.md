# Tool: Batch

**Description:** This tool provides a set of functions to interact with the batch endpoints of the LiteLLM API. It allows you to create, manage, and retrieve batches of API requests for asynchronous processing.

**Functions:**

- `create_batch(input_file_id, endpoint, completion_window)`: Creates a new batch. This function uses the `/batches`, `/v1/batches`, and `/{provider}/v1/batches` endpoints.
- `list_batches()`: Retrieves a list of all available batches. This function uses the `/batches`, `/v1/batches`, and `/{provider}/v1/batches` endpoints.
- `retrieve_batch(batch_id)`: Retrieves a specific batch. This function uses the `/batches/{batch_id}`, `/v1/batches/{batch_id}`, and `/{provider}/v1/batches/{batch_id}` endpoints.
- `cancel_batch(batch_id)`: Cancels a specific batch. This function uses the `/batches/{batch_id}/cancel`, `/v1/batches/{batch_id}/cancel`, and `/{provider}/v1/batches/{batch_id}/cancel` endpoints.

**API Endpoints:**

- **POST /batches**: Creates a new batch.
- **GET /batches**: Retrieves a list of all available batches.
- **POST /v1/batches**: Creates a new batch.
- **GET /v1/batches**: Retrieves a list of all available batches.
- **POST /{provider}/v1/batches**: Creates a new batch for a specific provider.
- **GET /{provider}/v1/batches**: Retrieves a list of all available batches for a specific provider.
- **GET /batches/{batch_id}**: Retrieves a specific batch.
- **GET /v1/batches/{batch_id}**: Retrieves a specific batch.
- **GET /{provider}/v1/batches/{batch_id}**: Retrieves a specific batch for a specific provider.
- **POST /batches/{batch_id}/cancel**: Cancels a specific batch.
- **POST /v1/batches/{batch_id}/cancel**: Cancels a specific batch.
- **POST /{provider}/v1/batches/{batch_id}/cancel**: Cancels a specific batch for a specific provider.