#!/usr/bin/env bash

# Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
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
OF_HOME=$(realpath $DIR/..)
CURRENT_PATH=$(pwd)

function display_usage() {
	echo -e "This script adds license header to all files with of the specified language.\n"
	echo -e "All headings should be removed before adding new headings to avoid duplicate headings.\n"
	echo -e "Usage:\n"
	echo -e "\tadd_headers.sh [OPTIONS] [TYPE]\n"
	echo -e "options:\n"
	echo -e "\t-d, --delete delete headers."
	echo -e "\t-h, --help display this help message."
	echo -e "types:\n"
	echo -e "\tJAVA  : .java files"
	echo -e "\tTS  : .ts (TypeScript) files"
	echo -e "\tCSS  : .css, .scss files"
	echo -e "\tHTML  : .htm, .html files"
	echo -e "\tADOC  : .adoc files"
}
delete=false
while [[ $# -gt 0 ]]
do
key="$1"
case $key in
    CSS)
    header="JAVA_LICENSE_HEADER.txt"
    file_extensions=( css scss )
    shift # past argument
    ;;
    JAVA)
    header="JAVA_LICENSE_HEADER.txt"
    file_extensions=( java )
    shift # past argument
    ;;
    ADOC)
    header="ADOC_LICENSE_HEADER.txt"
    file_extensions=( adoc )
    shift # past argument
    ;;
    TS)
    header="JAVA_LICENSE_HEADER.txt"
    file_extensions=( ts )
    shift # past argument
    ;;
    HTML)
    header="HTML_LICENSE_HEADER.txt"
    file_extensions=( htm html )
    shift # past argument
    ;;
    -d|--delete)
    delete=true
    shift # past argument
    ;;
    -h|--help)
    display_usage
    exit 0
    shift # past argument
    ;;
    *)    # unknown option
    command+=("$1") # save it in an array for later
    shift # past argument
    ;;
esac
done

# avoid weird behavior if no args given to this script
if [ -z "$key" ] || [ -z "$file_extensions" ] || [ -z "$header" ]; then
	display_usage
	exit 0
fi

cd $OF_HOME
licenceLines=$(wc -l <"$OF_HOME/src/main/headers/$header")
licenceLines=$((licenceLines+1)) #Because wc is actually counting newline chars and header files aren't ending on newlines?
licenceContent=$(cat "$OF_HOME/src/main/headers/$header")
findCommand="find $OF_HOME "
echo "Licence header line count: $licenceLines"
echo -e "Licence header content: \n$licenceContent"
echo -e "\n"

#Exclude bundles demo/test files
findCommand+="! -path \"$OF_HOME/services/core/businessconfig/src/test/data/bundles/*\" "
findCommand+="-and ! -path \"$OF_HOME/services/core/businessconfig/src/main/docker/volume/businessconfig-storage/*\" "
findCommand+="-and ! -path \"$OF_HOME/services/core/businessconfig/src/test/docker/volume/businessconfig-storage/*\" "
findCommand+="-and ! -path \"$OF_HOME/src/test/resources/*\" "

#Exclude generated folders from ui
findCommand+="-and ! -path \"$OF_HOME/ui/main/build/*\" "
findCommand+="-and ! -path \"$OF_HOME/ui/main/documentation/*\" "
findCommand+="-and ! -path \"$OF_HOME/ui/main/e2e/*\" "
findCommand+="-and ! -path \"$OF_HOME/ui/main/node_modules/*\" "
findCommand+="-and ! -path \"$OF_HOME/ui/main/reports/*\" "

findCommand+=" -and "
for ((i=0; i<${#file_extensions[*]}; i=$((i+1))));
do
    if ((i>0)); then
        findCommand+=" -or"
    fi
    findCommand+=" -name \"*.${file_extensions[i]}\""
done

#findCommand+='|grep -Rv "build"'
echo "computed find command: $findCommand"

for f in `eval $findCommand`
do
  if [[ $f != *"build"* ]]; then
    if [ "$delete" = true ]; then
    head -$licenceLines $f | diff - <(echo "$licenceContent") > /dev/null 2>&1 && ( ( cat $f | sed -e "1,$((licenceLines))d" ) > /tmp/file; mv /tmp/file $f )
    else
    head -$licenceLines $f | diff - <(echo "$licenceContent") > /dev/null 2>&1  || ( ( echo -e "$licenceContent\n"; cat $f) > /tmp/file; mv /tmp/file $f )
    fi
  fi
done

cd $CURRENT_PATH
