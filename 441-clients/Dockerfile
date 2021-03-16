# Stage 1 Build
FROM node:current-slim AS BUILD
# set the current working directory to /app
WORKDIR /app
# copy only package.json and package-lock.json
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
# WORKDIR /app
# copy files from build
COPY --from=BUILD /app/build /user/share/nginx/html
# COPY default.conf /etc/nginx/conf.d/default.conf
COPY --from=BUILD /app/default.conf /etc/nginx/conf.d/default.conf
# COPY --from=BUILD /app/node_modules ./node_modules
# declare that your server will listen on port 80
EXPOSE 80
EXPOSE 443
# set the entrypoint command
CMD ["nginx", "-g", "daemon off;"]