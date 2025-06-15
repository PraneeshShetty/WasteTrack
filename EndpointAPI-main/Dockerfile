# Base image
FROM node:16.17

# Create app directory
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install app dependencies
RUN npm install

# Bundle app source
COPY . .

# Build the application
RUN npm run build

EXPOSE 3000

# Start the server using the production build
CMD ["npm", "run", "start:prod"]
