#!/bin/bash

# Copyright (c) 2024, RTE (http://www.rte-france.com)
# See AUTHORS.txt
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
# SPDX-License-Identifier: MPL-2.0
# This file is part of the OperatorFabric project.

echo -e ""
echo -e "  ______   .______    _______    ___      .______                   ______  __       __  "
echo -e " /  __  \  |   _  \  |   ____|  /   \     |   _  \                 /      ||  |     |  | "
echo -e "|  |  |  | |  |_)  | |  |__    /  ^  \    |  |_)  |     ______    |  ,----'|  |     |  | "
echo -e "|  |  |  | |   ___/  |   __|  /  /_\  \   |   _  <     |______|   |  |     |  |     |  | "
echo -e "|  \`--'  | |  |      |  |    /  _____  \  |  |_)  |               |  \`----.|  \`----.|  | "
echo -e " \______/  | _|      |__|   /__/     \__\ |______/                 \______||_______||__| "
echo -e "                                                                                         "
echo -e ""

export HOME=/opfab
if [ -z "$ENV_NAME" ]; then
    # Add opfab-cli to the prompt in red
    export PS1="\033[32mOPFAB-CLI\033[0m \w \$ "
else
    export PS1="\033[32mOPFAB-CLI\033[0m - \033[31m$ENV_NAME\033[0m \w \$ "
fi

if [ -n "$OPFAB_URL" ]; then
    opfab login $OPFAB_URL $OPFAB_PORT $OPFAB_LOGIN  $OPFAB_PASSWORD
else
    echo "No configuration provided. Please run 'opfab login' to login in to OperatorFabric."
fi

cd /opfab/host
/bin/bash