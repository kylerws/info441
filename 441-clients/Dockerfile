# Stage 1 Build
FROM node:current-slim AS BUILD-STAGE
WORKDIR /app
COPY package.json package-lock.json ./

# run npm install
RUN npm install --only=production
RUN npm prune --production

# copy src files
COPY . ./
COPY default.conf ./
RUN npm run build

# Stage 2
FROM nginx:stable-alpine

# copy files from build
COPY --from=BUILD-STAGE /app/build /usr/share/nginx/html
COPY --from=BUILD-STAGE /app/default.conf /etc/nginx/conf.d

EXPOSE 80
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]