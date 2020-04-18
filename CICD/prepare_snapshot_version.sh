#!/usr/bin/env bash

# Init values
newVersion=""

display_usage() {
	echo "This script makes the necessary changes to version controlled files to prepare for a SNAPSHOT version."
	echo -e "Usage:\n"
	echo -e "\tprepare_snapshot_version.sh [OPTIONS] \n"
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

# Get current (RELEASE) version from VERSION file
oldVersion=$(cat VERSION)
echo "Current version is $oldVersion (based on VERSION file)"

# Check that current version is a RELEASE version as expected
if [[ $oldVersion != *.RELEASE ]]; then
  echo "Current version is not a RELEASE version, this script shouldn't be used."
  exit 1;
fi

# Determine SNAPSHOT version if it wasn't passed as parameter
if [[ $newVersion == "" ]]; then
  echo "New version wasn't set, defaulting to next minor version."
  currentMinorNumber=$(cat VERSION | sed 's/.RELEASE//g' | sed 's/\([0-9]*\)\.\([0-9]*\)\.\([0-9]*\)/\2/g')
  nextMinorNumber=$((currentMinorNumber + 1));
  newVersion=$(cat VERSION | sed 's/RELEASE/SNAPSHOT/' | sed "s/\([0-9]*\)\.\([0-9]*\)\.\([0-9]*\)/\1\.$nextMinorNumber\.\3/g")
fi
echo "Preparing $newVersion"

# Check that new version is a SNAPSHOT version as expected (in case it was input as parameter)
if [[ $newVersion != *.SNAPSHOT ]]; then
  echo "Specified version is not a SNAPSHOT version, this script shouldn't be used."
  exit 1;
fi

# Replace RELEASE with SNAPSHOT
echo "Updating version for pipeline in VERSION file"
sed -i "s/$oldVersion/$newVersion/g" VERSION;

echo "Replacing $oldVersion with $newVersion in swagger.yaml files"
find . -name swagger.yaml | xargs sed -i "s/\(version: *\)$oldVersion/\1$newVersion/g";
# With the current commmand, if the "version" key appears somewhere else in the file it will be affected as well.
# That's why oldVersion is part of the pattern, as it is less likely that another version key would appear with the exact same value.
# The issue is that if the value has been mistakenly modified and is not $oldVersion, it won't be updated
# TODO Find a better solution or add a check

# deploy docker-compose file mustn't be updated as it should use the latest RELEASE for stability.

echo "The following files have been updated: "
echo | git status --porcelain
