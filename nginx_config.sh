#!/bin/bash

NGINX_CONF_FILE="/etc/nginx/conf.d/resource_domains.conf"
# NGINX_CONF_FILE="./resource_domains.conf"

add_server() {
  local domain=$1
  local port=$2

  if grep -q "${domain};" "$NGINX_CONF_FILE"; then
    echo "Server block for ${domain} already exists!"
  else
    cat <<EOL >> "$NGINX_CONF_FILE"

server {
    listen          80;
    server_name     ${domain};

    proxy_set_header Host \$host;
    proxy_set_header X-Forwarded-For \$remote_addr;

    location / {
        proxy_pass http://localhost:${port}/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOL
    echo "Added server block for ${domain} on port ${port}."
    sudo systemctl reload nginx
  fi
}

# Function to clear a server configuration
clear_nginx_config() {
  local config_file="$NGINX_CONF_FILE"

  # Check if the config file exists
  if [[ -f "$config_file" ]]; then
    sudo truncate -s 0 "$config_file"  # Clear the file content
    echo "Cleared the Nginx configuration file: $config_file"
  else
    echo "Configuration file not found: $config_file"
  fi
}

# Main Script
if [[ $# -lt 1 ]]; then
  echo "Usage: $0 {add|clear} [domain] [port]"
  exit 1
fi

ACTION=$1
DOMAIN=$2
PORT=$3

if [[ "$ACTION" == "add" ]]; then
  if [[ -z "$PORT" ]]; then
    echo "Port is required for adding a server."
    exit 1
  fi
  add_server "$DOMAIN" "$PORT"
elif [[ "$ACTION" == "clear" ]]; then
  clear_nginx_config
else
  echo "Invalid action. Use 'add' or 'clear'."
  exit 1
fi