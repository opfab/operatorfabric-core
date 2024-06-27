#!/bin/sh

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
# Add opfab-cli to the prompt in red
export PS1="\033[31mOPFAB-CLI\033[0m \w \$ "
cd /opfab/host
/bin/sh