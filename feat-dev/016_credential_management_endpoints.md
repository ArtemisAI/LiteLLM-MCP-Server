# Tool: Credential Management

**Description:** This tool provides a set of functions to interact with the credential management endpoints of the LiteLLM API. It allows you to create, retrieve, update, and delete credentials.

**Functions:**

- `get_credentials()`: Retrieves a list of all available credentials. This function uses the `/credentials` endpoint.
- `create_credential(credential_name, credential_info, **kwargs)`: Creates a new credential. This function uses the `/credentials` endpoint.
- `get_credential_by_model(model_id)`: Retrieves a credential by model ID. This function uses the `/credentials/by_model/{model_id}` endpoint.
- `get_credential_by_name(credential_name)`: Retrieves a credential by name. This function uses the `/credentials/by_name/{credential_name}` endpoint.
- `delete_credential(credential_name)`: Deletes a specific credential. This function uses the `/credentials/{credential_name}` endpoint.
- `update_credential(credential_name, credential_info, **kwargs)`: Updates a specific credential. This function uses the `/credentials/{credential_name}` endpoint.

**API Endpoints:**

- **GET /credentials**: Retrieves a list of all available credentials.
- **POST /credentials**: Creates a new credential.
- **GET /credentials/by_model/{model_id}**: Retrieves a credential by model ID.
- **GET /credentials/by_name/{credential_name}**: Retrieves a credential by name.
- **DELETE /credentials/{credential_name}**: Deletes a specific credential.
- **PATCH /credentials/{credential_name}**: Updates a specific credential.