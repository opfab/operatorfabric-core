#!/bin/bash

# Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
# See AUTHORS.txt
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
# SPDX-License-Identifier: MPL-2.0
# This file is part of the OperatorFabric project.
 

source ${BASH_SOURCE%/*}/load_variables.sh

sdk install gradle 7.3
sdk use gradle 7.3
sdk install java 11.0.14-zulu
sdk use java 11.0.14-zulu
nvm install v14.15
nvm use v14.15
