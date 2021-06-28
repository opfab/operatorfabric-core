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
	echo "Usage: updatePropertyInJson.sh pathToJsonFile property value [pathToTargetJsonFile]\n"
	echo "If pathToTargetJsonFile is absent, the source file will be updated."
	echo "Warning : Arguments shouldn't contain spaces \n"
}

export pathToSourceJsonFile=$1
export property=$2
export value=$3
export pathToTargetJsonFile=$4
if [ -z "$pathToSourceJsonFile" ] || [ -z "$property" ] || [ -z "$value" ]
then
    display_usage
else
  if [ -z "$pathToTargetJsonFile" ]
  then pathToTargetJsonFile=$pathToSourceJsonFile
  fi
	echo "Will update $property with $value. Source file: $pathToSourceJsonFile, target file: $pathToTargetJsonFile"
	(

	# Transform "foo.bar" property to '["foo","bar"]' as expected by the jq setpath method
  tempProperty=($(echo "$property" | tr "." " "));
  printf -v propertyPathArray ',"%s"' "${tempProperty[@]}"   # yields ,"foo","bar"
  propertyPathArray=[${propertyPathArray:1}]                  # remove the leading ','

  jq --argjson p "$propertyPathArray" --argjson v $value 'setpath($p; $v)' $pathToSourceJsonFile > "tmp" && mv "tmp" $pathToTargetJsonFile

	)
fi


# --argjson rather than --arg is necessary for the value otherwise 123 is transformed to "123" and true to "true"
# The downside is that plain strings can't be passed as someValue or "someValue" anymore, they need to be "\"someValue\""
# The upside is that more complex values can be passed such as "{\"bar\":\"someNestedValue\"}"


#./updatePropertyInJson.sh cypress.json "foo2" 123
#./updatePropertyInJson.sh cypress.json "foo2" true
#./updatePropertyInJson.sh cypress.json "foo2" "\"bar\""
#./updatePropertyInJson.sh cypress.json "foo2" "{\"bar\":\"blah\"}"
# No spaces