#!/usr/bin/env bash

. ${BASH_SOURCE%/*}/../../bin/load_variables.sh

CURRENT_PATH=$(pwd)
GH_REPO=github.com/opfab/opfab.github.io.git
HTTP_REPO="https://opfabtech:${GH_DOC_TOKEN}@${GH_REPO}"
git clone $HTTP_REPO $HOME/documentation

cd $OF_HOME

# If the current version is a snapshot version
if [[ $OF_VERSION =~ .+SNAPSHOT$ ]]; then
  # Clear all snapshot versions from archives (because we only want to keep one snapshot at a time)
  rm -r $HOME/site/documentation/archives/*SNAPSHOT
fi

# If the current version is a release version
if [[ $OF_VERSION =~ .+RELEASE$ ]]; then
  # Clear existing documentation in archive for current version
  rm -r $HOME/site/documentation/archives/$OF_VERSION/*
  # Update current documentation
  rm -r $HOME/site/documentation/current/*
    # Copy API documentation for each component
    for prj in "${OF_CLIENT_REL_COMPONENTS[@]}"; do
      echo "copying $prj documentation"
      mkdir -p $HOME/site/documentation/current/api/$prj/
      cp -r client/$prj/build/docs/api/* $HOME/site/documentation/current/api/$prj/
    done
    # Copy asciidoctor documentation (including images)
    mkdir -p $HOME/site/documentation/current/
    cp -r $OF_HOME/build/asciidoc/html5/* $HOME/site/documentation/current/
fi

# For archives
# Copy API documentation for each component
for prj in "${OF_CLIENT_REL_COMPONENTS[@]}"; do
  echo "copying $prj documentation"
  mkdir -p $HOME/site/documentation/archives/$OF_VERSION/api/$prj/
  cp -r client/$prj/build/docs/api/* $HOME/site/documentation/archives/$OF_VERSION/api/$prj/
done

# Copy asciidoctor documentation (only release notes and single_file_doc)
mkdir -p $HOME/site/documentation/archives/$OF_VERSION/
mkdir -p $HOME/site/documentation/archives/$OF_VERSION/images/
cp $OF_HOME/build/asciidoc/html5/release_notes.html $HOME/site/documentation/archives/$OF_VERSION/
cp $OF_HOME/build/asciidoc/html5/single_page_doc.html $HOME/site/documentation/archives/$OF_VERSION/
cp -r $OF_HOME/build/asciidoc/html5/images/* $HOME/site/documentation/archives/$OF_VERSION/images/

cd $HOME/site

if [ -n "$(git status --porcelain)" ]; then
    echo "Changes to documentation detected, preparing commit"
    git add .
    git commit -m "Updating documentation for version ${OF_VERSION}"
    (git push $HTTP_REPO master --porcelain) && echo "Documentation was pushed successfully" || exit 1;
else
    echo "No changes to documentation detected"
fi

cd $CURRENT_PATH
