# Tool: Health

**Description:** This tool provides a set of functions to interact with the health endpoints of the LiteLLM API. It allows you to check the health of the proxy server and its services.

**Functions:**

- `test_endpoint()`: Tests the endpoint.
- `health_services_endpoint(service)`: Checks the health of a specific service.
- `health_endpoint(model, model_id)`: Checks the health of a specific model.
- `health_check_history_endpoint(model, status_filter, limit, offset)`: Retrieves the health check history.
- `latest_health_checks_endpoint()`: Retrieves the latest health check status for all models.
- `shared_health_check_status_endpoint()`: Retrieves the status of shared health check coordination across pods.
- `active_callbacks()`: Retrieves a list of active callbacks.
- `health_readiness()`: Checks if the worker can receive requests.
- `health_liveness()`: Checks if the worker is alive.
- `test_model_connection(litellm_params, mode, model_info)`: Tests a direct connection to a specific model.

**API Endpoints:**

- `/test`: GET
- `/health/services`: GET
- `/health`: GET
- `/health/history`: GET
- `/health/latest`: GET
- `/health/shared-status`: GET
- `/active/callbacks`: GET
- `/settings`: GET
- `/health/readiness`: GET, OPTIONS
- `/health/liveness`: GET, OPTIONS
- `/health/test_connection`: POST