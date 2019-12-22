#!/usr/bin/env bash

# Default values
revisionDate="$(LC_ALL=en_GB.utf8 date +'%d %B %Y')"

display_usage() {
	echo "This script makes the necessary changes to version controlled files to prepare for a RELEASE version."
	echo -e "Usage:\n"
	echo -e "\tprepare_release_version.sh [OPTIONS] \n"
	echo -e "options:\n"
	echo -e "\t-d, --date  : string. Revision date (please use %d %B %Y format). Defaults to today ($revisionDate)"
}

# Read parameters
while [[ $# -gt 0 ]]
do
key="$1"
# echo $key
case $key in
    -d|--date)
    revisionDate="$2"
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
OLD_VERSION=$(cat VERSION)
echo "Current version is $OLD_VERSION (based on VERSION file)"

# Check that current version is a SNAPSHOT version as expected
if [[ $OLD_VERSION != *.SNAPSHOT* ]]; then
  echo "Current version is not a SNAPSHOT version, this script shouldn't be used."
  exit 1;
fi

# Determine RELEASE version
NEW_VERSION=$(cat VERSION | sed 's/SNAPSHOT/RELEASE/' )
echo "Preparing $NEW_VERSION"

# Replace SNAPSHOT with RELEASE
echo "Updating version for pipeline in VERSION file"
sed -i "s/$OLD_VERSION/$NEW_VERSION/g" VERSION;

echo "Replacing $OLD_VERSION with $NEW_VERSION in swagger.yaml files"
echo find . -name swagger.yaml | sed -n "/version: $OLD_VERSION/p";
find . -name swagger.yaml | xargs sed -i "s/version: $OLD_VERSION/version: $NEW_VERSION/g";
# TODO How can we detect if the previous version wasn't changed correctly?

echo "Replacing $OLD_VERSION with $NEW_VERSION in :revnumber in adoc files"
find . -name "*.adoc" | xargs sed -i "s/:revnumber: $OLD_VERSION/:revnumber: $NEW_VERSION/g";

echo "Replacing $OLD_VERSION with $NEW_VERSION in links in adoc files"
find . -name "*.adoc" | xargs sed -i "s/\/$OLD_VERSION\//\/$NEW_VERSION\//g";

echo "Updating revision date in adoc files"
find . -name "*.adoc" | xargs sed -i "s/^:revdate:\(.*\)$/:revdate: $revisionDate/g";

# TODO Make sure examples from src/docs/asciidoc/developer_guide/01_versioning.adoc are excluded

# TODO Replace with regexp so it works with or without spaces (for all commands)
# TODO Instead of having each command list changes we can have tests on git status (cf upload_doc.sh)
# TODO Updating :revdate: (param or now)

echo "Using $NEW_VERSION for lfeoperatorfabric images in  demo/deploy docker-compose files"
sed -i "s/image\( *\):\( *\)/image: $NEW_VERSION/g" ./src/main/docker/demo/docker-compose.yml;
# image: "lfeoperatorfabric/of-web-ui:0.13.1.RELEASE"
# TODO Add regexp so we're sure we only update lfeoperatorfabric images

echo "The following files have been updated: "
echo | git status --porcelain

