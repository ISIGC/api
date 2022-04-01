FROM node:current-alpine
WORKDIR /app
COPY . .
RUN apk add --no-cache make gcc g++ python3 && \
  npm install && \
  npm rebuild bcrypt --build-from-source && \
  apk del make gcc g++ python3
CMD ["node", "server.js"]