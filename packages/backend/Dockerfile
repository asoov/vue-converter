# Use the official Node.js 18 image from Docker Hub
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy everything except files defined in .dockerignore to the working directory
COPY . .

# Install project dependencies
RUN yarn install

# Build the project
RUN yarn build

# Expose the port the app will run on (Optional, depending on your application)
EXPOSE 80

# Command to run the application
CMD ["yarn", "start:prod"]
