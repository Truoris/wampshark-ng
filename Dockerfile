FROM node:latest as build

WORKDIR /app

COPY package.json .

RUN npm install

FROM nginx:latest

COPY cdp.nginx.conf /etc/nginx/conf.d/default.conf
COPY . /usr/share/nginx/html/