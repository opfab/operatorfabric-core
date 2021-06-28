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
	echo "This script removes a given property in the specified json file."
	echo "Usage: removePropertyInJson.sh pathToJsonFile property [pathToTargetJsonFile]\n"
	echo "If pathToTargetJsonFile is absent, the source file will be updated."
	echo "Note : If the property doesn't exist, the script doesn't throw an error but logs a message. \n"
}

# Todo add option to remove property

export pathToSourceJsonFile=$1
export property=$2
export pathToTargetJsonFile=$3
if [ -z "$pathToSourceJsonFile" ] || [ -z "$property" ]
then
    display_usage
else
  if [ -z "$pathToTargetJsonFile" ]
  then pathToTargetJsonFile=$pathToSourceJsonFile
  fi
	echo "Will remove $property. Source file: $pathToSourceJsonFile, target file: $pathToTargetJsonFile"
	(

	# Transform "foo.bar" property to '["foo","bar"]' as expected by the jq setpath method
  tempProperty=($(echo "$property" | tr "." " "));
  printf -v propertyPathArray ',"%s"' "${tempProperty[@]}"   # yields ,"foo","bar"
  propertyPathArray=[[${propertyPathArray:1}]]                  # remove the leading ','

  jq --argjson p "$propertyPathArray"  'delpaths($p)' $pathToSourceJsonFile > "tmp" && mv "tmp" $pathToTargetJsonFile
	)
fi
