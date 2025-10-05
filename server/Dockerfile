FROM node:20-alpine

WORKDIR /app

# Copy package files first (for Docker caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

EXPOSE 3000

# Start the server
CMD ["npm", "start"]