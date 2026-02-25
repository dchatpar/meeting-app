FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy backend code
COPY . .

# Expose port
EXPOSE 8493

# Start the server
CMD ["node", "server.js"]
