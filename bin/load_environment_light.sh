#!/bin/bash

# Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
# See AUTHORS.txt
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
# SPDX-License-Identifier: MPL-2.0
# This file is part of the OperatorFabric project.
 

source ${BASH_SOURCE%/*}/load_variables.sh

sdk install java 17.0.13-zulu
sdk use java 17.0.13-zulu
nvm install v22.13.0
nvm use v22.13.0
echo "Install opfab-cli"
(
    cd $OF_HOME/cli/src
    npm install #Need first an install to download all necessary module
    npm install -g #Need global install to have the command opfab available
)
source $OF_HOME/cli/loadCompletion.sh
