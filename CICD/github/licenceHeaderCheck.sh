#!/bin/bash

# Copyright (c) 2023, RTE (http://www.rte-france.com)
# See AUTHORS.txt
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
# SPDX-License-Identifier: MPL-2.0
# This file is part of the OperatorFabric project.

incorrect_files=()

check_patterns() {
    file="$1"
    shift
    for pattern; do
        if ! grep -q -i -w "$pattern" "$file"; then
            incorrect_files+=("$file")
            break
        fi
    done
}

for file in "$@"; do
    case "$file" in
        *.ts | *.js | *.java | *.html | *.css | *.scss | *.handlebars | *.sh)
            check_patterns "$file" "Copyright (c)" "2023" "mozilla.org/MPL"
            ;;

        *.adoc | *.svg)
            check_patterns "$file" "Copyright (c)" "2023" "creativecommons.org/licenses"
            ;;
    esac
done

if [ "${#incorrect_files[@]}" -gt 0 ]; then
    echo "::error::Missing correct copyright header in :"
    for file in "${incorrect_files[@]}"; do
        echo "  $file"
    done
    exit 1
fi