# Contributing to LiteLLM MCP Server

Thank you for your interest in contributing! This document provides guidelines for participating in the project.

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. All contributors are expected to:

- Be respectful and inclusive
- Welcome feedback and criticism
- Focus on constructive dialogue
- Report violations to maintainers

## Getting Started

### Prerequisites

- Python 3.11+
- Docker & Docker Compose
- Git
- Running LiteLLM instance for testing

### Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/LiteLLM-MCP-Server.git
   cd LiteLLM-MCP-Server
   ```
3. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. Set up development environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r mcp_server/requirements.txt
   ```

## Development Workflow

### Code Style

- Follow PEP 8 guidelines
- Use type hints for all functions
- Write descriptive docstrings
- Maximum line length: 100 characters
- Use meaningful variable names

### Testing

Before submitting a pull request:

```bash
# Test your changes with a running LiteLLM instance
docker exec litellm_mcp python __main__.py

# Check for common issues
python -m pylint mcp_server/

# Format code
python -m black mcp_server/
```

### Commit Messages

Use clear, descriptive commit messages following conventional commits:

```
feat: Add new feature description
fix: Fix bug description
docs: Update documentation
chore: Maintenance tasks
refactor: Code refactoring
test: Add/update tests
security: Security-related changes
```

Examples:

```
feat: Add user spend tracking endpoint
fix: Handle timeout in API calls gracefully
docs: Update deployment guide with examples
security: Sanitize environment variable logging
```

## Submitting Changes

### Step-by-Step Process

1. **Fork & Branch**: Create a feature branch from `001-mcp-litellm-server`
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make Changes**: Implement your feature or fix
   - Keep commits atomic and focused
   - Update documentation if needed
   - Add comments for complex logic

3. **Test Thoroughly**:
   - Test with your LiteLLM instance
   - Verify no secrets are hardcoded
   - Check for breaking changes

4. **Commit & Push**:
   ```bash
   git commit -m "feat: your feature description"
   git push origin feature/your-feature
   ```

5. **Create Pull Request**: Submit PR with detailed description

### Pull Request Template

When creating a PR, please include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Breaking change

## Related Issues
Closes #123

## Testing
- [ ] Tested with running LiteLLM instance
- [ ] No secrets in code
- [ ] Backward compatible

## Checklist
- [ ] Code follows style guidelines
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new security warnings
- [ ] No hardcoded secrets
```

## Reporting Issues

Use GitHub Issues to report bugs or suggest features.

### Bug Report Template

```markdown
## Description
Clear description of the bug

## Steps to Reproduce
1. ...
2. ...
3. ...

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: 
- Python: 
- Docker: 
- LiteLLM version: 

## Logs/Screenshots
Relevant logs or error messages
```

### Feature Request Template

```markdown
## Description
Clear description of the feature

## Use Case
Why is this feature needed?

## Proposed Solution
Your suggestion for implementation

## Alternatives
Other possible approaches
```

## Documentation

Updates to documentation are as important as code changes!

- **README.md**: User-facing project information
- **DEPLOYMENT.md**: Deployment instructions
- **SECURITY.md**: Security guidelines
- **Code comments**: Complex logic explanation
- **Docstrings**: Function/class documentation

### Documentation Standards

```python
def create_virtual_key(key_alias: str, user_id: str) -> dict:
    """
    Create a new virtual API key.
    
    Args:
        key_alias: Friendly name for the key (e.g., 'production-api')
        user_id: User identifier to associate with the key
        
    Returns:
        Dictionary containing the new API key and metadata
        
    Raises:
        ValueError: If key_alias or user_id is empty
        ConnectionError: If unable to connect to LiteLLM API
        
    Example:
        >>> key = create_virtual_key('my-key', 'user-123')
        >>> print(key['key'])
        sk-xxxxx...
    """
```

## Code Review Process

All contributions go through code review:

1. ✅ Functionality check - Does it work?
2. ✅ Security check - Are there vulnerabilities?
3. ✅ Style check - Does it follow guidelines?
4. ✅ Documentation check - Is it documented?
5. ✅ Tests check - Are there tests?

Reviewers may request changes. Please address them promptly.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions or Need Help?

Feel free to:

- 📖 Check [README.md](README.md) and [DEPLOYMENT.md](DEPLOYMENT.md)
- 💬 Open a GitHub Discussion
- 🐛 Create an issue for clarification
- 📧 Email: contributors@artemisai.com

Thank you for contributing! 🙏
