FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Run as stdio server
# The entrypoint will be a python script that handles MCP communication.
CMD ["python", "-m", "mcp_server"]