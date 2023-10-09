FROM node:latest as build

WORKDIR /app

COPY package.json .

RUN npm install

FROM nginx:latest

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY . /usr/share/nginx/html/
COPY --from=build /app/node_modules/ /usr/share/nginx/html/node_modules/