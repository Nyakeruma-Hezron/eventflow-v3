FROM nginx:alpine
# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf
# Copy your custom config into the image
COPY nginx.conf /etc/nginx/conf.d/default.conf