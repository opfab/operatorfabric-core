#!/usr/bin/env bash

# Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
# See AUTHORS.txt
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
# SPDX-License-Identifier: MPL-2.0
# This file is part of the OperatorFabric project.
 

display_usage() {
	echo "This script checks that the version specified in the VERSION file is appropriate for the current branch"
	echo -e "Usage:\n"
	echo -e "\tcheck_version.sh [OPTIONS] \n"
	echo -e "options:\n"
	echo -e "\t-b, --branch  : string. Branch on which Travis is running the build"
	echo -e "\t-v, --version  : string. Version set for current repository state"
}

# Read parameters
while [[ $# -gt 0 ]]
do
key="$1"
# echo $key
case $key in
    -b|--branch)
    branch="$2"
    shift # past argument
    shift # past value
    ;;
    -v|--version)
    version="$2"
    shift # past argument
    shift # past value
    ;;
    -h|--help)
    shift # past argument
display_usage
    exit 0
    ;;
    *)    # unknown option
    POSITIONAL+=("$1") # save it in an array for later
    shift # past argument
    ;;
esac
done

# Check that both branch and version are set
if [[ $branch == '' ]]; then
    echo "check_version failed: branch is not set."
    exit 1;
fi
if [[ $version == '' ]]; then
    echo "check_version failed: version is not set."
    exit 1;
fi

echo "check_version: branch $branch, version $version"

minor_version_pattern='([0-9]+\.[0-9]+)'
if [[ $branch =~ $minor_version_pattern\.hotfixes$ ]] ; then
    minor_version=${BASH_REMATCH[1]}
    [[ $version =~ $minor_version\.[0-9]+\.RELEASE$ ]] && exit 0 || echo "check_version failed: for hotfixes branch $branch version should be $minor_version.X.RELEASE."; exit 1;
fi

[[ $branch == 'develop' ]] && { [[ $version == 'SNAPSHOT' ]] && exit 0 || echo "check_version failed: for branch develop version should be SNAPSHOT."; exit 1;}
[[ $branch == 'master' ]] && { [[ $version =~ [0-9]+\.[0-9]+\.[0-9]+\.RELEASE$ ]] && exit 0 || echo "check_version failed: for branch master version should be X.X.X.RELEASE."; exit 1;}
[[ $branch =~ [0-9]+\.[0-9]+\.[0-9]+\.release$ ]] && { [[ $version == ${branch^^} ]] && exit 0 || echo "check_version failed: for release branch $branch version should be ${branch^^}."; exit 1;}
[[ $branch =~ FE-.+$ ]] && { [[ $version == 'SNAPSHOT' || $version =~ [0-9]+\.[0-9]+\.[0-9]+\.RELEASE$ ]] && exit 0 || echo "check_version failed: for feature branches version should be SNAPSHOT or X.X.X.RELEASE."; exit 1;}

echo "check_version failed: unhandled branch type"
exit 1;
