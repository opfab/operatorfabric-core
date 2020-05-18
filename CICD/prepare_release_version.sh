#!/usr/bin/env bash

display_usage() {
	echo "This script makes the necessary changes to version controlled files to prepare for a RELEASE version."
	echo -e "Usage:\n"
	echo -e "\tprepare_release_version.sh [OPTIONS] \n"
	echo -e "options:\n"
	echo -e "\t-v, --version  : string. Version to be released (X.X.X.RELEASE)"
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

# Get current version from VERSION file (can be SNAPSHOT or X.X.X.RELEASE in the case of a hotfix)
oldVersion=$(cat VERSION)
echo "Current version is $oldVersion (based on VERSION file)"


# Check that new version is a RELEASE version as expected
if [[ $newVersion != *.RELEASE ]]; then
  echo "Specified version is not a RELEASE version, this script shouldn't be used."
  exit 1;
fi

echo "Preparing $newVersion"

# Replace old version with new version

echo "Updating version for pipeline in VERSION file"
sed -i "s/$oldVersion/$newVersion/g" VERSION;

echo "Replacing $oldVersion with $newVersion in swagger.yaml files"
find . -name swagger.yaml | xargs sed -i "s/\(version: *\)$oldVersion/\1$newVersion/g";
# With the current commmand, if the "version" key appears somewhere else in the file it will be affected as well.
# That's why oldVersion is part of the pattern, as it is less likely that another version key would appear with the exact same value.
# The issue is that if the value has been mistakenly modified and is not $oldVersion, it won't be updated
# TODO Find a better solution or add a check

echo "Using $newVersion for lfeoperatorfabric images in deploy and dev-environment docker-compose files"
# String example for regexp: image: "lfeoperatorfabric/of-web-ui:0.13.1.RELEASE"
sed -i "s/\( *image *: *\"lfeoperatorfabric\/.*:\)\(.*\)\"/\1$newVersion\"/g" ./src/main/docker/deploy/docker-compose.yml;
sed -i "s/\( *image *: *\"lfeoperatorfabric\/.*:\)\(.*\)\"/\1$newVersion\"/g" ./src/main/docker/dev-environment/docker-compose.yml;

echo "The following files have been updated: "
echo | git status --porcelain
