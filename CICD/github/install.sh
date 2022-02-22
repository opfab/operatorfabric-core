#!/usr/bin/env bash

# Copyright (c) 2022, RTE (http://www.rte-france.com)
# See AUTHORS.txt
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
# SPDX-License-Identifier: MPL-2.0
# This file is part of the OperatorFabric project.


# Script launch form the root of the git projet by github actions 

curl -s "https://get.sdkman.io" | bash ;
echo sdkman_auto_answer=true > $HOME/.sdkman/etc/config ;
echo sdkman_auto_selfupdate=true >> $HOME/.sdkman/etc/config ;
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
sudo apt-get install jq
git config --global user.email "opfabtech@gmail.com" 
git config --global user.name "OpfabTech"