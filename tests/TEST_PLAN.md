# LiteLLM MCP Server - Test Plan

## Executive Summary

This document outlines the comprehensive testing strategy for the TypeScript-based LiteLLM MCP Server. The plan addresses unit testing, integration testing, end-to-end testing, and provides rationale for deployment choices.

---

## Table of Contents

1. [Testing Philosophy](#testing-philosophy)
2. [Why Docker vs npm?](#why-docker-vs-npm)
3. [Mock LiteLLM Instance Strategy](#mock-litellm-instance-strategy)
4. [Test Architecture](#test-architecture)
5. [Test Levels](#test-levels)
6. [Test Environment Setup](#test-environment-setup)
7. [CI/CD Integration](#cicd-integration)
8. [Success Metrics](#success-metrics)

---

## Testing Philosophy

### Goals
- **Reliability**: Ensure MCP server handles all tool requests correctly
- **Type Safety**: Validate TypeScript type checking catches errors at compile-time
- **Protocol Compliance**: Verify adherence to MCP protocol specification
- **Error Handling**: Test graceful failure modes and error messages
- **Performance**: Ensure acceptable response times for stdio operations
- **Maintainability**: Create tests that serve as living documentation

### Principles
1. **Fast Feedback**: Unit tests run in <2s, integration tests in <10s
2. **Isolation**: Tests don't depend on external services (use mocks)
3. **Repeatability**: Tests produce same results regardless of environment
4. **Coverage**: Aim for 80%+ code coverage on critical paths
5. **Clarity**: Test names describe what they test and expected behavior

---

## Why Docker vs npm?

### Current Docker Approach
**Used for**: Production deployment only

**Advantages**:
- ✅ Consistent runtime environment across deployments
- ✅ Network isolation for security
- ✅ Easy integration with existing LiteLLM Docker stack
- ✅ Reproducible builds independent of host system
- ✅ Resource limits and container orchestration

**Disadvantages**:
- ❌ Slower startup time (~2-3s container exec overhead)
- ❌ Harder to debug (need to exec into container)
- ❌ Not suitable for rapid development/testing cycle
- ❌ Adds complexity for local development

### Recommended npm Approach for Development/Testing
**Should be used for**: Development, testing, debugging

**Advantages**:
- ✅ **Fast**: Instant startup, no container overhead
- ✅ **Simple**: Direct Node.js execution, easy debugging
- ✅ **Native IDE Support**: Breakpoints, step debugging, profiling
- ✅ **Test Runners**: Native integration with Jest, Vitest, Mocha
- ✅ **Hot Reload**: TypeScript watch mode for rapid iteration
- ✅ **Cross-platform**: Works on Windows, macOS, Linux natively

**Disadvantages**:
- ❌ Requires Node.js 18+ installed on host
- ❌ Potential environment differences (use nvm/nodenv to mitigate)

### Recommendation

**Use Docker for**:
- Production deployments
- Integration testing against real LiteLLM instances
- Containerized CI/CD pipelines
- Demonstrations and distributions

**Use npm for**:
- Local development (fast iteration)
- Unit testing (isolated, fast)
- Component testing (with mocks)
- Debugging and profiling
- VS Code extension testing

**Hybrid Approach**: Developers run `npm test` locally, CI runs tests in both npm (fast feedback) and Docker (deployment verification).

---

## Mock LiteLLM Instance Strategy

### Why Mock LiteLLM?

1. **Speed**: HTTP mocking is 100x faster than real API calls
2. **Reliability**: No network flakiness or rate limits
3. **Isolation**: Tests don't interfere with production data
4. **Determinism**: Control exact responses for edge cases
5. **Offline**: Develop/test without internet connection
6. **Cost**: No API usage costs during testing

### Mock Architecture

#### Option 1: HTTP Mocking Library (Recommended for Unit Tests)
**Tool**: `nock` or `msw` (Mock Service Worker)

**Advantages**:
- Intercepts axios requests at HTTP layer
- No code changes needed in MCP server
- Can test exact HTTP calls being made
- Easy to simulate errors (timeouts, 500s, malformed responses)

**Implementation Pattern**:
```typescript
// Pseudocode - NOT actual code
import nock from 'nock';

beforeEach(() => {
  nock('http://localhost:4001')
    .get('/models')
    .reply(200, { data: [{ id: 'gpt-4' }, { id: 'claude-3' }] });
});
```

#### Option 2: Mock Express Server (Recommended for Integration Tests)
**Tool**: `express` + test utilities

**Advantages**:
- Real HTTP server behavior
- Can test complex request/response flows
- Easier to understand than HTTP mocks
- Can be shared across test suites

**Implementation Pattern**:
```typescript
// Pseudocode - NOT actual code
class MockLiteLLMServer {
  private app: Express;
  private server: Server;
  
  start(port: number): Promise<void>
  stop(): Promise<void>
  addModel(modelId: string): void
  setError(endpoint: string, statusCode: number): void
  getRequestLog(): Array<Request>
}
```

#### Option 3: Fixture-based Testing (Recommended for E2E Tests)
**Tool**: JSON fixtures + conditional mocking

**Advantages**:
- Easy to version control test data
- Non-technical users can contribute test cases
- Realistic data structures from real API responses
- Great for regression testing

**Implementation Pattern**:
```typescript
// Pseudocode - NOT actual code
// tests/fixtures/litellm-responses.json
{
  "list_models_success": {
    "data": [...],
    "object": "list"
  },
  "list_models_error": {
    "error": "Invalid API key"
  }
}
```

### Mock Server Features Required

1. **Authentication Simulation**
   - Validate Bearer token format
   - Return 401 for invalid/missing keys
   - Support multiple test API keys

2. **Endpoint Coverage**
   - `GET /models` - List all models
   - `GET /models/{id}` - Get model info
   - `POST /key/generate` - Create virtual key
   - `GET /spend?user_id={id}` - Get spend data
   - `GET /health/liveliness` - Health check

3. **Error Simulation**
   - Network timeouts (configurable delay)
   - HTTP errors (400, 401, 403, 429, 500, 503)
   - Malformed JSON responses
   - Partial responses / truncated data
   - Rate limiting headers

4. **State Management**
   - Track created keys
   - Track spend per user
   - Reset state between tests
   - Support concurrent test execution

5. **Request Validation**
   - Verify correct headers sent
   - Validate request body schemas
   - Check query parameters
   - Log all requests for debugging

### Copilot Testing Integration

The mock server can be used by GitHub Copilot for:

1. **Automated PR Testing**
   - Spin up mock server in CI
   - Run full test suite against mock
   - No secrets or credentials needed
   - Fast feedback (~30s full suite)

2. **Local Development**
   - Developer runs `npm run mock-server`
   - MCP server connects to localhost:4001
   - Full manual testing without real LiteLLM

3. **Documentation Examples**
   - README includes examples using mock
   - Tutorials can be followed without setup
   - Screenshots/videos use predictable mock data

---

## Test Architecture

### Directory Structure

```
tests/
├── TEST_PLAN.md                    # This document
├── README.md                       # How to run tests
├── setup/
│   ├── global-setup.ts             # Jest/Vitest global setup
│   ├── global-teardown.ts          # Cleanup after all tests
│   └── test-helpers.ts             # Shared utilities
├── fixtures/
│   ├── litellm-responses.json      # Mock API responses
│   ├── mcp-requests.json           # Sample MCP protocol messages
│   └── error-scenarios.json        # Edge cases and errors
├── mocks/
│   ├── litellm-server.ts           # Mock LiteLLM HTTP server
│   ├── mcp-client.ts               # Mock MCP client for testing
│   └── http-interceptors.ts       # nock/msw interceptors
├── unit/
│   ├── tools.test.ts               # Individual tool handlers
│   ├── validation.test.ts          # Parameter validation
│   ├── error-handling.test.ts      # Error scenarios
│   └── config.test.ts              # Environment configuration
├── integration/
│   ├── mcp-protocol.test.ts        # MCP protocol compliance
│   ├── tool-calls.test.ts          # End-to-end tool execution
│   ├── authentication.test.ts      # API key handling
│   └── error-propagation.test.ts   # Error handling flows
├── e2e/
│   ├── docker-deployment.test.ts   # Docker container tests
│   ├── vscode-integration.test.ts  # VS Code MCP integration
│   └── performance.test.ts         # Load and performance tests
├── contract/
│   ├── litellm-api.contract.ts     # API contract tests
│   └── mcp-protocol.contract.ts    # MCP protocol contracts
└── manual/
    ├── test-scenarios.md            # Manual test cases
    └── smoke-tests.md               # Quick manual verification
```

### Test Stack

**Test Runner**: Vitest (faster, better TypeScript support than Jest)
- Modern, fast, ESM-native
- Built-in TypeScript support
- Parallel execution by default
- Watch mode with smart re-runs

**Assertion Library**: Vitest (built-in) or Chai
- Expressive assertions
- Good error messages
- TypeScript-friendly

**HTTP Mocking**: nock or msw
- Intercept axios requests
- Deterministic responses
- Error simulation

**Coverage**: v8 (Vitest built-in)
- Native V8 coverage (fastest)
- Branch and statement coverage
- HTML reports

**E2E Testing**: Playwright or custom stdio driver
- Test MCP protocol over stdio
- Simulate VS Code MCP client
- Docker container integration

---

## Test Levels

### Level 1: Unit Tests (Fast, Isolated)

**Scope**: Individual functions and modules
**Runtime**: <2 seconds total
**Dependencies**: None (all mocked)
**Coverage Target**: 90%+

#### Test Cases

**1.1 Tool Handler Functions**
- `list_models` returns formatted model list
- `get_model_info` fetches specific model
- `create_virtual_key` generates key with correct params
- `get_spend` retrieves user spend data
- Unknown tool returns error message

**1.2 Parameter Validation**
- `get_model_info` rejects non-string model parameter
- `create_virtual_key` rejects missing key_alias
- `create_virtual_key` rejects missing user_id
- `get_spend` rejects non-string user_id
- `list_models` accepts empty parameters

**1.3 Error Handling**
- AxiosError with response data includes details
- AxiosError without response shows generic message
- Non-AxiosError shows error message
- Network timeout handled gracefully
- Invalid JSON response handled

**1.4 Configuration**
- LITELLM_API_BASE defaults to http://localhost:4001
- LITELLM_MASTER_KEY reads from environment
- DEBUG mode enables logging
- DEBUG mode logs to stderr not stdout
- Authorization header includes Bearer token

**1.5 Response Formatting**
- Successful responses include text content
- Error responses include text content
- Model list formatted with count and newlines
- JSON responses pretty-printed with 2-space indent
- Empty responses handled gracefully

### Level 2: Integration Tests (Medium Speed, Controlled Dependencies)

**Scope**: Component interactions with mock LiteLLM
**Runtime**: <10 seconds total
**Dependencies**: Mock HTTP server
**Coverage Target**: 80%+

#### Test Cases

**2.1 MCP Protocol Compliance**
- Server responds to `initialize` request
- Server advertises `tools` capability
- Server responds to `tools/list` with all 4 tools
- Server responds to `tools/call` with results
- Server handles invalid JSON-RPC requests
- Server handles unsupported methods
- Server uses correct JSON-RPC 2.0 format

**2.2 Tool Call Flow**
- List models → HTTP GET /models → formatted response
- Get model info → HTTP GET /models/{id} → JSON response
- Create key → HTTP POST /key/generate → success message
- Get spend → HTTP GET /spend?user_id=X → spend data
- All tools include Authorization header

**2.3 Authentication Scenarios**
- Valid API key succeeds
- Missing API key returns 401 error (if server requires it)
- Invalid API key returns 401 error
- Expired API key handled gracefully
- Bearer token format correct

**2.4 Error Propagation**
- LiteLLM 400 error propagates to MCP response
- LiteLLM 404 error shows "not found" message
- LiteLLM 429 error shows rate limit message
- LiteLLM 500 error shows server error
- Network timeout shows timeout message
- Connection refused shows connection error

**2.5 Edge Cases**
- Empty model list handled
- Model with special characters in ID
- Very long model names (1000+ chars)
- User ID with special characters
- Concurrent tool calls don't interfere
- Large response bodies (1MB+) handled

### Level 3: End-to-End Tests (Slow, Real-like)

**Scope**: Complete workflows with Docker
**Runtime**: <60 seconds total
**Dependencies**: Docker, mock LiteLLM in container
**Coverage Target**: Critical paths only

#### Test Cases

**3.1 Docker Deployment**
- Docker image builds successfully
- Container starts without errors
- MCP server listens on stdio
- Environment variables propagate
- Debug logging works
- Container stops gracefully

**3.2 VS Code Integration**
- mcp.json configuration loads
- Server process starts via docker exec
- Tools appear in MCP client
- Tool calls execute successfully
- Errors display in UI correctly
- Server logs visible in output panel

**3.3 Performance**
- List models completes in <1s
- Get model info completes in <1s
- Create key completes in <2s
- Get spend completes in <1s
- 10 concurrent requests succeed
- 100 sequential requests don't leak memory

**3.4 Reliability**
- Server recovers from LiteLLM restart
- Server handles intermittent network errors
- Server continues after partial read on stdin
- Server logs errors without crashing
- Long-running session (1 hour) stable

### Level 4: Contract Tests

**Scope**: API compatibility verification
**Runtime**: <5 seconds
**Dependencies**: Real LiteLLM API schema/docs

#### Test Cases

**4.1 LiteLLM API Contract**
- /models endpoint returns expected schema
- /models/{id} endpoint returns expected schema
- /key/generate endpoint accepts expected body
- /spend endpoint returns expected schema
- Error responses match documented format

**4.2 MCP Protocol Contract**
- Tool schemas match MCP specification
- Response format matches MCP specification
- Error format matches MCP specification
- JSON-RPC 2.0 compliance verified

---

## Test Environment Setup

### Local Development

**Prerequisites**:
- Node.js 18+
- npm 9+
- Docker (optional, for E2E tests only)

**Setup Commands**:
```bash
# Install dependencies
npm install

# Install dev dependencies for testing
npm install --save-dev vitest @vitest/coverage-v8 nock @types/node

# Build TypeScript
npm run build

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Start mock LiteLLM server (for manual testing)
npm run mock-server
```

**package.json scripts to add**:
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:unit": "vitest run tests/unit",
    "test:integration": "vitest run tests/integration",
    "test:e2e": "vitest run tests/e2e",
    "test:coverage": "vitest run --coverage",
    "mock-server": "node tests/mocks/litellm-server.js"
  }
}
```

### Continuous Integration (GitHub Actions)

**Strategy**: Multi-stage testing for fast feedback

**Stage 1: Fast Checks (30s)**
- TypeScript compilation (`npm run build`)
- Linting (`eslint src/`)
- Unit tests (`npm run test:unit`)

**Stage 2: Integration (2m)**
- Integration tests with mock server
- Coverage report generation
- Coverage threshold enforcement (80%)

**Stage 3: E2E (5m)**
- Build Docker image
- Run E2E tests in container
- Docker smoke tests

**Stage 4: Contract Tests (1m)**
- Verify LiteLLM API compatibility
- Check MCP protocol compliance

### Test Data Management

**Fixtures**: Version-controlled JSON files
- Sample models list
- Sample API responses
- Error responses
- Edge case data

**Secrets**: Not needed for tests
- Mock server uses fake API keys
- Test keys in fixtures clearly marked as TEST
- No real credentials in tests

**State**: Reset between tests
- Mock server state cleared
- File system cleaned up
- Environment variables restored

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# Pseudocode - NOT actual YAML
name: Test MCP Server

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Setup Node.js 18
      - npm ci
      - npm run build
      - npm run test:unit
      - Upload coverage

  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Setup Node.js 18
      - npm ci
      - npm run build
      - Start mock server in background
      - npm run test:integration
      - Stop mock server

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Setup Docker
      - npm ci
      - npm run build
      - docker build -t test-mcp .
      - npm run test:e2e
      - Upload Docker logs if failed

  coverage:
    needs: [unit-tests, integration-tests]
    runs-on: ubuntu-latest
    steps:
      - Download all coverage reports
      - Merge coverage
      - Upload to Codecov
      - Comment on PR with coverage delta
```

### Pre-commit Hooks (Optional)

```bash
# Pseudocode - NOT actual script
- Run TypeScript compiler
- Run unit tests only (fast)
- Skip slow integration/e2e tests
- Auto-fix formatting issues
```

---

## Success Metrics

### Code Coverage
- **Unit Tests**: 90%+ coverage of src/
- **Integration Tests**: 80%+ coverage of critical paths
- **E2E Tests**: 100% coverage of user workflows

### Performance
- **Unit Tests**: Complete in <2s
- **Integration Tests**: Complete in <10s
- **E2E Tests**: Complete in <60s
- **Full Suite**: Complete in <90s

### Reliability
- **Flakiness**: <1% test failure rate unrelated to code changes
- **Determinism**: Tests pass consistently across runs
- **Isolation**: Tests don't interfere with each other

### Maintainability
- **Test-to-Code Ratio**: 1:1 or better (lines of test code ≥ lines of production code)
- **Documentation**: Every test case has descriptive name
- **Clarity**: Test failures point directly to root cause

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
- Set up Vitest test runner
- Create mock LiteLLM server (basic)
- Write first 10 unit tests
- Set up coverage reporting
- Document test patterns

### Phase 2: Core Coverage (Week 2)
- Complete unit test suite (all tools)
- Add parameter validation tests
- Add error handling tests
- Achieve 80%+ code coverage

### Phase 3: Integration (Week 3)
- Complete mock LiteLLM server (all endpoints)
- Write MCP protocol compliance tests
- Write tool call integration tests
- Add authentication tests

### Phase 4: E2E & Polish (Week 4)
- Set up Docker-based E2E tests
- Add performance tests
- Set up GitHub Actions CI
- Write test documentation
- Add manual test scenarios

---

## Open Questions / Decisions Needed

1. **Test Framework**: Vitest vs Jest vs Mocha?
   - Recommendation: **Vitest** (faster, better TS support, modern)

2. **HTTP Mocking**: nock vs msw vs custom server?
   - Recommendation: **nock for unit**, **express for integration**

3. **E2E Tool**: Playwright vs custom stdio driver?
   - Recommendation: **Custom stdio driver** (simpler, more direct)

4. **Coverage Tool**: v8 vs nyc vs c8?
   - Recommendation: **v8 (Vitest built-in)** (fastest, native)

5. **Mock Complexity**: How realistic should mock LiteLLM be?
   - Recommendation: **Start simple, add complexity as needed**

6. **CI Platform**: GitHub Actions vs other?
   - Recommendation: **GitHub Actions** (integrated, free for public repos)

---

## Appendices

### A. Example Test Structure

```typescript
// Pseudocode example - NOT actual test code
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { handleToolCall } from '../src/index';

describe('list_models tool', () => {
  beforeEach(() => {
    // Setup: Mock HTTP responses
    nock('http://localhost:4001')
      .get('/models')
      .reply(200, { data: [{ id: 'gpt-4' }, { id: 'claude-3' }] });
  });

  afterEach(() => {
    // Cleanup: Clear all mocks
    nock.cleanAll();
  });

  it('should list all available models', async () => {
    // Arrange
    const args = {};

    // Act
    const result = await handleToolCall('list_models', args);

    // Assert
    expect(result.content[0].text).toContain('gpt-4');
    expect(result.content[0].text).toContain('claude-3');
    expect(result.content[0].text).toContain('(2)');
  });

  it('should handle empty model list', async () => {
    // Arrange
    nock.cleanAll();
    nock('http://localhost:4001')
      .get('/models')
      .reply(200, { data: [] });

    // Act
    const result = await handleToolCall('list_models', {});

    // Assert
    expect(result.content[0].text).toContain('(0)');
  });

  it('should handle API errors gracefully', async () => {
    // Arrange
    nock.cleanAll();
    nock('http://localhost:4001')
      .get('/models')
      .reply(500, { error: 'Internal server error' });

    // Act
    const result = await handleToolCall('list_models', {});

    // Assert
    expect(result.content[0].text).toContain('Error calling LiteLLM API');
    expect(result.content[0].text).toContain('500');
  });
});
```

### B. Mock Server Interface

```typescript
// Pseudocode interface - NOT actual implementation
interface MockLiteLLMServer {
  // Lifecycle
  start(port: number): Promise<void>;
  stop(): Promise<void>;
  reset(): void;

  // Configuration
  setApiKey(key: string): void;
  requireAuth(required: boolean): void;
  setLatency(ms: number): void;

  // Data Management
  addModel(model: { id: string; object: string; created: number }): void;
  removeModel(id: string): void;
  setModels(models: Array<any>): void;

  // Error Simulation
  setError(endpoint: string, statusCode: number, body?: any): void;
  clearErrors(): void;
  simulateTimeout(endpoint: string, ms: number): void;

  // Request Inspection
  getRequests(): Array<{ method: string; path: string; headers: any; body: any }>;
  getLastRequest(): any;
  clearRequests(): void;

  // State Management
  getCreatedKeys(): Array<{ key: string; alias: string; user_id: string }>;
  getSpendData(userId: string): { spend: number; requests: number };
}
```

### C. Sample Test Output

```
PASS  tests/unit/tools.test.ts
  list_models tool
    ✓ should list all available models (5ms)
    ✓ should handle empty model list (3ms)
    ✓ should handle API errors gracefully (4ms)

  get_model_info tool
    ✓ should fetch specific model details (6ms)
    ✓ should reject non-string model parameter (2ms)
    ✓ should handle model not found (5ms)

  create_virtual_key tool
    ✓ should create key with valid parameters (7ms)
    ✓ should reject missing key_alias (2ms)
    ✓ should reject missing user_id (2ms)

  get_spend tool
    ✓ should retrieve spend data for user (6ms)
    ✓ should reject non-string user_id (2ms)

Test Suites: 1 passed, 1 total
Tests:       11 passed, 11 total
Time:        1.234s
Coverage:    92% statements, 88% branches, 95% functions, 91% lines
```

---

## Conclusion

This test plan provides a comprehensive, layered testing strategy that balances:
- **Speed**: Fast unit tests for quick feedback
- **Confidence**: Integration and E2E tests for real-world verification
- **Maintainability**: Clear structure and documentation
- **Practicality**: Uses npm for development, Docker for deployment

The mock LiteLLM server approach enables fast, reliable, offline testing while the hybrid Docker/npm strategy gives developers the best of both worlds.

**Recommended Next Steps**:
1. Review and approve this test plan
2. Implement Phase 1 (Foundation) 
3. Set up CI pipeline
4. Iterate based on real-world usage

---

**Document Version**: 1.0.0  
**Last Updated**: November 6, 2025  
**Author**: GitHub Copilot  
**Status**: Draft - Awaiting Review
