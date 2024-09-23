#!/usr/bin/env bash

# Copyright (c) 2022-2024, RTE (http://www.rte-france.com)
# See AUTHORS.txt
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
# SPDX-License-Identifier: MPL-2.0
# This file is part of the OperatorFabric project.
 
echo "Set mongo version to mongo:5.0.28-focal"
sed -i "s/mongo:.*$/mongo:5.0.28-focal/g" config/docker/docker-compose.yml