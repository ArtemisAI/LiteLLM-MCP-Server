# Plan to Publish `litellm-mcp-server` to npm

This document outlines the plan to prepare and publish the `litellm-mcp-server` project as a public npm package.

## 1. Pre-Publishing Checklist

### 1.1. Review and Update `package.json`

The `package.json` is the most important file for publishing to npm. We need to ensure all fields are accurate and complete.

- **`name`**: The name is good, but we should check for its availability on npm.
- **`version`**: The version should follow [Semantic Versioning (SemVer)](https://semver.org/). We should start with `1.0.0` for the initial release.
- **`description`**: The description is clear and concise.
- **`main`**: The entry point is `dist/index.js`. This is correct as it's a TypeScript project that needs to be compiled.
- **`bin`**: This is correctly configured to make the package an executable.
- **`scripts`**: The `prepare` script runs `npm run build`, which is good practice. This ensures the project is built before publishing.
- **`keywords`**: The keywords are relevant.
- **`author`**: The author information is present.
- **`license`**: The license is set to MIT, which is a good choice for open-source projects.
- **`repository`**: The repository URL is correct.
- **`bugs`**: The bugs URL is correct.
- **`homepage`**: The homepage URL is correct.
- **`dependencies`**: The dependencies are listed correctly.
- **`devDependencies`**: The dev dependencies are listed correctly.
- **`engines`**: The Node.js version requirement is specified.

### 1.2. Create a `.npmignore` File

To avoid publishing unnecessary files to npm (like source files, tests, and configuration files), we need to create a `.npmignore` file. This will keep the package small and clean.

The `.npmignore` file should include:

```
# Source files
src/

# Test files
tests/

# Configuration files
tsconfig.json
.gitignore

# Other development files
*.log
```

### 1.3. Update `README.md`

The `README.md` is the first thing users will see. It should be comprehensive and include:

- A clear and concise description of the project.
- Installation instructions (`npm install -g litellm-mcp-server`).
- Usage instructions, including how to run the server and any available command-line options.
- An example of how to use the server.
- Information on how to contribute to the project.
- License information.

### 1.4. Add a `CHANGELOG.md`

A `CHANGELOG.md` file is important for users to see what has changed between versions. We should create one and add an entry for the initial `1.0.0` release.

### 1.5. Testing

Before publishing, we need to make sure the project is working as expected.

- Run the test suite (if any).
- Manually test the server by installing it locally (`npm install -g .`) and running it.

## 2. Publishing to npm

### 2.1. Login to npm

You need to have an npm account and be logged in from your terminal.

```bash
npm login
```

### 2.2. Dry Run

Before publishing for real, it's a good practice to do a dry run to see what files will be included in the package.

```bash
npm publish --dry-run
```

This will show you a list of files that will be published. Review this list to make sure no unnecessary files are included.

### 2.3. Publish the Package

Once you are confident that everything is ready, you can publish the package.

```bash
npm publish
```

## 3. Post-Publishing

### 3.1. Verify on npm

Go to the npm website and check that the package is available and the page looks correct.

### 3.2. Tag the Release on GitHub

Create a new release on GitHub for the version you just published. This helps users to find the code for a specific version.

## Mermaid Diagram of the Process

```mermaid
graph TD
    A[Start] --> B{Pre-Publishing};
    B --> C[Review package.json];
    B --> D[Create .npmignore];
    B --> E[Update README.md];
    B --> F[Add CHANGELOG.md];
    B --> G[Testing];
    C & D & E & F & G --> H{Publishing};
    H --> I[npm login];
    H --> J[npm publish --dry-run];
    H --> K[npm publish];
    K --> L{Post-Publishing};
    L --> M[Verify on npm];
    L --> N[Tag release on GitHub];
    N --> O[End];