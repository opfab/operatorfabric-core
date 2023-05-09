#!/bin/bash

# Copyright (c) 2023, RTE (http://www.rte-france.com)
# See AUTHORS.txt
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
# SPDX-License-Identifier: MPL-2.0
# This file is part of the OperatorFabric project.

# This starts by moving to the directory where the script is located so the paths below still work even if the script
# is called from another folder
cd "$(dirname "${BASH_SOURCE[0]}")"

storageDirectory=$1

if [ -z $1 ]
then
    echo ""
    echo "Move bundles from opfab version prior to 3.14 to the bundles subdirectory"
    echo "Create the subdirectory if it does not exist"
    echo ""
    echo "Usage : moveBundles storageDirectory"
else
    echo "Check if bundle directory exists"
    if [ -d "$storageDirectory/bundles" ]
    then
        echo "Directory $storageDirectory/bundles exists"
    else
        echo "Directory $storageDirectory/bundles does not exist"
        mkdir "$storageDirectory/bundles"
        echo "Directory created"
    fi
    (
        cd $storageDirectory;
        for file in *; do
            if [ -d "$file" ]; then
                if [ $file != bundles ] && [ $file != businessdata ]
                then
                    echo "Directory $file has to be moved"
                    mv $file bundles/$file
                    echo 'Move done '
                fi
            fi
        done
    )
fi

