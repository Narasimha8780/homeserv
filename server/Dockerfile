FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src

ENV NODE_ENV=production
# Cloud Run injects PORT; the app already reads process.env.PORT.
EXPOSE 8080

CMD ["node", "src/index.js"]
