FROM nginx:1.27-alpine

COPY index.html /usr/share/nginx/html/index.html
COPY css/      /usr/share/nginx/html/css/
COPY js/       /usr/share/nginx/html/js/
COPY vendor/   /usr/share/nginx/html/vendor/
COPY img/      /usr/share/nginx/html/img/

EXPOSE 80
