"""MCP Server for LiteLLM management"""

import asyncio
import json
import os
import sys
from typing import Any

import httpx
from mcp.server import Server
from mcp.types import TextContent, Tool

# Initialize MCP server
server = Server("litellm-manager")

# Configuration from environment
LITELLM_API_BASE = os.getenv("LITELLM_API_BASE", "http://localhost:4001")
LITELLM_MASTER_KEY = os.getenv("LITELLM_MASTER_KEY", "")
DEBUG = os.getenv("DEBUG", "false").lower() == "true"


def log_debug(message: str):
    """Log debug messages to stderr"""
    if DEBUG:
        print(f"[DEBUG] {message}", file=sys.stderr)


# Tool definitions
@server.list_tools()
async def list_tools() -> list[Tool]:
    """List available tools for LiteLLM management"""
    return [
        Tool(
            name="list_models",
            description="List all available models in LiteLLM",
            inputSchema={
                "type": "object",
                "properties": {},
                "required": [],
            },
        ),
        Tool(
            name="get_model_info",
            description="Get detailed information about a specific model",
            inputSchema={
                "type": "object",
                "properties": {
                    "model": {
                        "type": "string",
                        "description": "The model name/ID",
                    }
                },
                "required": ["model"],
            },
        ),
        Tool(
            name="create_virtual_key",
            description="Create a virtual API key for rate limiting and monitoring",
            inputSchema={
                "type": "object",
                "properties": {
                    "key_alias": {
                        "type": "string",
                        "description": "Friendly name for the key",
                    },
                    "user_id": {
                        "type": "string",
                        "description": "User ID to associate with this key",
                    },
                },
                "required": ["key_alias", "user_id"],
            },
        ),
        Tool(
            name="get_spend",
            description="Get spend information for a user or API key",
            inputSchema={
                "type": "object",
                "properties": {
                    "user_id": {
                        "type": "string",
                        "description": "The user ID to check spend for",
                    }
                },
                "required": ["user_id"],
            },
        ),
    ]


@server.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    """Handle tool calls from the client"""
    log_debug(f"Tool called: {name} with args: {arguments}")

    headers = {}
    if LITELLM_MASTER_KEY:
        headers["Authorization"] = f"Bearer {LITELLM_MASTER_KEY}"

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            if name == "list_models":
                response = await client.get(
                    f"{LITELLM_API_BASE}/models",
                    headers=headers,
                )
                response.raise_for_status()
                data = response.json()
                models = [m.get("id") for m in data.get("data", [])]
                return [
                    TextContent(
                        type="text",
                        text=f"Available models ({len(models)}):\n" + "\n".join(models),
                    )
                ]

            elif name == "get_model_info":
                model = arguments.get("model")
                response = await client.get(
                    f"{LITELLM_API_BASE}/models/{model}",
                    headers=headers,
                )
                response.raise_for_status()
                data = response.json()
                return [TextContent(type="text", text=json.dumps(data, indent=2))]

            elif name == "create_virtual_key":
                key_alias = arguments.get("key_alias")
                user_id = arguments.get("user_id")
                response = await client.post(
                    f"{LITELLM_API_BASE}/key/generate",
                    headers=headers,
                    json={"key_alias": key_alias, "user_id": user_id},
                )
                response.raise_for_status()
                data = response.json()
                return [
                    TextContent(
                        type="text",
                        text=f"Created key '{key_alias}' for user '{user_id}':\n"
                        + json.dumps(data, indent=2),
                    )
                ]

            elif name == "get_spend":
                user_id = arguments.get("user_id")
                response = await client.get(
                    f"{LITELLM_API_BASE}/spend",
                    headers=headers,
                    params={"user_id": user_id},
                )
                response.raise_for_status()
                data = response.json()
                return [
                    TextContent(
                        type="text",
                        text=f"Spend for user '{user_id}':\n" + json.dumps(data, indent=2),
                    )
                ]

            else:
                return [TextContent(type="text", text=f"Unknown tool: {name}")]

        except httpx.HTTPError as e:
            return [TextContent(type="text", text=f"Error calling LiteLLM API: {str(e)}")]
        except Exception as e:
            return [TextContent(type="text", text=f"Error: {str(e)}")]


async def main():
    """Run the MCP server"""
    log_debug(f"Starting LiteLLM MCP Server")
    log_debug(f"LiteLLM API Base: {LITELLM_API_BASE}")
    log_debug(f"Debug mode: {DEBUG}")

    async with server:
        log_debug("Server ready and listening on stdio")
        await asyncio.sleep(float("inf"))


if __name__ == "__main__":
    asyncio.run(main())
