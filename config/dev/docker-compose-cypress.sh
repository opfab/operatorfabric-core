#!/bin/bash

echo "Usage: "
echo "   1: ./docker-compose.sh"
echo "   2: ./docker-compose.sh <pathToExternalEnvironmentFile>"

echo USER_ID="$(id -u)" > .env
echo USER_GID="$(id -g)" >> .env
# create directory for bundle storage if not existing
mkdir -p businessconfig-storage
if [ "$#" -eq 0 ]; then
  echo CONFIG_PATH=./ >> .env
  echo SPRING_PROFILES_ACTIVE=docker >> .env
else
  EXTERNAL_CONFIGURATION_FILE=$1
  CONFIG_PATH=$(dirname "$1")
  cat ${EXTERNAL_CONFIGURATION_FILE} >> .env
  echo CONFIG_PATH="$CONFIG_PATH" >> .env
fi
cat .env
# Using an override file to launch docker-compose while mounting the web-ui-cypress.json file instead of the
# regular one. In particular, this is needed to use PASSWORD flow as Cypress doesn't allow cross-origin navigation
docker-compose -f docker-compose.yml -f docker-compose.cypress.override.yml up -d
