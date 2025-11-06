# Tool: Model Management

**Description:** This tool provides a set of functions to manage and retrieve information about the models available in the LiteLLM API. It allows you to list all available models, get detailed information about a specific model, and get information about model groups.

**Functions:**

- `list_models()`: Retrieves a list of all available models. This function uses the `/models` and `/v1/models` endpoints.
- `get_model_info(model_id)`: Retrieves detailed information about a specific model. This function uses the `/models/{model_id}` and `/v1/models/{model_id}` endpoints.
- `get_model_group_info(model_group)`: Retrieves information about a specific model group. This function uses the `/model/info`, `/v1/model/info`, and `/model_group/info` endpoints.

**API Endpoints:**

- **GET /models**: Retrieves a list of all available models.
- **GET /v1/models**: Retrieves a list of all available models.
- **GET /models/{model_id}**: Retrieves detailed information about a specific model.
- **GET /v1/models/{model_id}**: Retrieves detailed information about a specific model.
- **GET /model/info**: Provides more info about each model in `/models`, including `config.yaml` descriptions (except `api_key` and `api_base`).
- **GET /v1/model/info**: Provides more info about each model in `/models`, including `config.yaml` descriptions (except `api_key` and `api_base`).
- **GET /model_group/info**: Get information about all the deployments on the LiteLLM proxy, including `config.yaml` descriptions (except `api_key` and `api_base`).