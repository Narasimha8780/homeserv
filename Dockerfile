FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Baked into the static build at build time (Vite env vars are compile-time).
# Pass the backend's public URL here when building the image, e.g.:
#   --build-arg VITE_API_URL=https://homeserv-api-xxxxx.run.app/api
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

FROM node:20-alpine

WORKDIR /app
RUN npm install -g serve

COPY --from=build /app/dist ./dist

ENV PORT=8080
EXPOSE 8080

# -s enables SPA fallback (all routes serve index.html)
CMD ["sh", "-c", "serve -s dist -l ${PORT}"]
