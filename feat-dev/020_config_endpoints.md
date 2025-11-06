# Tool: Config

**Description:** This tool provides a set of functions to interact with the config endpoints of the LiteLLM API. It allows you to manage pass-through endpoints and cost discount configurations.

**Functions:**

- `get_pass_through_endpoints(team_id, endpoint_id)`: Retrieves a list of all available pass-through endpoints.
- `create_pass_through_endpoint(path, target, **kwargs)`: Creates a new pass-through endpoint.
- `delete_pass_through_endpoint(endpoint_id)`: Deletes a specific pass-through endpoint.
- `update_pass_through_endpoint(endpoint_id, path, target, **kwargs)`: Updates a specific pass-through endpoint.
- `get_cost_discount_config()`: Retrieves the cost discount configuration.
- `update_cost_discount_config(config)`: Updates the cost discount configuration.

**API Endpoints:**

- `/config/pass_through_endpoint/team/{team_id}`: GET
- `/config/pass_through_endpoint`: GET, POST, DELETE
- `/config/pass_through_endpoint/{endpoint_id}`: POST
- `/config/cost_discount_config`: GET, PATCH