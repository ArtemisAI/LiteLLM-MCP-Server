# LiteLLM MCP Server Feature Development Roadmap

This roadmap outlines potential new tools and functions to be developed for the LiteLLM MCP server, based on an analysis of the LiteLLM API specification. The goal is to create an inventory of valid and useful API endpoints, clustered into logical tools, with detailed specifications for future development.

## 1. Model Management Tools

**Description:** Tools for listing, retrieving information about, and managing LLM models and model groups.

*   **001_model_management_endpoints.md**
    *   **Functions:**
        *   `list_models()`: Retrieves a list of all available models.
        *   `get_model_info(model_id)`: Retrieves detailed information about a specific model.
        *   `get_model_group_info(model_group)`: Retrieves information about a specific model group.
    *   **LiteLLM API Endpoints:**
        *   GET /models
        *   GET /v1/models
        *   GET /models/{model_id}
        *   GET /v1/models/{model_id}
        *   GET /model/info
        *   GET /v1/model/info
        *   GET /model_group/info

## 2. Chat Completions Tools

**Description:** Tools for interacting with chat completion functionalities of various LLMs.

*   **002_chat_completions_endpoints.md**
    *   **Functions:**
        *   `create_chat_completion(model, messages, **kwargs)`: Creates a chat completion.
    *   **LiteLLM API Endpoints:**
        *   POST /chat/completions
        *   POST /v1/chat/completions
        *   POST /openai/deployments/{model}/chat/completions
        *   POST /engines/{model}/chat/completions

## 3. Audio Processing Tools

**Description:** Tools for audio transcription and speech generation using LLMs.

*   **003_audio_endpoints.md**
    *   **Functions:**
        *   `create_audio_transcription(file)`: Creates an audio transcription from an audio file.
        *   `create_audio_speech(text)`: Generates audio from text.
    *   **LiteLLM API Endpoints:**
        *   POST /audio/transcriptions
        *   POST /v1/audio/transcriptions
        *   POST /audio/speech
        *   POST /v1/audio/speech

## 4. Assistants Management Tools

**Description:** Tools for creating, retrieving, updating, and deleting AI assistants and managing their threads and messages.

*   **004_assistants_endpoints.md**
    *   **Functions:**
        *   `get_assistants()`: Retrieves a list of all available assistants.
        *   `create_assistant()`: Creates a new assistant.
        *   `delete_assistant(assistant_id)`: Deletes a specific assistant.
        *   `create_thread()`: Creates a new thread.
        *   `get_thread(thread_id)`: Retrieves a specific thread.
        *   `add_message(thread_id, message)`: Adds a message to a specific thread.
        *   `get_messages(thread_id)`: Retrieves all messages from a specific thread.
        *   `run_thread(thread_id)`: Runs a specific thread.
    *   **LiteLLM API Endpoints:**
        *   GET /assistants
        *   POST /assistants
        *   GET /v1/assistants
        *   POST /v1/assistants
        *   DELETE /assistants/{assistant_id}
        *   DELETE /v1/assistants/{assistant_id}
        *   POST /threads
        *   POST /v1/threads
        *   GET /threads/{thread_id}
        *   GET /v1/threads/{thread_id}
        *   POST /threads/{thread_id}/messages
        *   GET /threads/{thread_id}/messages
        *   POST /v1/threads/{thread_id}/messages
        *   GET /v1/threads/{thread_id}/messages
        *   POST /threads/{thread_id}/runs
        *   POST /v1/threads/{thread_id}/runs

## 5. LLM Utility Tools

**Description:** General utility functions related to LLMs, such as token counting and request transformation.

*   **005_llm_utils_endpoints.md**
    *   **Functions:**
        *   `count_tokens(request)`: Counts the number of tokens in a given request.
        *   `get_supported_openai_params(model)`: Retrieves a list of supported OpenAI parameters for a given model.
        *   `transform_request(request)`: Transforms a request to be compatible with the LiteLLM API.
    *   **LiteLLM API Endpoints:**
        *   POST /utils/token_counter
        *   GET /utils/supported_openai_params
        *   POST /utils/transform_request

## 6. Responses Management Tools

**Description:** Tools for managing and retrieving LLM responses.

*   **006_responses_endpoints.md**
    *   **Functions:**
        *   `create_response(model, input)`: Creates a new response.
        *   `get_response(response_id)`: Retrieves a specific response.
        *   `delete_response(response_id)`: Deletes a specific response.
        *   `get_response_input_items(response_id)`: Retrieves the input items of a specific response.
        *   `cancel_response(response_id)`: Cancels a specific response.
    *   **LiteLLM API Endpoints:**
        *   POST /openai/v1/responses
        *   POST /responses
        *   POST /v1/responses
        *   GET /openai/v1/responses/{response_id}
        *   DELETE /openai/v1/responses/{response_id}
        *   GET /responses/{response_id}
        *   DELETE /responses/{response_id}
        *   GET /v1/responses/{response_id}
        *   DELETE /v1/responses/{response_id}
        *   GET /openai/v1/responses/{response_id}/input_items
        *   GET /responses/{response_id}/input_items
        *   GET /v1/responses/{response_id}/input_items
        *   POST /openai/v1/responses/{response_id}/cancel
        *   POST /responses/{response_id}/cancel
        *   POST /v1/responses/{response_id}/cancel

## 7. Batch Processing Tools

**Description:** Tools for asynchronous processing of API requests in batches.

*   **007_batch_endpoints.md**
    *   **Functions:**
        *   `create_batch(input_file_id, endpoint, completion_window)`: Creates a new batch.
        *   `list_batches()`: Retrieves a list of all available batches.
        *   `retrieve_batch(batch_id)`: Retrieves a specific batch.
        *   `cancel_batch(batch_id)`: Cancels a specific batch.
    *   **LiteLLM API Endpoints:**
        *   POST /batches
        *   GET /batches
        *   POST /v1/batches
        *   GET /v1/batches
        *   POST /{provider}/v1/batches
        *   GET /{provider}/v1/batches
        *   GET /batches/{batch_id}
        *   GET /v1/batches/{batch_id}
        *   GET /{provider}/v1/batches/{batch_id}
        *   POST /batches/{batch_id}/cancel
        *   POST /v1/batches/{batch_id}/cancel
        *   POST /{provider}/v1/batches/{batch_id}/cancel

## 8. Public Information Tools

**Description:** Tools for accessing publicly available information from the LiteLLM API.

*   **008_public_endpoints.md**
    *   **Functions:**
        *   `get_public_model_hub()`: Retrieves the public model hub.
        *   `get_public_model_hub_info()`: Retrieves information about the public model hub.
    *   **LiteLLM API Endpoints:**
        *   GET /public/model_hub
        *   GET /public/model_hub/info

## 9. Rerank Tools

**Description:** Tools for reranking documents based on a query.

*   **009_rerank_endpoints.md**
    *   **Functions:**
        *   `rerank(documents, query)`: Reranks a list of documents based on a query.
    *   **LiteLLM API Endpoints:**
        *   POST /rerank
        *   POST /v1/rerank
        *   POST /v2/rerank

## 10. OCR Tools

**Description:** Tools for Optical Character Recognition (OCR) to extract text from images and documents.

*   **010_ocr_endpoints.md**
    *   **Functions:**
        *   `ocr(document)`: Extracts text from a document or image.
    *   **LiteLLM API Endpoints:**
        *   POST /ocr
        *   POST /v1/ocr

## 11. Video Processing Tools

**Description:** Tools for video generation, status retrieval, content download, and remixing.

*   **011_videos_endpoints.md**
    *   **Functions:**
        *   `list_videos()`: Retrieves a list of all available videos.
        *   `generate_video(prompt)`: Generates a new video from a text prompt.
        *   `get_video_status(video_id)`: Retrieves the status of a specific video.
        *   `get_video_content(video_id)`: Downloads the content of a specific video.
        *   `remix_video(video_id, prompt)`: Remixes an existing video with a new prompt.
    *   **LiteLLM API Endpoints:**
        *   GET /videos
        *   POST /videos
        *   GET /v1/videos
        *   POST /v1/videos
        *   GET /videos/{video_id}
        *   GET /v1/videos/{video_id}
        *   GET /videos/{video_id}/content
        *   GET /v1/videos/{video_id}/content
        *   POST /videos/{video_id}/remix
        *   POST /v1/videos/{video_id}/remix

## 12. Search Tools

**Description:** Tools for performing web searches through integrated search providers.

*   **012_search_endpoints.md**
    *   **Functions:**
        *   `search(query, **kwargs)`: Performs a web search.
    *   **LiteLLM API Endpoints:**
        *   POST /search
        *   POST /v1/search
        *   POST /search/{search_tool_name}
        *   POST /v1/search/{search_tool_name}

## 13. Image Generation and Editing Tools

**Description:** Tools for generating new images and editing existing ones using LLMs.

*   **013_images_endpoints.md**
    *   **Functions:**
        *   `generate_image(prompt, **kwargs)`: Generates a new image from a text prompt.
        *   `edit_image(image, prompt, **kwargs)`: Edits an existing image based on a text prompt.
    *   **LiteLLM API Endpoints:**
        *   POST /images/generations
        *   POST /v1/images/generations
        *   POST /openai/deployments/{model}/images/generations
        *   POST /images/edits
        *   POST /v1/images/edits
        *   POST /openai/deployments/{model}/images/edits

## 14. Fine-Tuning Management Tools

**Description:** Tools for creating, managing, and retrieving fine-tuning jobs for custom models.

*   **014_fine_tuning_endpoints.md**
    *   **Functions:**
        *   `create_fine_tuning_job(model, training_file, **kwargs)`: Creates a new fine-tuning job.
        *   `list_fine_tuning_jobs()`: Retrieves a list of all available fine-tuning jobs.
        *   `retrieve_fine_tuning_job(fine_tuning_job_id)`: Retrieves a specific fine-tuning job.
        *   `cancel_fine_tuning_job(fine_tuning_job_id)`: Cancels a specific fine-tuning job.
    *   **LiteLLM API Endpoints:**
        *   POST /fine_tuning/jobs
        *   GET /fine_tuning/jobs
        *   POST /v1/fine_tuning/jobs
        *   GET /v1/fine_tuning/jobs
        *   GET /fine_tuning/jobs/{fine_tuning_job_id}
        *   GET /v1/fine_tuning/jobs/{fine_tuning_job_id}
        *   POST /fine_tuning/jobs/{fine_tuning_job_id}/cancel
        *   POST /v1/fine_tuning/jobs/{fine_tuning_job_id}/cancel

## 15. Vector Store Management Tools

**Description:** Tools for creating and searching vector stores.

*   **015_vector_stores_endpoints.md**
    *   **Functions:**
        *   `create_vector_store()`: Creates a new vector store.
        *   `search_vector_store(vector_store_id, query)`: Searches a specific vector store.
    *   **LiteLLM API Endpoints:**
        *   POST /vector_stores
        *   POST /v1/vector_stores
        *   POST /vector_stores/{vector_store_id}/search
        *   POST /v1/vector_stores/{vector_store_id}/search

## 16. Credential Management Tools

**Description:** Tools for managing API credentials, including creation, retrieval, updating, and deletion.

*   **016_credential_management_endpoints.md**
    *   **Functions:**
        *   `get_credentials()`: Retrieves a list of all available credentials.
        *   `create_credential(credential_name, credential_info, **kwargs)`: Creates a new credential.
        *   `get_credential_by_model(model_id)`: Retrieves a credential by model ID.
        *   `get_credential_by_name(credential_name)`: Retrieves a credential by name.
        *   `delete_credential(credential_name)`: Deletes a specific credential.
        *   `update_credential(credential_name, credential_info, **kwargs)`: Updates a specific credential.
    *   **LiteLLM API Endpoints:**
        *   GET /credentials
        *   POST /credentials
        *   GET /credentials/by_model/{model_id}
        *   GET /credentials/by_name/{credential_name}
        *   DELETE /credentials/{credential_name}
        *   PATCH /credentials/{credential_name}

## 17. Pass-Through Endpoints

**Description:** Tools providing direct pass-through access to various LLM provider APIs.

*   **017_pass_through_endpoints.md**
    *   **Functions:**
        *   `gemini_proxy_route(endpoint, **kwargs)`: Makes a request to the Gemini pass-through endpoint.
        *   `cohere_proxy_route(endpoint, **kwargs)`: Makes a request to the Cohere pass-through endpoint.
        *   `vllm_proxy_route(endpoint, **kwargs)`: Makes a request to the VLLM pass-through endpoint.
        *   `mistral_proxy_route(endpoint, **kwargs)`: Makes a request to the Mistral pass-through endpoint.
        *   `anthropic_proxy_route(endpoint, **kwargs)`: Makes a request to the Anthropic pass-through endpoint.
        *   `bedrock_proxy_route(endpoint, **kwargs)`: Makes a request to the Bedrock pass-through endpoint.
        *   `assemblyai_proxy_route(endpoint, **kwargs)`: Makes a request to the AssemblyAI pass-through endpoint.
        *   `azure_proxy_route(endpoint, **kwargs)`: Makes a request to the Azure pass-through endpoint.
        *   `vertex_proxy_route(endpoint, **kwargs)`: Makes a request to the Vertex AI pass-through endpoint.
        *   `openai_proxy_route(endpoint, **kwargs)`: Makes a request to the OpenAI pass-through endpoint.
        *   `langfuse_proxy_route(endpoint, **kwargs)`: Makes a request to the Langfuse pass-through endpoint.
    *   **LiteLLM API Endpoints:**
        *   DELETE, PATCH, POST, GET, PUT /gemini/{endpoint}
        *   DELETE, PATCH, POST, GET, PUT /cohere/{endpoint}
        *   DELETE, PATCH, POST, GET, PUT /vllm/{endpoint}
        *   DELETE, PATCH, POST, GET, PUT /mistral/{endpoint}
        *   DELETE, PATCH, POST, GET, PUT /anthropic/{endpoint}
        *   DELETE, PATCH, POST, GET, PUT /bedrock/{endpoint}
        *   DELETE, PATCH, POST, GET, PUT /eu.assemblyai/{endpoint}
        *   DELETE, PATCH, POST, GET, PUT /assemblyai/{endpoint}
        *   DELETE, PATCH, POST, GET, PUT /azure/{endpoint}
        *   DELETE, PATCH, POST, GET, PUT /vertex_ai/discovery/{endpoint}
        *   DELETE, PATCH, POST, GET, PUT /vertex_ai/{endpoint}
        *   DELETE, PATCH, POST, GET, PUT /openai/{endpoint}
        *   DELETE, PATCH, POST, GET, PUT /langfuse/{endpoint}

## 18. MCP Server Management Tools

**Description:** Tools for managing the MCP server itself, including health checks and server configuration.

*   **018_mcp_endpoints.md**
    *   **Functions:**
        *   `get_mcp_tools()`: Retrieves a list of all available MCP tools.
        *   `get_mcp_access_groups()`: Retrieves a list of all available MCP access groups.
        *   `health_check_mcp_server(server_id)`: Performs a health check on a specific MCP server.
        *   `health_check_all_mcp_servers()`: Performs a health check on all accessible MCP servers.
        *   `fetch_all_mcp_servers()`: Retrieves a list of all MCP servers.
        *   `add_mcp_server(server_name, **kwargs)`: Adds a new MCP server.
        *   `edit_mcp_server(server_id, **kwargs)`: Edits a specific MCP server.
        *   `fetch_mcp_server(server_id)`: Retrieves a specific MCP server.
        *   `remove_mcp_server(server_id)`: Removes a specific MCP server.
        *   `authorize(client_id, redirect_uri, **kwargs)`: Authorizes a client.
        *   `token_endpoint(grant_type, client_id, **kwargs)`: Exchanges an authorization code for a token.
        *   `register_client()`: Registers a new client.
        *   `list_tool_rest_api()`: Retrieves a list of all available tools from the REST API.
        *   `call_tool_rest_api(tool_name, **kwargs)`: Calls a specific tool from the REST API.
        *   `test_connection(server_name, **kwargs)`: Tests the connection to a specific MCP server.
        *   `test_tools_list(server_name, **kwargs)`: Retrieves a list of all available tools from a specific MCP server.
    *   **LiteLLM API Endpoints:**
        *   GET /v1/mcp/tools
        *   GET /v1/mcp/access_groups
        *   GET /v1/mcp/server/{server_id}/health
        *   GET /v1/mcp/server/health
        *   GET /v1/mcp/server
        *   POST /v1/mcp/server
        *   PUT /v1/mcp/server
        *   GET /v1/mcp/server/{server_id}
        *   DELETE /v1/mcp/server/{server_id}
        *   GET /authorize
        *   GET /{mcp_server_name}/authorize
        *   POST /token
        *   POST /{mcp_server_name}/token
        *   POST /register
        *   POST /{mcp_server_name}/register
        *   GET /mcp-rest/tools/list
        *   POST /mcp-rest/tools/call
        *   POST /mcp-rest/test/connection
        *   POST /mcp-rest/test/tools/list

## 19. Google GenAI Endpoints

**Description:** Tools for interacting with Google's Generative AI services.

*   **019_google_genai_endpoints.md**
    *   **Functions:**
        *   `generate_content(model_name, **kwargs)`: Generates content.
        *   `stream_generate_content(model_name, **kwargs)`: Streams generated content.
        *   `count_tokens(model_name, **kwargs)`: Counts the number of tokens in a given request.
    *   **LiteLLM API Endpoints:**
        *   POST /models/{model_name}:generateContent
        *   POST /v1beta/models/{model_name}:generateContent
        *   POST /models/{model_name}:streamGenerateContent
        *   POST /v1beta/models/{model_name}:streamGenerateContent
        *   POST /models/{model_name}:countTokens
        *   POST /v1beta/models/{model_name}:countTokens

## 20. Configuration Tools

**Description:** Tools for managing various configurations within the LiteLLM proxy, including pass-through endpoints and cost discounts.

*   **020_config_endpoints.md**
    *   **Functions:**
        *   `get_pass_through_endpoints(team_id, endpoint_id)`: Retrieves a list of all available pass-through endpoints.
        *   `create_pass_through_endpoint(path, target, **kwargs)`: Creates a new pass-through endpoint.
        *   `delete_pass_through_endpoint(endpoint_id)`: Deletes a specific pass-through endpoint.
        *   `update_pass_through_endpoint(endpoint_id, path, target, **kwargs)`: Updates a specific pass-through endpoint.
        *   `get_cost_discount_config()`: Retrieves the cost discount configuration.
        *   `update_cost_discount_config(config)`: Updates the cost discount configuration.
    *   **LiteLLM API Endpoints:**
        *   GET /config/pass_through_endpoint/team/{team_id}
        *   GET /config/pass_through_endpoint
        *   POST /config/pass_through_endpoint
        *   DELETE /config/pass_through_endpoint
        *   POST /config/pass_through_endpoint/{endpoint_id}
        *   GET /config/cost_discount_config
        *   PATCH /config/cost_discount_config

## 21. Health Monitoring Tools

**Description:** Tools for checking the health and status of the LiteLLM proxy server and its integrated services.

*   **021_health_endpoints.md**
    *   **Functions:**
        *   `test_endpoint()`: Tests the endpoint.
        *   `health_services_endpoint(service)`: Checks the health of a specific service.
        *   `health_endpoint(model, model_id)`: Checks the health of a specific model.
        *   `health_check_history_endpoint(model, status_filter, limit, offset)`: Retrieves the health check history.
        *   `latest_health_checks_endpoint()`: Retrieves the latest health check status for all models.
        *   `shared_health_check_status_endpoint()`: Retrieves the status of shared health check coordination across pods.
        *   `active_callbacks()`: Retrieves a list of active callbacks.
        *   `health_readiness()`: Checks if the worker can receive requests.
        *   `health_liveness()`: Checks if the worker is alive.
        *   `test_model_connection(litellm_params, mode, model_info)`: Tests a direct connection to a specific model.
    *   **LiteLLM API Endpoints:**
        *   GET /test
        *   GET /health/services
        *   GET /health
        *   GET /health/history
        *   GET /health/latest
        *   GET /health/shared-status
        *   GET /active/callbacks
        *   GET /settings
        *   GET /health/readiness
        *   OPTIONS /health/readiness
        *   GET /health/liveness
        *   OPTIONS /health/liveness
        *   POST /health/test_connection