#!/usr/bin/env bash

# Copyright (c) 2022-2024, RTE (http://www.rte-france.com)
# See AUTHORS.txt
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
# SPDX-License-Identifier: MPL-2.0
# This file is part of the OperatorFabric project.


# Script launched from the root of the git project by github actions  

source $HOME/.sdkman/bin/sdkman-init.sh;
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
source ./bin/load_environment_light.sh;
cd config/docker
./startOpfabInProductionMode.sh
cd ../../src/test/api/karate
./launchAll.sh
status_code=$?
cd ../../../../config/docker
docker compose down --remove-orphans
# propagate the status code for github actions
exit $status_code