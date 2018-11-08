#!/bin/bash

SOURCE="${BASH_SOURCE[0]}"
while [ -h "$SOURCE" ]; do # resolve $SOURCE until the file is no longer a symlink
  DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"
  SOURCE="$(readlink "$SOURCE")"
  [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE" # if $SOURCE was a relative symlink, we need to resolve it relative to the path where the symlink file was located
done
DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"
export OF_HOME=$(realpath $DIR/..)

currentPath=$(pwd)

offline=false

function display_usage() {
	echo -e "This script builds all operator fabric services.\n"
	echo -e "Usage:\n"
	echo -e "\tbuild_all.sh [OPTIONS] \n"
	echo -e "options:\n"
	echo -e "\t-o, --offline : true or false. BuildOffline. Default to offline"
}

while [[ $# -gt 0 ]]
do
key="$1"
case $key in
    -o|--offline)
    offline="$2"
    shift # past argument
    shift # past value
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

GRADLE_OPTIONS=" "

if [ "$offline" = true ]; then
    GRADLE_OPTIONS="$GRADLE_OPTIONS --offline"
fi
cd $OF_HOME
echo "#### Building artifacts ####"
echo "# Using gradle options: $GRADLE_OPTIONS #"
echo "## Building swagger generator"
set -x
gradle :tools:swagger-spring-generators:assemble $GRADLE_OPTIONS
set +x
echo "## Building client libs"
cd client
gradle assemble $GRADLE_OPTIONS
echo "## Building tools"
cd ../tools
gradle assemble $GRADLE_OPTIONS
echo "## Building services"
cd ..
gradle assemble $GRADLE_OPTIONS
cd $currentPath