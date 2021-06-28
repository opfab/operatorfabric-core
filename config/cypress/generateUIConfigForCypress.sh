#!/usr/bin/env bash

# Copyright (c) 2021, RTE (http://www.rte-france.com)
# See AUTHORS.txt
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
# SPDX-License-Identifier: MPL-2.0
# This file is part of the OperatorFabric project.

# requires jq: https://stedolan.github.io/jq/

display_usage() {
	echo "This script applies Cypress-specific changes to reference (config/docker) web-ui.json and ui-menu.json"
	echo "Usage: generateUIConfigForCypress.sh\n"
}

pathToSourceConfigFolder="../docker/ui-config"
pathToTargetConfigFolder="../cypress/ui-config"

mkdir -p $pathToTargetConfigFolder

pathToTargetWebUIFile="$pathToTargetConfigFolder/web-ui.json"
pathToTargetUIMenuFile="$pathToTargetConfigFolder/ui-menu.json"

cp $pathToSourceConfigFolder/* $pathToTargetConfigFolder

echo "Will generate base ui configuration for Cypress. Source folder: $pathToSourceConfigFolder, target folder: $pathToTargetConfigFolder"

# web-ui.json customization
pathToTargetWebUIFile="$pathToTargetConfigFolder/web-ui.json"

../../src/test/resources/uiConfig/updatePropertyInJsonWithString.sh $pathToTargetWebUIFile "environmentName" "CYPRESS TEST ENV"
../../src/test/resources/uiConfig/updatePropertyInJson.sh $pathToTargetWebUIFile "feed.card.secondsBeforeLttdForClockDisplay" 3700

# ui-menu.json customization
# None needed so far

# creation of "XXX-base.json" copies of config files to serve as reference to reset configuration after tests
cp "$pathToTargetConfigFolder/web-ui.json" "$pathToTargetConfigFolder/web-ui-base.json"
cp "$pathToTargetConfigFolder/ui-menu.json" "$pathToTargetConfigFolder/ui-menu-base.json"


