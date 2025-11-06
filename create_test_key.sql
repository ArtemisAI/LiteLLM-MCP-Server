-- Create test API key for MCP Server testing
INSERT INTO "LiteLLM_VerificationToken" (token, key_alias, user_id, created_at) 
VALUES ('sk-test-mcp-server-001', 'mcp-test-key', 'mcp-admin', NOW());

-- Verify insertion
SELECT token, key_alias, user_id, created_at FROM "LiteLLM_VerificationToken" WHERE key_alias = 'mcp-test-key';
