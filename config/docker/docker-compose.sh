#!/bin/bash

echo USER_ID="$(id -u)" > .env
echo USER_GID="$(id -g)" >> .env
# create directory for bundle storage if not existing
mkdir -p businessconfig-storage
docker-compose up -d
