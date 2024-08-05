#!/bin/bash

# Copyright (c) 2024, RTE (http://www.rte-france.com)
# See AUTHORS.txt
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
# SPDX-License-Identifier: MPL-2.0
# This file is part of the OperatorFabric project.

[[ -f .env-dev ]] && source .env-dev
if [ -z "${MY_DOCKER_HOST}" ]; then
  MY_DOCKER_HOST=172.17.0.1
fi

# Generate dev configuration
sed "s/\${MY_DOCKER_HOST}/$MY_DOCKER_HOST/g" ./nginx.conf.template > ./nginx.conf
../cypress/generateUIConfigForCypress.sh

# Using an override file to launch docker compose while mounting the cypress-specific ui configuration
docker compose -f docker-compose.yml -f ../cypress/docker-compose.ui-config.override.yml up -d

