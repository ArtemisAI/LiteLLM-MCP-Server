FROM python:3.11-slim

WORKDIR /app

COPY mcp_server/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY mcp_server/ .

# Run as stdio server
# The entrypoint will be a python script that handles MCP communication.
CMD ["python", "-m", "__main__"]