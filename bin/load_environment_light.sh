#!/bin/bash

# Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
# See AUTHORS.txt
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
# SPDX-License-Identifier: MPL-2.0
# This file is part of the OperatorFabric project.
 

. ${BASH_SOURCE%/*}/load_variables.sh

sdk use gradle 6.5.1
sdk use java 8.0.265-zulu
sdk use maven 3.5.3
nvm use v10.16.3
