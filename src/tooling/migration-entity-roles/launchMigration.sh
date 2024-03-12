#!/bin/bash

#Copyright (c) 2024, RTE (http://www.rte-france.com)
#See AUTHORS.txt
#This Source Code Form is subject to the terms of the Mozilla Public
#License, v. 2.0. If a copy of the MPL was not distributed with this
#file, You can obtain one at http://mozilla.org/MPL/2.0/.
#SPDX-License-Identifier: MPL-2.0
#This file is part of the OperatorFabric project.


if [ "$#" -ne 4 ]; then
  echo "Error : invalid number of arguments"
  echo "Usage: "
  echo "./launchMigration.sh <IPorDNSNameMongoDB> <portMongoDB> <loginMongoDB> <passwordMongoDB>"
  exit 1
fi

docker-compose run migration-entity-roles $1 $2 $3 $4 "start"