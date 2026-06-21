# TACT portal — build the static Vite SPA, then serve it with nginx.
# Pure static site: no backend, no secrets.

# ---- stage 1: build ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- stage 2: serve ----
FROM nginx:alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
