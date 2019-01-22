#!/bin/bash
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

URL="http://$REGISTRY_HOST:$REGISTRY_PORT"

test_url() {
    # store the whole response with the status at the and
    echo "testing $1"
    HTTP_STATUS=$(curl -I "$1" 2>/dev/null|sed -n 1p|awk '{print $2}')
    echo "return status is $HTTP_STATUS"
    [ -n "$HTTP_STATUS" ] && [ "$HTTP_STATUS" = 200 ]
    return
}
maxRetry=50
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
    echo "Registry is ready, now waiting for $DEPENDS_ON to be ready"
    retry=0
    while ! test_url "$URL/eureka/apps/$DEPENDS_ON" && [ $retry -lt $maxRetry ]; do
        echo "$DEPENDS_ON is not available in registry at $URL/eureka/apps/$DEPENDS_ON, retry in 5s ($retry)"
        retry=$((retry+1))
        sleep 5
    done
    if [ $retry -ge $maxRetry ] ; then
        echo "$DEPENDS_ON was not declared in registry after $retry retries"
        exit 1
     else
     echo "$DEPENDS_ON is declared in Registry, starting Client Gateway service"
        ./script.sh
    fi
fi
