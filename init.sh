#!/bin/bash

# This script generates a docker-compose file and also runs it
PROJECT_NAME=$1
ENV=$2

# Create the compose-files directory if it doesn't exist
COMPOSE_DIR="./compose-files"
mkdir -p "$COMPOSE_DIR"

# Function to find a free port
find_free_port() {
  local port
  while true; do
    port=$(shuf -i 2000-65000 -n 1)
    if ! nc -z localhost $port; then
      echo $port
      return 0
    fi
  done
}

APP_PORT=$3
REDIS_PORT=$(find_free_port)
echo -e "$APP_PORT"

NETWORK_NAME="${PROJECT_NAME}_network"
CACHE_VOLUME_NAME="cache_${PROJECT_NAME}"

if [[ "$ENV" == "node" ]]; then
  DOCKER_COMPOSE_TEMPLATE="version: \"3.7\"
      
services:
  runner:
    container_name: runner-${PROJECT_NAME}
    image: sanniv/scriptbox
    volumes:
      - ./src:/app/src
      - /app/node_modules
      - /host/path/to/files-${PROJECT_NAME}:/app/files
    tty: true
    stdin_open: true
    depends_on:
      - cache
    ports:
      - \"${APP_PORT}:8000\"
    networks:
      - \"${NETWORK_NAME}\"
    environment:
      - FILE_BASE_PATH=/app/files
      - TERM=xterm
    command: node dist/index.js

  queue_worker:
    container_name: queue_worker-${PROJECT_NAME}
    image: sanniv/scriptbox
    volumes:
      - ./src:/app/src
      - /app/node_modules
      - /host/path/to/files-${PROJECT_NAME}:/app/files
    depends_on:
      - cache
    networks:
      - \"${NETWORK_NAME}\"
    command: node dist/Service.QueueWorker/index.js

  cache:
    image: redis:6.2-alpine
    restart: always
    ports:
      - \"${REDIS_PORT}:6379\"
    networks:
      - \"${NETWORK_NAME}\"
    command: redis-server --save 20 1 --loglevel warning
    volumes:
      - \"${CACHE_VOLUME_NAME}:/data\"

networks:
  ${NETWORK_NAME}:
    driver: bridge

volumes:
  ${CACHE_VOLUME_NAME}:
    driver: local
"
elif [[ "$ENV" == "python" ]]; then 
  echo "Python compose file not found"
  exit 1
else
  echo "Environment $ENV does not exist"
  exit 1
fi

# Define compose file location in the compose-files folder
COMPOSE_FILE="${COMPOSE_DIR}/docker-compose-${PROJECT_NAME}.yml"
echo "$DOCKER_COMPOSE_TEMPLATE" > "$COMPOSE_FILE"

# Navigate to the compose-files directory and run the docker-compose file
docker-compose -p "$PROJECT_NAME" -f "$COMPOSE_FILE" up -d

# Print out project details
echo -e "$APP_PORT"