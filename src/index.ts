#!/usr/bin/env node

/**
 * LiteLLM MCP Server
 * A Model Context Protocol server for managing LiteLLM proxy instances
 */

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
 * Tool definitions for LiteLLM management
 */
const TOOLS: Tool[] = [
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
];

/**
 * Handle tool calls from the client
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
  logDebug("Starting LiteLLM MCP Server");
  logDebug(`LiteLLM API Base: ${LITELLM_API_BASE}`);
  logDebug(`Debug mode: ${DEBUG}`);

  // Initialize MCP server
  const server = new Server(
    {
      name: "litellm-manager",
      version: "1.0.0",
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

  logDebug("Server ready and listening on stdio");
}

// Run the server
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
