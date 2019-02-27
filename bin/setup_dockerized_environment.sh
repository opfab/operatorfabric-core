#!/bin/bash

SOURCE="${BASH_SOURCE[0]}"
while [ -h "$SOURCE" ]; do # resolve $SOURCE until the file is no longer a symlink
  DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"
  SOURCE="$(readlink "$SOURCE")"
  [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE" # if $SOURCE was a relative symlink, we need to resolve it relative to the path where the symlink file was located
done
DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"
OF_HOME=$(realpath $DIR/..)
CURRENT_PATH=$(pwd)

offline=false
build=false

function display_usage() {
	echo -e "This script prepares all docker images and create the necessary docker network.\n"
	echo -e "Usage:\n"
	echo -e "\tsetup_dockerized_environment.sh [OPTIONS] \n"
	echo -e "options:\n"
	echo -e "\t-b, --build  : true or false. Include project build. Defaults to $build"
	echo -e "\t-p, --proxy_uri  : string. Proxy uri ex: http://somewhere:3128. Default to empty"
	echo -e "\t-s, --https_proxy_uri  : string. Proxy https uri ex: http://somewhere:3128. Defaults to --https_proxy_uri"
	echo -e "\t-u, --proxy_user  : string. Proxy user name. Defaults to empty"
	echo -e "\t-a, --proxy_password  : string. Proxy user password. Defaults to empty"
	echo -e "\t-o, --offline  : true or false. When gradle is invoked, it will be invoked offline. Defaults to $offline."
	echo -e "NB: You may also set the following environment variables to avoid passing there parameters: APK_PROXY_URI, \
	\nAPK_HTTPS_PROXY_URI, APK_PROXY_USER, APK_PROXY_PASSWORD"
}

proxy_uri=""
proxy_user=""
proxy_password=""

while [[ $# -gt 0 ]]
do
key="$1"
case $key in
    -b|--build)
    build="$2"
    shift # past argument
    shift # past value
    ;;
    -p|--proxy_uri)
    proxy_uri="$2"
    shift # past argument
    shift # past value
    ;;
    -s|--https_proxy_uri)
    https_proxy_uri="$2"
    shift # past argument
    shift # past value
    ;;
    -u|--proxy_user)
    proxy_user="$2"
    shift # past argument
    shift # past value
    ;;
    -a|--proxy_password)
    proxy_password="$2"
    shift # past argument
    shift # past value
    ;;
    -h|--help)
    display_usage
    exit 0
    shift # past argument
    ;;
    -o|--offline)
    offline="$2"
    shift # past argument
    shift # past value
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

if [ -z $https_proxy_uri ]; then
    https_proxy_uri=$proxy_uri
fi

if [ "$build" = true ] ; then
    cd $OF_HOME
    gradle assemble $GRADLE_OPTIONS
    cd $CURRENT_PATH
fi
cd $OF_HOME
#cd services/core
set -x
gradle copyWorkingDir dockerTag -x test \
-Papk.proxy.uri=$proxy_uri \
-Papk.proxy.httpsuri=$https_proxy_uri \
-Papk.proxy.user=$proxy_user \
-Papk.proxy.password=$proxy_password $GRADLE_OPTIONS

cd $CURRENT_PATH

docker network create opfabnet