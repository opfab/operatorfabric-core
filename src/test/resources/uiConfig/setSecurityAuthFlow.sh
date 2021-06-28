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
	echo "This script changes the security property in the web-ui.json to "
	echo "Usage: setSecurityAuthFlow.sh environment flow\n"
	echo "environment: (dev, docker)\n"
	echo "flow: (CODE, IMPLICIT, PASSWORD)"
	echo "Example: setSecurityAuthFlow.sh dev CODE sets the authorization flow to CODE in the web-ui.json used in dev mode.\n"
	echo "Warning : The docker configuration is version-controlled, so make sure not to commit the changes."
}

environment=$1
flow=$2
if [ -z "$environment" ] || [ -z "$flow" ]
then
    display_usage
else
	(
	  [[ $environment == 'dev' || $environment == 'docker' ]] || { echo "Unrecognized environment $environment. No changes made."; exit 1; }
	  [[ $flow == 'CODE' || $flow == 'IMPLICIT' || $flow == 'PASSWORD' ]] || { echo "Unrecognized flow $flow. No changes made."; exit 1; }

    pathToConfigFile="../../../../config/$environment/ui-config/web-ui.json"
    pathToSnippetFile="./security-$flow-flow.json"
    ./updatePropertyInJsonWithSnippet.sh $pathToConfigFile security $pathToSnippetFile
	)
fi
