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
	echo "This script deletes the core menu with the given id in the specified json file."
	echo "Usage: deleteCoreMenu.sh pathToJsonFile menu_id [pathToTargetJsonFile]\n"
	echo "If pathToTargetJsonFile is absent, the source file will be updated."
	echo "Warning : Arguments shouldn't contain spaces \n"
}

export pathToSourceJsonFile=$1
export menu_id=$2
export pathToTargetJsonFile=$3
if [ -z "$pathToSourceJsonFile" ] || [ -z "$menu_id" ]
then
    display_usage
else
  if [ -z "$pathToTargetJsonFile" ]
  then pathToTargetJsonFile=$pathToSourceJsonFile
  fi
	echo "Will remove core menu with id: $menu_id. Source file: $pathToSourceJsonFile, target file: $pathToTargetJsonFile"

  jq --arg m "$menu_id" 'del(.coreMenusConfiguration[] | select(.id == $m))' $pathToSourceJsonFile > "tmp" && mv "tmp" $pathToTargetJsonFile

fi
