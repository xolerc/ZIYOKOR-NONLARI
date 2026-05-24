FROM node:22-alpine
WORKDIR /app
COPY p2p/package.json p2p/package-lock.json ./
RUN npm ci --only=production
COPY p2p/ .
EXPOSE 3456
CMD ["node", "server.js"]
