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
	echo "This script updates the value for a given property in the specified json file. If the property doesn't exist, it is added."
	echo "Usage: updateCoreMenu.sh pathToJsonFile menu_id property value [pathToTargetJsonFile]\n"
	echo "menu_id: id of the menu to be updated. If it doesn't exist, it will be created."
	echo "property: visible or showOnlyForGroups."
	echo "value: true/false for visible, json-encoded array of groups for showOnlyForGroups (e.g. [\\\"GROUP_1\",\\\"GROUP_2\\\"])"
	echo "If pathToTargetJsonFile is absent, the source file will be updated."
	echo "Warning : Arguments shouldn't contain spaces \n"
}

export pathToSourceJsonFile=$1
export menu_id=$2
export property=$3
export value=$4
export pathToTargetJsonFile=$5

if [ -z "$pathToSourceJsonFile" ] || [ -z "$menu_id" ] || [ -z "$property" ] || [ -z "$value" ]
then
    display_usage
else
  if [ -z "$pathToTargetJsonFile" ]
  then pathToTargetJsonFile=$pathToSourceJsonFile
  fi

	(
  echo "Will update menu $menu_id with value $value for property $property. Source file: $pathToSourceJsonFile, target file: $pathToTargetJsonFile"

	export menuExists=$(jq --arg m "$menu_id" 'path(.coreMenusConfiguration[] | select(.id == $m))' $pathToSourceJsonFile)

	if [ -z "$menuExists" ]
	then # Create menu with given id and property
	  jq --arg m "$menu_id" --arg p $property --argjson v $value '.coreMenusConfiguration += [{id: $m, ($p): $v}]' $pathToSourceJsonFile > "tmp" && mv "tmp" $pathToTargetJsonFile
  else # Update existing menu
	  jq --arg m "$menu_id" --arg p $property --argjson v $value 'setpath(path(.coreMenusConfiguration[] | select(.id == $m)) | . += [$p]; $v)' $pathToSourceJsonFile > "tmp" && mv "tmp" $pathToTargetJsonFile
  fi
	)
fi
