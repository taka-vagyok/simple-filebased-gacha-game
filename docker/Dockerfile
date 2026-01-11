FROM node:18-alpine

WORKDIR /app

# Create directory structure for server
WORKDIR /app/docker

# Install dependencies
COPY docker/package.json ./
RUN npm install

# Copy server code
COPY docker/server.js ./

# Copy frontend code to parent directory
COPY gacha.html ../

# Expose port
EXPOSE 8000

# Start server
CMD ["npm", "start"]
