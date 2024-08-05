#!/bin/bash

# Copyright (c) 2024, RTE (http://www.rte-france.com)
# See AUTHORS.txt
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
# SPDX-License-Identifier: MPL-2.0
# This file is part of the OperatorFabric project.

echo "Usage: "
echo "   1: ./startOpfabForCypress.sh"
echo "   2: ./startOpfabForCypress.sh <pathToExternalEnvironmentFile>"

echo USER_ID="$(id -u)" > .env
echo USER_GID="$(id -g)" >> .env
# create directory for bundle storage if not existing
mkdir -p businessconfig-storage
if [ "$#" -eq 0 ]; then
  echo CONFIG_PATH=./ >> .env
else
  EXTERNAL_CONFIGURATION_FILE=$1
  CONFIG_PATH=$(dirname "$1")
  cat ${EXTERNAL_CONFIGURATION_FILE} >> .env
  echo CONFIG_PATH="$CONFIG_PATH" >> .env
fi
cat .env
../cypress/generateUIConfigForCypress.sh

# Using an override file to launch docker compose while mounting the cypress-specific ui configuration
docker compose -f docker-compose.yml -f ../cypress/docker-compose.ui-config.override.yml -f docker-compose.nginx-cors-permissive.override.yml up -d
(
  cd ../../bin
  ./waitForOpfabToStart.sh
)