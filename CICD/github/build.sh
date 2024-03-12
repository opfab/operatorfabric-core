#!/usr/bin/env bash

# Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
# See AUTHORS.txt
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
# SPDX-License-Identifier: MPL-2.0
# This file is part of the OperatorFabric project.


# Script launch form the root of the git projet by github actions 

export OF_VERSION=$(<VERSION)
docker-compose -f src/main/docker/test-environment/docker-compose.yml up -d
source $HOME/.sdkman/bin/sdkman-init.sh;
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
source ./bin/load_environment_light.sh;
echo "npm version $(npm -version)"
echo "node version $(node --version)"
sdk version
javac -version
export GRADLE_OPTS="-XX:MaxMetaspaceSize=512m -Xmx2g"
./gradlew --version
./gradlew --build-cache copyDependencies test jacocoTestReport  dockerTag${OF_VERSION} sonar
status_code=$?
docker-compose -f src/main/docker/test-environment/docker-compose.yml down
# propage the status code for github actions 
exit $status_code