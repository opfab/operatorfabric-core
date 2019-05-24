#!/usr/bin/env bash

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

build=false
resetConfiguration=true
gateway=true
authentication=true
businessServices=( "users" "time" "cards-consultation" "cards-publication" "thirds")
offline=false

function join_by { local IFS="$1"; shift; echo "$*"; }

test_url() {
    # store the whole response with the status at the and
#    echo "testing $1"
HTTP_STATUS=$(curl --connect-timeout 10 -I "$1" 2>/dev/null|sed -n 1p|awk '{print $2}')
#    echo "return status is $HTTP_STATUS"
    [ -n "$HTTP_STATUS" ] && [ "$HTTP_STATUS" = 200 ]
    return
}

waitRegistryAndConfig() {
    URL="http://localhost:2001"

    maxRetry=20
    retry=0
    # Testing registry access
    while ! test_url $URL && [ $retry -lt $maxRetry ]; do
     echo "Registry is not available at $URL, retry in 5s ($retry)"
     retry=$((retry+1))
     sleep 5
    done

    if [ $retry -ge $maxRetry ] ; then
        echo "Registry is not ready after $retry retries"
        exit 1
    else
        # testing at least one CONFIG instance is available
        echo "Registry is ready, now waiting for CONFIG to be ready"
        retry=0
        while ! test_url "$URL/eureka/apps/CONFIG" && [ $retry -lt $maxRetry ]; do
            echo "Config is not available in registry at $URL/eureka/apps/CONFIG, retry in 5s ($retry)"
            retry=$((retry+1))
            sleep 5
        done
        if [ $retry -ge $maxRetry ] ; then
            echo "Config was not declared in registry after $retry retries"
            exit 1
         else
         echo "Config is declared in Registry, now Starting other services"
        fi
    fi
}


function display_usage() {
	echo -e "This script runs OperatorFabric services.\n"
	echo -e "Usage:\n"
	echo -e "\trun_all.sh [OPTIONS] (start, stop, restart, status)\n"
	echo -e "options:\n"
	echo -e "\t-a, --auth  : true or false. Run developpement authentication service. Default to $authentication"
	echo -e "\t-b, --build  : true or false. Include project build. Defaults to $build"
#	echo -e "\t-g, --gateway  : true or false. Run service gateway. Defaults to $gateway"
	echo -e "\t-s, --services  : list of comma separated services. Business services to run along with infrastructure services. Defaults to " $(join_by , ${businessServices[@]})
	echo -e "\t-r, --reset  : true or false. Resets service data. Defaults to $resetConfiguration."
	echo -e "\t-o, --offline  : true or false. When gradle is invoked, it will be invoked offline. Defaults to $offline."
}

while [[ $# -gt 0 ]]
do
key="$1"
case $key in
    -b|--build)
    build="$2"
    shift # past argument
    shift # past value
    ;;
#    -g|--gateway)
#    gateway="$2"
#    shift # past argument
#    shift # past value
#    ;;
    -a|--auth)
    authentication="$2"
    shift # past argument
    shift # past value
    ;;
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
PRJ_STRC_FIELDS=4

declare -a projects
declare -a dependentProjects
i=0
projects[$i]="configuration-cloud-service"; projects[$i+1]="services/infra/config"; projects[$i+2]=0; projects[$i+3]="--spring.cloud.config.server.native.search-locations=$DIR/../services/infra/config/build/docker-volume/dev-configurations/"; i=$((i+$PRJ_STRC_FIELDS))
#projects[$i]="OAuth2-dev-server"; projects[$i+1]="services/infra/auth"; projects[$i+2]=0; projects[$i+3]=""; i=$((i+$PRJ_STRC_FIELDS))
projects[$i]="registry-cloud-service"; projects[$i+1]="services/infra/registry"; projects[$i+2]=10; projects[$i+3]=""; i=$((i+$PRJ_STRC_FIELDS))
i=0
#if [ "$gateway" = true ] ; then
    dependentProjects[$i]="client-gateway-cloud-service"; dependentProjects[$i+1]="services/infra/client-gateway"; dependentProjects[$i+2]=0; dependentProjects[$i+3]=""; i=$((i+$PRJ_STRC_FIELDS))
#fi
for bservice in "${businessServices[@]}"; do
    dependentProjects[$i]="$bservice-business-service"; dependentProjects[$i+1]="services/core/$bservice"; dependentProjects[$i+2]=0; dependentProjects[$i+3]=""; i=$((i+$PRJ_STRC_FIELDS))
done

dependentProjects[$i]="web-ui"; dependentProjects[$i+1]="services/web/web-ui"; dependentProjects[$i+2]=0; dependentProjects[$i+3]=""; i=$((i+$PRJ_STRC_FIELDS))

debugPort=5005
version=$OF_VERSION

startProject(){

    echo "##########################################################"
      echo Starting $1, debug port: $2
      echo "##########################################################"
      projectBuildPath=${OF_HOME}/$3/build
      bootstrapLocation=${OF_HOME}/$3/src/main/resources/bootstrap-dev.yml
      debugOptions=-agentlib:jdwp=transport=dt_socket,address=$2,server=y,suspend=n

      applicationOptions="--spring.profiles.active=native,dev \
      --spring.cloud.bootstrap.location=${bootstrapLocation} \
      ${projects[i+3]}"

      echo "pid file: $projectBuildPath/PIDFILE"
      if [ -f $projectBuildPath/PIDFILE ] ; then
        pid=$(<$projectBuildPath/PIDFILE)
      else
        pid=""
      fi
      if [ -n "$pid" -a -e /proc/$pid ]; then
        echo "${projects[i]} already running (pid: $pid)"
      else
        mkdir -p $projectBuildPath/logs
#        set -x
        java -Xms64m -Xmx128m -jar $projectBuildPath/libs/$1-$version.jar $applicationOptions 2>&1 > $projectBuildPath/logs/$(date '+%Y-%m-%d').log &
#        set +x
        echo $! > $projectBuildPath/PIDFILE

        echo "Started with pid: $!"
      fi
      echo

}

startCommand() {

    if [ "$build" = true ] ; then
        $OF_HOME/bin/build_all.sh $GRADLE_OPTIONS
        cd $CURRENT_PATH
    fi

    if [ "$resetConfiguration" = true ] ; then
        cd $OF_HOME
        echo "#### Preparing runtime data ####"
        echo "## Preparing business runtime data"
        cd services/core
        gradle copyWorkingDir $GRADLE_OPTIONS
        echo "## Preparing infrastucture runtime data"
        cd ../infra
        gradle copyWorkingDir $GRADLE_OPTIONS
        cd ..
        cd $CURRENT_PATH
    fi

    for ((i=0; i<${#projects[*]}; ));
    do
      startProject ${projects[i]} $debugPort ${projects[i+1]}
      debugPort=$((debugPort+1))
      i=$((i+$PRJ_STRC_FIELDS))
    done

    waitRegistryAndConfig

    for ((i=0; i<${#dependentProjects[*]}; ));
    do
      startProject ${dependentProjects[i]} $debugPort ${dependentProjects[i+1]}
      debugPort=$((debugPort+1))
      i=$((i+$PRJ_STRC_FIELDS))
    done
}

stopProject() {
    projectBuildPath=$2/build
    pid=$(<$projectBuildPath/PIDFILE)
    echo "##########################################################"
    echo "Stoping $1 (pid: $pid)"
    echo "##########################################################"
    echo
    kill $pid
}

stopCommand(){
  for ((i=0; i<${#projects[*]}; ));
  do
    stopProject ${projects[i]} ${projects[i+1]}
    i=$((i+$PRJ_STRC_FIELDS))
  done

  for ((i=0; i<${#dependentProjects[*]}; ));
  do
    stopProject ${dependentProjects[i]} ${dependentProjects[i+1]}
    i=$((i+$PRJ_STRC_FIELDS))
  done
}

projectStatus() {
#set -x
    projectBuildPath=$2/build
    pid=$(<$projectBuildPath/PIDFILE)
    if [ -n "$pid" ] && [ -e /proc/$pid ]; then
      echo -e "$1 (pid: $pid) : \033[0;32mRUNNING\033[0m"
    else
      echo -e "$1 (pid: $pid) : \033[0;31mSTOPPED\033[0m"
    fi
#    set +x
}

statusCommand(){
  echo "##########################################################"
  for ((i=0; i<${#projects[*]}; ));
  do
    projectStatus ${projects[i]} ${projects[i+1]}
    i=$((i+$PRJ_STRC_FIELDS))
  done
  for ((i=0; i<${#dependentProjects[*]}; ));
  do
    projectStatus ${dependentProjects[i]} ${dependentProjects[i+1]}
    i=$((i+$PRJ_STRC_FIELDS))
  done
  echo "##########################################################"

}

case $command in
  start)
  startCommand
#  exit 0;
  ;;
  stop)
  stopCommand
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
