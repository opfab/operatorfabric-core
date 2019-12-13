#!/usr/bin/env bash

SOURCE="${BASH_SOURCE[0]}"
while [ -h "$SOURCE" ]; do # resolve $SOURCE until the file is no longer a symlink
  DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"
  SOURCE="$(readlink "$SOURCE")"
  [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE" # if $SOURCE was a relative symlink, we need to resolve it relative to the path where the symlink file was located
done
DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"
export OF_HOME=$(realpath $DIR/..)
export OF_CORE=$OF_HOME/services/core
export OF_CLIENT=$OF_HOME/client
export OF_TOOLS=$OF_HOME/tools
export OF_INFRA=$OF_HOME/services/infra
export OF_WEB=$OF_HOME/services/web
export OF_COMPONENTS=( "$OF_TOOLS/swagger-spring-generators" "$OF_TOOLS/generic/utilities" "$OF_TOOLS/generic/test-utilities"  )
OF_COMPONENTS+=( "$OF_TOOLS/spring/spring-utilities" "$OF_TOOLS/spring/spring-amqp-time-utilities" "$OF_TOOLS/spring/spring-mongo-utilities" "$OF_TOOLS/spring/spring-oauth2-utilities" )
OF_COMPONENTS+=( "$OF_INFRA/config" "$OF_INFRA/auth" "$OF_INFRA/registry" "$OF_INFRA/client-gateway" )
OF_COMPONENTS+=( "$OF_CLIENT/time" "$OF_CLIENT/cards" "$OF_CLIENT/users")
OF_COMPONENTS+=("$OF_CORE/thirds" "$OF_CORE/time" "$OF_CORE/cards-publication" "$OF_CORE/cards-consultation" "$OF_CORE/users" "$OF_CORE/actions")
OF_COMPONENTS+=("$OF_WEB/web-ui")

export OF_REL_COMPONENTS=( "tools/swagger-spring-generators" "tools/generic/utilities" "tools/generic/test-utilities" )
OF_REL_COMPONENTS+=( "tools/spring/spring-utilities" "tools/spring/spring-amqp-time-utilities" "tools/spring/spring-mongo-utilities" "tools/spring/spring-oauth2-utilities" )
OF_REL_COMPONENTS+=( "services/infra/config" "services/infra/auth" "services/infra/registry" "services/infra/client-gateway" )
OF_REL_COMPONENTS+=( "client/time" "client/cards" "client/users")
OF_REL_COMPONENTS+=("services/core/thirds" "services/core/time" "services/core/cards-publication" "services/core/cards-consultation" "services/core/users" "services/core/actions" )
OF_REL_COMPONENTS+=("services/web/web-ui")

export OF_VERSION=$(cat "$OF_HOME/VERSION")

echo "OPERATORFABRIC ENVIRONMENT VARIABLES"

echo OF_HOME=$OF_HOME
echo OF_CORE=$OF_CORE
echo OF_CLIENT=$OF_CLIENT
echo OF_TOOLS=$OF_TOOLS
echo OF_INFRA=$OF_INFRA
echo
echo "OperatorFabric version is $OF_VERSION"
index=0
for prj in "${OF_COMPONENTS[@]}"; do
    echo OF_COMPONENTS[$index]=$prj
    index=$((index + 1))
done
