#!/usr/bin/env bash

# Default values
revisionDate="$(LC_ALL=en_GB.utf8 date +'%d %B %Y')"

display_usage() {
	echo "This script makes the necessary changes to version controlled files in case the snapshot version needs to be
	updated before the release."
	echo -e "Usage:\n"
	echo -e "\tprepare_release_version.sh [OPTIONS] \n"
	echo -e "options:\n"
	echo -e "\t-v, --version  : string. New snapshot version (X.X.X.SNAPSHOT) Defaults to next minor version"
}

# Read parameters
while [[ $# -gt 0 ]]
do
key="$1"
# echo $key
case $key in
    -v|--version)
    newVersion="$2"
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

# Get current (SNAPSHOT) version from VERSION file
oldVersion=$(cat VERSION)
echo "Current version is $oldVersion (based on VERSION file)"

# Check that current version is a SNAPSHOT version as expected
if [[ $oldVersion != *.SNAPSHOT ]]; then
  echo "Current version is not a SNAPSHOT version, this script shouldn't be used."
  exit 1;
fi

# Determine new version if it wasn't passed as parameter
if [[ $newVersion == "" ]]; then
  echo "New version wasn't set, defaulting to next minor version."
  currentMinorNumber=$(cat VERSION | sed 's/.RELEASE//g' | sed 's/\([0-9]*\)\.\([0-9]*\)\.\([0-9]*\)/\2/g')
  nextMinorNumber=$((currentMinorNumber + 1));
  newVersion=$(cat VERSION | sed "s/\([0-9]*\)\.\([0-9]*\)\.\([0-9]*\)/\1\.$nextMinorNumber\.\3/g")
fi

# Check that new version is SNAPSHOT
if [[ $oldVersion != *.SNAPSHOT ]]; then
  echo "Proposed new version is not a SNAPSHOT version, this script shouldn't be used."
  echo "If you want to prepare a new RELEASE version, use prepare_release_version.sh instead."
  exit 1;
fi

echo "Preparing $newVersion"

# Replace version in VERSION file
echo "Updating version for pipeline in VERSION file"
sed -i "s/$oldVersion/$newVersion/g" VERSION;

echo "Replacing $oldVersion with $newVersion in swagger.yaml files"
find . -name swagger.yaml | xargs sed -i "s/\(version: *\)$oldVersion/\1$newVersion/g";
# With the current commmand, if the "version" key appears somewhere else in the file it will be affected as well.
# That's why oldVersion is part of the pattern, as it is less likely that another version key would appear with the exact same value.
# The issue is that if the value has been mistakenly modified and is not $oldVersion, it won't be updated
# TODO Find a better solution or add a check

# No update for docker-compose files

echo "The following files have been updated: "
echo | git status --porcelain

