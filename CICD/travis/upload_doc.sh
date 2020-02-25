#!/usr/bin/env bash

. ${BASH_SOURCE%/*}/../../bin/load_variables.sh

CURRENT_PATH=$(pwd)
GH_REPO=github.com/opfab/opfab.github.io.git
HTTP_REPO="https://opfabtech:${GH_DOC_TOKEN}@${GH_REPO}"
git clone $HTTP_REPO $HOME/documentation

cd $HOME/documentation
echo "List files after inital clone"
LIST_FILES=$(ls $HOME/documentation)
echo $LIST_FILES
GIT_CONFIG=$(git config --list --show-origin)
echo $GIT_CONFIG
cd $CURRENT_PATH

# TODO Find out what sed below is for (as we don't have - in our version tags)
version=$(echo "$OF_VERSION"| sed s/-SNAPSHOT//)
cd $OF_HOME
# TODO It looks like doc generation is already done in travis.yml To be checked
./gradlew generateSwaggerCodeDoc javadoc asciidoctor :ui:main:npm_run_compodoc
for prj in "${OF_REL_COMPONENTS[@]}"; do
  echo "copying $prj documentation"
  rm -r $HOME/documentation/projects/$prj/$version/*
  mkdir -p $HOME/documentation/projects/$prj/$version/reports/
  cp -r $prj/build/docs/* $HOME/documentation/projects/$prj/$version/.
  cp -r $prj/build/reports/* $HOME/documentation/projects/$prj/$version/reports/.
done
rm -r $HOME/documentation/projects/ui/main/$version/*
mkdir -p -p $HOME/documentation/projects/ui/main/$version/compodoc/
mkdir -p -p $HOME/documentation/projects/ui/main/$version/reports
mkdir -p $HOME/documentation/documentation/$version/
cp -r $OF_HOME/ui/main/documentation/* $HOME/documentation/projects/ui/main/$version/compodoc/.
cp -r $OF_HOME/ui/main/reports/* $HOME/documentation/projects/ui/main/$version/reports/.
cp -r $OF_HOME/build/asciidoc/html5/* $HOME/documentation/documentation/$version/.
cd $HOME/documentation

echo "Results of copy"
COPY_RES=$(git status)
echo $COPY_RES

if [ -n "$(git status --porcelain)" ]; then
    echo "Changes to documentation detected, preparing commit"
    git add .
    git commit -m "Updating documentation for version ${OF_VERSION}"
    git push $HTTP_REPO master > /dev/null 2>&1
else
    echo "No changes to documentation detected"
fi

cd $CURRENT_PATH
