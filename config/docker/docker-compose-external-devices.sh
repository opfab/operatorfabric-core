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

# Using an override file to launch the external-devices service and dummy device
docker-compose -f docker-compose.yml -f ./docker-compose.external-devices.override.yml -f ./docker-compose.dummy-device.override.yml up -d
