#!/bin/bash

echo USER_ID="$(id -u)" > .env
echo USER_GID="$(id -g)" >> .env
docker-compose up -d
