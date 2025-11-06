FROM node:18-slim

WORKDIR /app

# Copy package file only (no package-lock to avoid npm bugs in Docker)
COPY package.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy pre-built application
COPY dist/ ./dist/

# Run the server
CMD ["node", "dist/index.js"]
