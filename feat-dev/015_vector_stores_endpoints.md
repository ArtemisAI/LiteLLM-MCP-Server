# Tool: Vector Stores

**Description:** This tool provides a set of functions to interact with the vector stores endpoints of the LiteLLM API. It allows you to create and search vector stores.

**Functions:**

- `create_vector_store()`: Creates a new vector store. This function uses the `/vector_stores` and `/v1/vector_stores` endpoints.
- `search_vector_store(vector_store_id, query)`: Searches a specific vector store. This function uses the `/vector_stores/{vector_store_id}/search` and `/v1/vector_stores/{vector_store_id}/search` endpoints.

**API Endpoints:**

- **POST /vector_stores**: Creates a new vector store.
- **POST /v1/vector_stores**: Creates a new vector store.
- **POST /vector_stores/{vector_store_id}/search**: Searches a specific vector store.
- **POST /v1/vector_stores/{vector_store_id}/search**: Searches a specific vector store.