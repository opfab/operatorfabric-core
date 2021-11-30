#!/usr/bin/env bash

# Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
# See AUTHORS.txt
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
# SPDX-License-Identifier: MPL-2.0
# This file is part of the OperatorFabric project.

SOURCE="${BASH_SOURCE[0]}"
while [ -h "$SOURCE" ]; do # resolve $SOURCE until the file is no longer a symlink
  DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"
  SOURCE="$(readlink "$SOURCE")"
  [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE" # if $SOURCE was a relative symlink, we need to resolve it relative to the path where the symlink file was located
done
DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"
export OF_HOME=$(realpath $DIR/..)

export OF_VERSION=$(cat "$OF_HOME/VERSION")

export OF_CLIENT_REL_COMPONENTS=( "cards" "users" "businessconfig" "external-devices")

echo "OPERATORFABRIC ENVIRONMENT VARIABLES"
echo
echo OF_HOME=$OF_HOME
echo OF_VERSION=$OF_VERSION

index=0
for prj in "${OF_CLIENT_REL_COMPONENTS[@]}"; do
    echo OF_CLIENT_REL_COMPONENTS[$index]=$prj
    index=$((index + 1))
done

