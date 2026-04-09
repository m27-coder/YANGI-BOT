# Use Node.js 20 as base image
FROM node:20-slim

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (production only)
RUN npm install --omit=dev

# Copy app source
COPY . .

# Expose the port from index.js (default 8080)
EXPOSE 8080

# Start the application
CMD [ "npm", "start" ]
