// MCP Server Enhanced - Phase 1 Implementation
// Adding Model Management, Key Management, User Management, and Health Monitoring tools

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import axios, { AxiosError } from "axios";

// Configuration from environment
const LITELLM_API_BASE = process.env.LITELLM_API_BASE || "http://localhost:4001";
const LITELLM_MASTER_KEY = process.env.LITELLM_MASTER_KEY || "";
const DEBUG = process.env.DEBUG?.toLowerCase() === "true";

/**
 * Log debug messages to stderr
 */
function logDebug(message: string): void {
  if (DEBUG) {
    console.error(`[DEBUG] ${message}`);
  }
}

/**
 * Enhanced Tool definitions for comprehensive LiteLLM management
 */
const TOOLS: Tool[] = [
  // Original tools
  {
    name: "list_models",
    description: "List all available models in LiteLLM",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "get_model_info",
    description: "Get detailed information about a specific model",
    inputSchema: {
      type: "object",
      properties: {
        model: {
          type: "string",
          description: "The model name/ID",
        },
      },
      required: ["model"],
    },
  },
  {
    name: "create_virtual_key",
    description: "Create a virtual API key for rate limiting and monitoring",
    inputSchema: {
      type: "object",
      properties: {
        key_alias: {
          type: "string",
          description: "Friendly name for the key",
        },
        user_id: {
          type: "string",
          description: "User ID to associate with this key",
        },
      },
      required: ["key_alias", "user_id"],
    },
  },
  {
    name: "get_spend",
    description: "Get spend information for a user or API key",
    inputSchema: {
      type: "object",
      properties: {
        user_id: {
          type: "string",
          description: "The user ID to check spend for",
        },
      },
      required: ["user_id"],
    },
  },

  // Phase 1: Model Management Suite
  {
    name: "add_model",
    description: "Add a new model to the LiteLLM proxy",
    inputSchema: {
      type: "object",
      properties: {
        model_name: {
          type: "string",
          description: "Model identifier (e.g., 'gpt-4', 'claude-3')"
        },
        litellm_params: {
          type: "object",
          description: "Model configuration parameters",
          properties: {
            model: { type: "string", description: "Actual model name" },
            api_base: { type: "string", description: "API base URL" },
            api_key: { type: "string", description: "API key" },
            rpm: { type: "number", description: "Requests per minute limit" },
            tpm: { type: "number", description: "Tokens per minute limit" }
          }
        },
        model_info: {
          type: "object",
          description: "Model metadata",
          properties: {
            description: { type: "string" },
            mode: { type: "string", enum: ["chat", "completion", "embedding"] },
            input_cost_per_token: { type: "number" },
            output_cost_per_token: { type: "number" }
          }
        }
      },
      required: ["model_name", "litellm_params"]
    }
  },
  {
    name: "update_model",
    description: "Update an existing model's configuration",
    inputSchema: {
      type: "object",
      properties: {
        model_name: { type: "string", description: "Model to update" },
        litellm_params: { type: "object", description: "Updated parameters" },
        model_info: { type: "object", description: "Updated metadata" }
      },
      required: ["model_name"]
    }
  },
  {
    name: "delete_model",
    description: "Remove a model from the proxy",
    inputSchema: {
      type: "object",
      properties: {
        model_name: { type: "string", description: "Model to delete" }
      },
      required: ["model_name"]
    }
  },
  {
    name: "get_model_health",
    description: "Check health status of a specific model",
    inputSchema: {
      type: "object",
      properties: {
        model_name: { type: "string", description: "Model to check" }
      },
      required: ["model_name"]
    }
  },

  // Phase 1: Key Management Suite
  {
    name: "list_keys",
    description: "List all API keys with pagination",
    inputSchema: {
      type: "object",
      properties: {
        page: { type: "number", description: "Page number", default: 1 },
        page_size: { type: "number", description: "Items per page", default: 50 }
      }
    }
  },
  {
    name: "update_key",
    description: "Update API key settings and limits",
    inputSchema: {
      type: "object",
      properties: {
        key: { type: "string", description: "API key to update" },
        key_alias: { type: "string", description: "New alias" },
        spend_limit: { type: "number", description: "Spend limit in USD" },
        models: { type: "array", items: { type: "string" }, description: "Allowed models" },
        metadata: { type: "object", description: "Additional metadata" }
      },
      required: ["key"]
    }
  },
  {
    name: "delete_key",
    description: "Delete an API key",
    inputSchema: {
      type: "object",
      properties: {
        key: { type: "string", description: "API key to delete" }
      },
      required: ["key"]
    }
  },
  {
    name: "get_key_analytics",
    description: "Get detailed analytics for a specific key",
    inputSchema: {
      type: "object",
      properties: {
        key: { type: "string", description: "API key to analyze" },
        start_date: { type: "string", description: "Start date (YYYY-MM-DD)" },
        end_date: { type: "string", description: "End date (YYYY-MM-DD)" }
      },
      required: ["key"]
    }
  },

  // Phase 1: User & Team Management Suite
  {
    name: "create_user",
    description: "Create a new user account",
    inputSchema: {
      type: "object",
      properties: {
        user_id: { type: "string", description: "Unique user identifier" },
        user_email: { type: "string", description: "User email address" },
        metadata: { type: "object", description: "Additional user metadata" }
      },
      required: ["user_id"]
    }
  },
  {
    name: "create_team",
    description: "Create a new team",
    inputSchema: {
      type: "object",
      properties: {
        team_id: { type: "string", description: "Unique team identifier" },
        team_alias: { type: "string", description: "Team display name" },
        metadata: { type: "object", description: "Additional team metadata" }
      },
      required: ["team_id"]
    }
  },
  {
    name: "add_team_member",
    description: "Add a user to a team",
    inputSchema: {
      type: "object",
      properties: {
        team_id: { type: "string", description: "Team ID" },
        user_id: { type: "string", description: "User ID to add" },
        role: { type: "string", description: "User role", enum: ["admin", "member"], default: "member" }
      },
      required: ["team_id", "user_id"]
    }
  },
  {
    name: "get_user_spend",
    description: "Get comprehensive spend analytics for a user",
    inputSchema: {
      type: "object",
      properties: {
        user_id: { type: "string", description: "User ID" },
        start_date: { type: "string", description: "Start date (YYYY-MM-DD)" },
        end_date: { type: "string", description: "End date (YYYY-MM-DD)" }
      },
      required: ["user_id"]
    }
  },

  // Phase 1: Health & Monitoring Suite
  {
    name: "get_system_health",
    description: "Get overall system health status",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "get_service_health",
    description: "Get health status of individual services",
    inputSchema: {
      type: "object",
      properties: {
        service: {
          type: "string",
          description: "Service to check",
          enum: ["api", "db", "redis", "models"]
        }
      }
    }
  },
  {
    name: "restart_service",
    description: "Restart a specific service (admin only)",
    inputSchema: {
      type: "object",
      properties: {
        service: { type: "string", description: "Service to restart" },
        force: { type: "boolean", description: "Force restart", default: false }
      },
      required: ["service"]
    }
  },
  {
    name: "get_error_logs",
    description: "Retrieve recent error logs",
    inputSchema: {
      type: "object",
      properties: {
        service: { type: "string", description: "Service to get logs for" },
        limit: { type: "number", description: "Number of log entries", default: 100 },
        since: { type: "string", description: "Start time (ISO 8601)" }
      }
    }
  }
];

/**
 * Enhanced tool call handler with comprehensive LiteLLM management
 */
async function handleToolCall(
  name: string,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  logDebug(`Tool called: ${name} with args: ${JSON.stringify(args)}`);

  const headers: Record<string, string> = {};
  if (LITELLM_MASTER_KEY) {
    headers["Authorization"] = `Bearer ${LITELLM_MASTER_KEY}`;
  }

  try {
    switch (name) {
      // Original tools
      case "list_models": {
        const response = await axios.get(`${LITELLM_API_BASE}/models`, {
          headers,
          timeout: 30000,
        });
        const data = response.data;
        const models = data.data?.map((m: { id: string }) => m.id) || [];
        return {
          content: [
            {
              type: "text",
              text: `Available models (${models.length}):\n${models.join("\n")}`,
            },
          ],
        };
      }

      case "get_model_info": {
        if (typeof args.model !== "string") {
          throw new Error("model parameter must be a string");
        }
        const model = args.model;
        const response = await axios.get(
          `${LITELLM_API_BASE}/models/${model}`,
          {
            headers,
            timeout: 30000,
          }
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      }

      case "create_virtual_key": {
        if (typeof args.key_alias !== "string") {
          throw new Error("key_alias parameter must be a string");
        }
        if (typeof args.user_id !== "string") {
          throw new Error("user_id parameter must be a string");
        }
        const keyAlias = args.key_alias;
        const userId = args.user_id;
        const response = await axios.post(
          `${LITELLM_API_BASE}/key/generate`,
          {
            key_alias: keyAlias,
            user_id: userId,
          },
          {
            headers,
            timeout: 30000,
          }
        );
        return {
          content: [
            {
              type: "text",
              text: `Created key '${keyAlias}' for user '${userId}':\n${JSON.stringify(
                response.data,
                null,
                2
              )}`,
            },
          ],
        };
      }

      case "get_spend": {
        if (typeof args.user_id !== "string") {
          throw new Error("user_id parameter must be a string");
        }
        const userId = args.user_id;
        const response = await axios.get(`${LITELLM_API_BASE}/spend`, {
          headers,
          params: { user_id: userId },
          timeout: 30000,
        });
        return {
          content: [
            {
              type: "text",
              text: `Spend for user '${userId}':\n${JSON.stringify(
                response.data,
                null,
                2
              )}`,
            },
          ],
        };
      }

      // Phase 1: Model Management Tools
      case "add_model": {
        const { model_name, litellm_params, model_info } = args;
        const response = await axios.post(
          `${LITELLM_API_BASE}/model/add`,
          {
            model_name,
            litellm_params,
            model_info,
          },
          { headers, timeout: 30000 }
        );
        return {
          content: [
            {
              type: "text",
              text: `Successfully added model '${model_name}':\n${JSON.stringify(response.data, null, 2)}`,
            },
          ],
        };
      }

      case "update_model": {
        const { model_name, litellm_params, model_info } = args;
        const response = await axios.post(
          `${LITELLM_API_BASE}/model/update`,
          {
            model_name,
            litellm_params,
            model_info,
          },
          { headers, timeout: 30000 }
        );
        return {
          content: [
            {
              type: "text",
              text: `Successfully updated model '${model_name}':\n${JSON.stringify(response.data, null, 2)}`,
            },
          ],
        };
      }

      case "delete_model": {
        const { model_name } = args;
        const response = await axios.post(
          `${LITELLM_API_BASE}/model/delete`,
          { model_name },
          { headers, timeout: 30000 }
        );
        return {
          content: [
            {
              type: "text",
              text: `Successfully deleted model '${model_name}':\n${JSON.stringify(response.data, null, 2)}`,
            },
          ],
        };
      }

      case "get_model_health": {
        const { model_name } = args;
        const response = await axios.get(
          `${LITELLM_API_BASE}/health/test_connection`,
          {
            headers,
            params: { model: model_name },
            timeout: 30000,
          }
        );
        return {
          content: [
            {
              type: "text",
              text: `Health status for model '${model_name}':\n${JSON.stringify(response.data, null, 2)}`,
            },
          ],
        };
      }

      // Phase 1: Key Management Tools
      case "list_keys": {
        const { page = 1, page_size = 50 } = args;
        const response = await axios.get(`${LITELLM_API_BASE}/key/list`, {
          headers,
          params: { page, page_size },
          timeout: 30000,
        });
        return {
          content: [
            {
              type: "text",
              text: `API Keys (Page ${page}, ${page_size} per page):\n${JSON.stringify(response.data, null, 2)}`,
            },
          ],
        };
      }

      case "update_key": {
        const { key, key_alias, spend_limit, models, metadata } = args;
        const response = await axios.post(
          `${LITELLM_API_BASE}/key/update`,
          {
            key,
            key_alias,
            spend_limit,
            models,
            metadata,
          },
          { headers, timeout: 30000 }
        );
        return {
          content: [
            {
              type: "text",
              text: `Successfully updated key '${key}':\n${JSON.stringify(response.data, null, 2)}`,
            },
          ],
        };
      }

      case "delete_key": {
        const { key } = args;
        const response = await axios.post(
          `${LITELLM_API_BASE}/key/delete`,
          { key },
          { headers, timeout: 30000 }
        );
        return {
          content: [
            {
              type: "text",
              text: `Successfully deleted key '${key}':\n${JSON.stringify(response.data, null, 2)}`,
            },
          ],
        };
      }

      case "get_key_analytics": {
        const { key, start_date, end_date } = args;
        const params: any = { key };
        if (start_date) params.start_date = start_date;
        if (end_date) params.end_date = end_date;

        const response = await axios.get(`${LITELLM_API_BASE}/key/analytics`, {
          headers,
          params,
          timeout: 30000,
        });
        return {
          content: [
            {
              type: "text",
              text: `Analytics for key '${key}':\n${JSON.stringify(response.data, null, 2)}`,
            },
          ],
        };
      }

      // Phase 1: User & Team Management Tools
      case "create_user": {
        const { user_id, user_email, metadata } = args;
        const response = await axios.post(
          `${LITELLM_API_BASE}/user/new`,
          {
            user_id,
            user_email,
            metadata,
          },
          { headers, timeout: 30000 }
        );
        return {
          content: [
            {
              type: "text",
              text: `Successfully created user '${user_id}':\n${JSON.stringify(response.data, null, 2)}`,
            },
          ],
        };
      }

      case "create_team": {
        const { team_id, team_alias, metadata } = args;
        const response = await axios.post(
          `${LITELLM_API_BASE}/team/new`,
          {
            team_id,
            team_alias,
            metadata,
          },
          { headers, timeout: 30000 }
        );
        return {
          content: [
            {
              type: "text",
              text: `Successfully created team '${team_id}':\n${JSON.stringify(response.data, null, 2)}`,
            },
          ],
        };
      }

      case "add_team_member": {
        const { team_id, user_id, role = "member" } = args;
        const response = await axios.post(
          `${LITELLM_API_BASE}/team/member/add`,
          {
            team_id,
            user_id,
            role,
          },
          { headers, timeout: 30000 }
        );
        return {
          content: [
            {
              type: "text",
              text: `Successfully added user '${user_id}' to team '${team_id}' as '${role}':\n${JSON.stringify(response.data, null, 2)}`,
            },
          ],
        };
      }

      case "get_user_spend": {
        const { user_id, start_date, end_date } = args;
        const params: any = { user_id };
        if (start_date) params.start_date = start_date;
        if (end_date) params.end_date = end_date;

        const response = await axios.get(`${LITELLM_API_BASE}/user/analytics`, {
          headers,
          params,
          timeout: 30000,
        });
        return {
          content: [
            {
              type: "text",
              text: `Spend analytics for user '${user_id}':\n${JSON.stringify(response.data, null, 2)}`,
            },
          ],
        };
      }

      // Phase 1: Health & Monitoring Tools
      case "get_system_health": {
        const response = await axios.get(`${LITELLM_API_BASE}/health`, {
          headers,
          timeout: 30000,
        });
        return {
          content: [
            {
              type: "text",
              text: `System Health Status:\n${JSON.stringify(response.data, null, 2)}`,
            },
          ],
        };
      }

      case "get_service_health": {
        const { service } = args;
        const response = await axios.get(`${LITELLM_API_BASE}/health/services`, {
          headers,
          params: { service },
          timeout: 30000,
        });
        return {
          content: [
            {
              type: "text",
              text: `Health status for service '${service}':\n${JSON.stringify(response.data, null, 2)}`,
            },
          ],
        };
      }

      case "restart_service": {
        const { service, force = false } = args;
        // Note: This endpoint may not exist in LiteLLM - placeholder for future admin functionality
        return {
          content: [
            {
              type: "text",
              text: `Service restart functionality not yet implemented. Service: ${service}, Force: ${force}`,
            },
          ],
        };
      }

      case "get_error_logs": {
        const { service, limit = 100, since } = args;
        const params: any = { limit };
        if (since) params.since = since;

        const response = await axios.get(`${LITELLM_API_BASE}/logs`, {
          headers,
          params: { ...params, service, level: "error" },
          timeout: 30000,
        });
        return {
          content: [
            {
              type: "text",
              text: `Error logs for service '${service}' (last ${limit} entries):\n${JSON.stringify(response.data, null, 2)}`,
            },
          ],
        };
      }

      default:
        return {
          content: [
            {
              type: "text",
              text: `Unknown tool: ${name}`,
            },
          ],
        };
    }
  } catch (error) {
    if (error instanceof AxiosError) {
      return {
        content: [
          {
            type: "text",
            text: `Error calling LiteLLM API: ${error.message}${
              error.response?.data
                ? `\n${JSON.stringify(error.response.data, null, 2)}`
                : ""
            }`,
          },
        ],
      };
    }
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
}

/**
 * Main server function
 */
async function main(): Promise<void> {
  logDebug("Starting Enhanced LiteLLM MCP Server");
  logDebug(`LiteLLM API Base: ${LITELLM_API_BASE}`);
  logDebug(`Debug mode: ${DEBUG}`);
  logDebug(`Available tools: ${TOOLS.length}`);

  // Initialize MCP server
  const server = new Server(
    {
      name: "litellm-manager-enhanced",
      version: "1.1.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Register tool list handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: TOOLS,
    };
  });

  // Register tool call handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    return await handleToolCall(
      request.params.name,
      (request.params.arguments || {}) as Record<string, unknown>
    );
  });

  // Connect to stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  logDebug("Enhanced server ready and listening on stdio");
}

// Run the server
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});