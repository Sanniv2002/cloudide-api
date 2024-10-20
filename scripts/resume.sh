#!/bin/bash

ALIAS=$1

sudo docker-compose -p "$ALIAS" -f "compose-files/docker-compose-${ALIAS}.yml" start