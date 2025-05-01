# Use an official Node.js runtime as a parent image
FROM node:22-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Vite default port (ensure vite.config.js doesn't change this unless intended)
EXPOSE 5173

# Default command (docker-compose 'command:' will override this for dev)
# The dev command often needs '--host' to be accessible outside the container
CMD [ "npm", "run", "start", "--", "--host" ]