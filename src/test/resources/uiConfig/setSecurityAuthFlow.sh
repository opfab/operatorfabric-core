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
	echo "Usage : setSecurityAuthFlow.sh flow"
	echo "flow : (CODE, IMPLICIT, PASSWORD)"
	echo "Example : setSecurityAuthFlow.sh CODE sets the authorization flow to CODE in the web-ui.json."
	echo "Warning : The configuration is version-controlled, so make sure not to commit the changes."
}

flow=$1
if [ "$#" -ne 1 ] || [ -z "$flow" ]
then
    display_usage
else
	(
	  [[ $flow == 'CODE' || $flow == 'IMPLICIT' || $flow == 'PASSWORD' ]] || { echo "Unrecognized flow $flow. No changes made."; exit 1; }

    pathToConfigFile="../../../../config/docker/ui-config/web-ui.json"
    pathToSnippetFile="./security-$flow-flow.json"
    ./updatePropertyInJsonWithSnippet.sh $pathToConfigFile security $pathToSnippetFile

    pathToScriptUpdatingDevEnv="../../../../config/dev/"
    cd $pathToScriptUpdatingDevEnv
    ./generateUIConfigForDev.sh
    cd -
	)
fi
