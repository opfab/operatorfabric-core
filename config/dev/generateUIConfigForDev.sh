#!/usr/bin/env bash

# Copyright (c) 2021-2024, RTE (http://www.rte-france.com)
# See AUTHORS.txt
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
# SPDX-License-Identifier: MPL-2.0
# This file is part of the OperatorFabric project.

# requires jq: https://stedolan.github.io/jq/

display_usage() {
	echo "This script applies dev-specific changes to the reference (config/docker) web-ui.json "
	echo "Usage: generateUIConfigForDev.sh\n"
}

pathToSourceConfigFolder="../docker/ui-config"
pathToTargetConfigFolder="../dev/ui-config"

mkdir -p $pathToTargetConfigFolder
cp $pathToSourceConfigFolder/* $pathToTargetConfigFolder
echo "Will generate base ui configuration for DEV. Source folder: $pathToSourceConfigFolder, target folder: $pathToTargetConfigFolder"


pathToTargetWebUIFile="$pathToTargetConfigFolder/web-ui.json"

../../src/test/resources/uiConfig/updatePropertyInJsonWithString.sh $pathToTargetWebUIFile "title" "OperatorFabric (Dev Mode)"
../../src/test/resources/uiConfig/updatePropertyInJsonWithString.sh $pathToTargetWebUIFile "environmentName" "DEV ENV"
../../src/test/resources/uiConfig/updatePropertyInJsonWithString.sh $pathToTargetWebUIFile "environmentColor" "green"




