#!/usr/bin/env bash

OLD_RELEASE=0.12.1.RELEASE
NEW_DATE="December 20, 2019"
# TODO Replace with parameters

# Get current (SNAPSHOT) version from VERSION file
OLD_VERSION=$(cat VERSION)
echo "Current version is $OLD_VERSION (based on VERSION file)"
# TODO Check that it is a SNAPSHOT version

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
find . -name "*.adoc" | xargs sed -i "s/^:revdate:\(.*\)$/:revdate: $NEW_DATE/g";

# TODO Make sure examples from src/docs/asciidoc/developer_guide/01_versioning.adoc are excluded

# TODO Replace with regexp so it works with or without spaces (for all commands)
# TODO Instead of having each command list changes we can have tests on git status (cf upload_doc.sh)
# TODO Updating :revdate: (param or now)

# echo "Replacing $OLD_RELEASE with $NEW_VERSION in demo/deploy docker-compose files"
# sed -i "s/$OLD_RELEASE/$NEW_VERSION/g" ./src/main/docker/demo/docker-compose.yml;
# sed -i "s/$OLD_RELEASE/$NEW_VERSION/g" ./src/main/docker/deploy/docker-compose.yml;
echo "Using $NEW_VERSION for lfeoperatorfabric images in  demo/deploy docker-compose files"
sed -i "s/image\( *\):\( *\)/image: $NEW_VERSION/g" ./src/main/docker/demo/docker-compose.yml;
# image: "lfeoperatorfabric/of-web-ui:0.13.1.RELEASE"
# TODO Add regexp so we're sure we only update lfeoperatorfabric images

# TODO Echo changes made or at least modified files -> git status
# TODO Do a display usage function

# TODO Check that there is no reference to the old version left (limited to version-controlled files)
# echo "Checking that there are no references to $OLD_VERSION left"

