#!/usr/bin/env bash

# Copyright (c) 2022, RTE (http://www.rte-france.com)
# See AUTHORS.txt
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
# SPDX-License-Identifier: MPL-2.0
# This file is part of the OperatorFabric project.


# Script launch form the root of the git projet by github actions 

testFiles=$1
if [ -z $testFiles ] 
then
	testFiles="*"
fi


source $HOME/.sdkman/bin/sdkman-init.sh;
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
source ./bin/load_environment_light.sh;
cd config/docker
./startOpfabForCypress.sh
docker-compose logs --follow > ../../opfab.log &
cd ../../
# Set a more important timeout for CI/CD as it is usually slower than local computer 
export CYPRESS_defaultCommandTimeout=15000
./gradlew runSomeCypressTests -PspecFiles=$testFiles
status_code=$?
cd config/docker
docker-compose down
# propage the status code for github actions 
exit $status_code