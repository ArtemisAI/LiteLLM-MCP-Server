FROM node:18-slim

WORKDIR /app

# Copy package files
COPY package.json tsconfig.json ./
COPY src/ ./src/

# Install all dependencies (including dev for build)
RUN npm install

# Build TypeScript
RUN npm run build

# Remove dev dependencies to reduce image size
RUN npm prune --omit=dev

# Run the server
CMD ["node", "dist/index.js"]
