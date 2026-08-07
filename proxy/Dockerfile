# Front door for the shared "Novagentic" Web App's multi-container setup
# (see ../azure-compose.yml). The only container exposed to the internet —
# routes by Host header to either the novagentic or palier container over
# the compose network. See nginx.conf for why: those two apps stay
# completely unaware of each other and of this proxy existing at all.
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
