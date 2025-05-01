# Use an official Node.js runtime as a parent image (choose a version)
FROM node:22-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code into the container
COPY . .

# Expose the port the app runs on (matches docker-compose and .env)
EXPOSE 5000

# Default command to run the app (docker-compose 'command:' will override this for dev)
CMD [ "npm", "start" ]