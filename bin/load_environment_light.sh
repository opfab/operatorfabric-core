#!/bin/bash
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

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
#export OF_MICRO=$OF_HOME/micro
export OF_COMPONENTS=( "$OF_TOOLS/swagger-spring-generators" "$OF_TOOLS/utilities" "$OF_TOOLS/test-utilities" "$OF_TOOLS/swagger-spring-generators" )
OF_COMPONENTS+=( "$OF_TOOLS/spring-utilities" "$OF_TOOLS/spring-amqp-time-utilities" "$OF_TOOLS/spring-mongo-utilities" "$OF_TOOLS/spring-oauth2-utilities" )
OF_COMPONENTS+=( "$OF_INFRA/config" "$OF_INFRA/auth" "$OF_INFRA/registry" "$OF_INFRA/client-gateway" )
OF_COMPONENTS+=( "$OF_CLIENT/time" "$OF_CLIENT/cards" "$OF_CLIENT/users")
OF_COMPONENTS+=("$OF_CORE/thirds" "$OF_CORE/time" "$OF_CORE/cards-publication" "$OF_CORE/cards-consultation" "$OF_CORE/users" )
#export OF_COMPONENTS=("$OF_CORE/thirds" "$OF_TOOLS/swagger-spring-generators")

echo "OPERATOR FABRIC ENVIRONMENT VARIABLES"

echo OF_HOME=$OF_HOME
echo OF_CORE=$OF_CORE
echo OF_CLIENT=$OF_CLIENT
echo OF_TOOLS=$OF_TOOLS
echo OF_INFRA=$OF_INFRA
echo OF_MICRO=$OF_MICRO
index=0
for prj in "${OF_COMPONENTS[@]}"; do
    echo OF_COMPONENTS[$index]=$prj
    index=$((index + 1))
done

sdk use gradle 4.7
sdk use java 8.0.163-zulu
sdk use maven 3.5.3
nvm use v10.10.0
