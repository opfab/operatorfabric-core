#!/bin/bash
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

# This part of the script allows custom certification authorities or certificates to be added to the JVM keystore
cp $JAVA_HOME/jre/lib/security/cacerts /tmp
chmod u+w /tmp/cacerts
./add-certificates.sh /certificates_to_add /tmp/cacerts

java -agentlib:jdwp=transport=dt_socket,address=5005,server=y,suspend=n -Djavax.net.ssl.trustStore=/tmp/cacerts -Djava.security.egd=file:/dev/./urandom  -jar /app.jar --spring.profiles.active=docker --spring.config.name=common,application $JAVA_OPTIONS

