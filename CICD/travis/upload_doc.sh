#!/usr/bin/env bash

. ${BASH_SOURCE%/*}/../../bin/load_variables.sh

CURRENT_PATH=$(pwd)
GH_REPO=github.com/opfab/opfab.github.io.git
HTTP_REPO="https://opfabtech:${GH_DOC_TOKEN}@${GH_REPO}"
git clone --depth 1 $HTTP_REPO $HOME/documentation

cd $OF_HOME

# If the current version is a snapshot version
if [[ $OF_VERSION =~ .+SNAPSHOT$ ]]; then
  # Clear all snapshot versions from archives (because we only want to keep one snapshot at a time)
  rm -r $HOME/documentation/documentation/archives/*SNAPSHOT
fi

# If the current version is a release version
if [[ $OF_VERSION =~ .+RELEASE$ ]]; then
  # Clear existing documentation in archive for current version
  rm -r $HOME/documentation/documentation/archives/$OF_VERSION/*
  # Update current documentation
  rm -r $HOME/documentation/documentation/current/*
    # Copy API documentation for each component
    for prj in "${OF_CLIENT_REL_COMPONENTS[@]}"; do
      echo "copying $prj documentation"
      mkdir -p $HOME/documentation/documentation/current/api/$prj/
      cp -r client/$prj/build/docs/api/* $HOME/documentation/documentation/current/api/$prj/
    done
    # Copy asciidoctor documentation (including images)
    mkdir -p $HOME/documentation/documentation/current/
    cp -r $OF_HOME/build/asciidoc/html5/* $HOME/documentation/documentation/current/
fi

# For archives
# Copy API documentation for each component
for prj in "${OF_CLIENT_REL_COMPONENTS[@]}"; do
  echo "copying $prj documentation"
  mkdir -p $HOME/documentation/documentation/archives/$OF_VERSION/api/$prj/
  cp -r client/$prj/build/docs/api/* $HOME/documentation/documentation/archives/$OF_VERSION/api/$prj/
done

# Copy asciidoctor documentation (only release notes and single_file_doc)
mkdir -p $HOME/documentation/documentation/archives/$OF_VERSION/
mkdir -p $HOME/documentation/documentation/archives/$OF_VERSION/images/
mkdir -p $HOME/documentation/documentation/archives/$OF_VERSION/docs/
cp $OF_HOME/build/asciidoc/html5/docs/release_notes.html $HOME/documentation/documentation/archives/$OF_VERSION/docs/
cp $OF_HOME/build/asciidoc/html5/docs/single_page_doc.html $HOME/documentation/documentation/archives/$OF_VERSION/docs/
cp -r $OF_HOME/build/asciidoc/html5/images/* $HOME/documentation/documentation/archives/$OF_VERSION/images/

cd $HOME/documentation

if [ -n "$(git status --porcelain)" ]; then
    echo "Changes to documentation detected, preparing commit"
    git add .
    git commit -m "Updating documentation for version ${OF_VERSION}"
    (git push $HTTP_REPO master --porcelain) && echo "Documentation was pushed successfully" || exit 1;
else
    echo "No changes to documentation detected"
fi

cd $CURRENT_PATH
