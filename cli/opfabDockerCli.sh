#!/bin/bash

# Copyright (c) 2024, RTE (http://www.rte-france.com)
# See AUTHORS.txt
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
# SPDX-License-Identifier: MPL-2.0
# This file is part of the OperatorFabric project.


CONFIG_FILE=$1
if [[ ! -f "$CONFIG_FILE" ]]; then
    docker run -v "$(pwd)":/opfab/host -u "$(id -u):$(id -g)" -it lfeoperatorfabric/of-opfab-cli:4.4.1.RELEASE
    exit
fi

# Display configurations and prompt the user to choose
echo "Available configurations:"
while IFS= read -r line; do
    IFS=' ' read -r -a params <<< "$line"
    echo " - ${params[0]}"
done < "$CONFIG_FILE"
echo "Enter the name of the configuration you want to use:"
read CONFIG_NAME

# Find the chosen configuration and set variables
while IFS= read -r line; do
    IFS=' ' read -r -a params <<< "$line"
    if [[ "${params[0]}" == "$CONFIG_NAME" ]]; then
        ENV_NAME="${params[1]}"
        OPFAB_URL="${params[2]}"
        OPFAB_PORT="${params[3]}"
        OPFAB_LOGIN="${params[4]}"
        OPFAB_PASSWORD="${params[5]}"
        break
    fi
done < "$CONFIG_FILE"

# Run the Docker command with the selected configuration
docker run -v "$(pwd)":/opfab/host -u "$(id -u):$(id -g)" -it -e ENV_NAME="$ENV_NAME" -e OPFAB_URL="$OPFAB_URL" -e OPFAB_PORT="$OPFAB_PORT" -e OPFAB_LOGIN="$OPFAB_LOGIN" -e OPFAB_PASSWORD="$OPFAB_PASSWORD" lfeoperatorfabric/of-opfab-cli:4.4.1.RELEASE