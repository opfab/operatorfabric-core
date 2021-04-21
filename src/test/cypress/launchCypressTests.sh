#!/bin/sh

# Copyright (c) 2021, RTE (http://www.rte-france.com)
# See AUTHORS.txt
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
# SPDX-License-Identifier: MPL-2.0
# This file is part of the OperatorFabric project.

# This scripts launches OpFab in full docker mode with the appropriate configuration for Cypress tests, then
# launches the cypress tests.
# Prerequisites:
# - This script assumes that no OperatorFabric instance is currently running in either mode.
# - Cypress must have been installed first (npm install)

# Launch OpFab and wait for it to start
cd ../../../config/docker || exit 1;
./docker-compose-cypress.sh
cd ../../src/test/resources || exit 1;
./waitForOpfabToStart.sh

# Run Cypress tests
cd ../cypress || exit 1;
./node_modules/.bin/cypress run --config video=false

