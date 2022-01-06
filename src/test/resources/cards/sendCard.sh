#!/bin/bash

# Copyright (c) 2021, RTE (http://www.rte-france.com)
# See AUTHORS.txt
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
# SPDX-License-Identifier: MPL-2.0
# This file is part of the OperatorFabric project.


url=$2
if [ -z $url ] 
then
	url="http://localhost"
fi

# MacOs doesn't have date, so check for that and use gdate instead.
if [ $OSTYPE == 'darwin'* ]
then
  if ! command -v gdate &> /dev/null
  then
      echo "You are running on macOs and gdate could not be found, please install with 'brew install coreutils'."
      exit
  fi
  current_date_millis=$(gdate +%s%3N)
else
  current_date_millis=$(date +%s%3N)
fi

if [ -z $1 ]
then
    echo "Usage sendCard cardFile opfab_url"
else
    source ../getToken.sh "publisher_test" $url
    export current_date_in_milliseconds_from_epoch=$(($current_date_millis))
    export current_date_in_milliseconds_from_epoch_plus_3minutes=$(($current_date_millis + 3*60*1000))
    export current_date_in_milliseconds_from_epoch_plus_1hours=$(($current_date_millis + 60*60*1000))
    export current_date_in_milliseconds_from_epoch_plus_2hours=$(($current_date_millis + 2*60*60*1000))
    export current_date_in_milliseconds_from_epoch_plus_4hours=$(($current_date_millis + 4*60*60*1000))
    export current_date_in_milliseconds_from_epoch_plus_8hours=$(($current_date_millis + 8*60*60*1000))
    export current_date_in_milliseconds_from_epoch_plus_12hours=$(($current_date_millis + 12*60*60*1000))
    export current_date_in_milliseconds_from_epoch_plus_24hours=$(($current_date_millis + 24*60*60*1000))
    export current_date_in_milliseconds_from_epoch_plus_48hours=$(($current_date_millis + 48*60*60*1000))
    echo "send card $1 (url: $url)"
    curl -X POST $url:2102/cards -H "Authorization: Bearer $token" -H "Content-type:application/json" --data "$(envsubst <$1)"
fi
