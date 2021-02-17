#!/usr/bin/env bash

# Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
# See AUTHORS.txt
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
# SPDX-License-Identifier: MPL-2.0
# This file is part of the OperatorFabric project.
 

. ${BASH_SOURCE%/*}/load_variables.sh

SOURCE="${BASH_SOURCE[0]}"
while [ -h "$SOURCE" ]; do # resolve $SOURCE until the file is no longer a symlink
  DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"
  SOURCE="$(readlink "$SOURCE")"
  [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE" # if $SOURCE was a relative symlink, we need to resolve it relative to the path where the symlink file was located
done
DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"
OF_HOME=$(realpath $DIR/..)
CURRENT_PATH=$(pwd)

resetConfiguration=true
businessServices=( "users" "cards-consultation" "cards-publication" "businessconfig")
offline=false

function join_by { local IFS="$1"; shift; echo "$*"; }

function display_usage() {
	echo -e "\nThis script runs OperatorFabric services."
	echo -e "Usage:"
	echo -e "\trun_all.sh [OPTIONS] (start, stop , hardstop, restart, status)\n"
  echo -e "\tstop: soft kill of the processes"
  echo -e "\thardstop: hard kill of the processes (with kill -9) \n"
	echo -e "options:"
	echo -e "\t-s, --services\t: list of comma separated services. Business services to run. Defaults to " $(join_by ","  "${businessServices[@]}")
	echo -e "\t-r, --reset\t: true or false. Resets service data. Defaults to $resetConfiguration."
	echo -e "\t-o, --offline\t: true or false. When gradle is invoked, it will be invoked offline. Defaults to $offline.\n"
}

while [[ $# -gt 0 ]]
do
key="$1"
case $key in
    -r|--reset)
    resetConfiguration="$2"
    shift # past argument
    shift # past value
    ;;
    -s|--services)
    stringServices=$2
    businessServices=(${stringServices//,/ })
    shift # past argument
    shift # past value
    ;;
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
PRJ_STRC_FIELDS=5

declare -a dependentProjects
i=0
for bservice in "${businessServices[@]}"; do
 dependentProjects[$i]="$bservice-business-service"
 dependentProjects[$i+1]="services/core/$bservice"
 dependentProjects[$i+2]=0
 dependentProjects[$i+3]=""
 dependentProjects[$i+4]=$bservice
 i=$((i+$PRJ_STRC_FIELDS))
done

debugPort=5005
version=$OF_VERSION

startProject(){

      echo "##########################################################"
      echo Starting $1, debug port: $2
      echo "##########################################################"
      projectBuildPath=${OF_HOME}/$3/build
      bootstrapLocation=${OF_HOME}/$3/src/main/resources/bootstrap-dev.yml
      debugOptions=-agentlib:jdwp=transport=dt_socket,address=$2,server=y,suspend=n

      applicationOptions="--spring.profiles.active=dev --spring.config.location=classpath:/application.yml,file:${OF_HOME}/config/dev/ --spring.config.name=common,$4"
      echo "applicationOptions: $applicationOptions"
      echo "pid file: $projectBuildPath/PIDFILE"
      if [ -f $projectBuildPath/PIDFILE ] ; then
        pid=$(<$projectBuildPath/PIDFILE)
      else
        pid=""
      fi
      if [ -n "$pid" -a -e /proc/$pid ]; then
        echo "$1 already running (pid: $pid)"
      else
        mkdir -p $projectBuildPath/logs
#        set -x
        cd $OF_HOME
        java -Xss512k -XX:MaxRAM=512m $debugOptions \
             -jar $projectBuildPath/libs/$1-$version.jar \
             $applicationOptions 2>&1 > $projectBuildPath/logs/$(date \+"%y-%m-%d").log &
#        set +x
        echo $! > $projectBuildPath/PIDFILE

        echo "Started with pid: $!"
      fi
      echo

}

startCommand() {

    if [ "$resetConfiguration" = true ] ; then
        cd $OF_HOME
        echo "## Preparing business runtime data"
        gradle copyWorkingDir $GRADLE_OPTIONS
        cd $CURRENT_PATH
    fi

    for ((i=0; i<${#dependentProjects[*]}; ));
    do
      startProject ${dependentProjects[i]} $debugPort ${dependentProjects[i+1]} ${dependentProjects[i+4]}
      debugPort=$((debugPort+1))
      i=$((i+$PRJ_STRC_FIELDS))
    done

}

stopProject() {
    projectBuildPath="$2/build"
    projectPidFilePath="$projectBuildPath/PIDFILE"
    echo "##########################################################"
    if [ -f "$projectPidFilePath" ]; then
      pid=$(<"$projectPidFilePath")
      echo "Stopping $1 (pid: $pid)"
      if ! kill $pid > /dev/null 2>&1; then
          echo "$1: could not send SIGTERM to process $pid" >&2
      fi
    else
      echo "'$projectPidFilePath' not found"
    fi
    echo "##########################################################"
}

stopCommand(){
  for ((i=0; i<${#dependentProjects[*]}; ));
  do
    stopProject ${dependentProjects[i]} ${dependentProjects[i+1]}
    i=$((i+$PRJ_STRC_FIELDS))
  done
}



hardstopProject() {
    projectBuildPath="$2/build"
    projectPidFilePath="$projectBuildPath/PIDFILE"
    echo "##########################################################"
    if [ -f "$projectPidFilePath" ]; then
      pid=$(<"$projectPidFilePath")
      echo "Stopping $1 (pid: $pid)"
      if ! kill -9 $pid > /dev/null 2>&1; then
          echo "$1: could not send SIGTERM to process $pid" >&2
      fi
    else
      echo "'$projectPidFilePath' not found"
    fi
    echo "##########################################################"
}

hardstopCommand(){
  for ((i=0; i<${#dependentProjects[*]}; ));
  do
    hardstopProject ${dependentProjects[i]} ${dependentProjects[i+1]}
    i=$((i+$PRJ_STRC_FIELDS))
  done
}

projectStatus() {
#set -x
    projectBuildPath="$2/build"
    projectPidFilePath="$projectBuildPath/PIDFILE"
    if [ -f "$projectPidFilePath" ]; then
      pid=$(<"$projectPidFilePath")
      if [ -n "$pid" ] && [ -e /proc/"$pid" ]; then
        echo -e "$1 (pid: $pid): \033[0;32mRUNNING\033[0m"
      else
        echo -e "$1 (pid: $pid): \033[0;31mSTOPPED\033[0m"
        rm "$projectPidFilePath"
      fi
    else
        echo -e "$1: \033[0;31mSTOPPED\033[0m"
    fi
#    set +x
}

statusCommand(){
  echo "##########################################################"
  for ((i=0; i<${#dependentProjects[*]}; ));
  do
    projectStatus ${dependentProjects[i]} ${dependentProjects[i+1]}
    i=$((i+$PRJ_STRC_FIELDS))
  done
  echo "##########################################################"

}
### always start processing from OF_HOME
cd ${OF_HOME}

case $command in
  start)
  startCommand
#  exit 0;
  ;;
  stop)
  stopCommand
#  exit 0;
  ;;
  hardstop)
  hardstopCommand
#  exit 0;
  ;;
  restart)
  stopCommand
  startCommand
#  exit 0;
  ;;
  status)
  statusCommand
#  exit 0
  ;;
  *)    # unknown option
  display_usage
  ;;
esac
