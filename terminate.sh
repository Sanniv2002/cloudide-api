#!/bin/bash

ALIAS=$1

docker-compose -p "$ALIAS" -f "compose-files/docker-compose-${ALIAS}.yml" down