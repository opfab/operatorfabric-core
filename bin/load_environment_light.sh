#!/bin/bash

# Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
# See AUTHORS.txt
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
# SPDX-License-Identifier: MPL-2.0
# This file is part of the OperatorFabric project.
 

source ${BASH_SOURCE%/*}/load_variables.sh

sdk install gradle 6.8.3
sdk use gradle 6.8.3
# the java version is externalized because also needed for travis configuration
sdk install java $(<JAVA_VERSION)-zulu
sdk use java $(<JAVA_VERSION)-zulu
nvm install v10.16.3
nvm use v10.16.3
