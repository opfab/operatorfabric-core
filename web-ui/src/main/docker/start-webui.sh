#!/bin/bash

# Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
# See AUTHORS.txt
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
# SPDX-License-Identifier: MPL-2.0
# This file is part of the OperatorFabric project.
 
: '
  If the resolver is not indicated in the nginx conf, there could be side-effects (url not reachable). To solve this we must indicate
  the IP address available in the /etc/resolv.conf file. Given that this address can change between containers, it must be indicated
  dynamically => this is the purpose of this file
  The nginx.conf file is moved from /etc/nginx to /personal-conf and the default.conf file is moved from /etc/nginx/conf.d to
  /personal-conf/conf.d. Then nginx is run by indicating as the config directory /personal-conf
  The container will be run by running this file
'

export resolver=$(grep nameserver /etc/resolv.conf | awk '{ print $2 }')
resolver_replace="resolver $resolver ipv6=off;"
resolver_replaced=".*resolver.*"
nginx_conf_path_default="/etc/nginx"
nginx_conf_path_personal="/personal-conf"
defaultconf_default="$nginx_conf_path_default/conf.d/default.conf"
defaultconf_personal="$nginx_conf_path_personal/conf.d/default.conf"

printenv | grep resolver
echo "resolver_replace: $resolver_replace"
echo "resolver_replaced: $resolver_replaced"
echo "nginx_conf_path_default: $nginx_conf_path_default"
echo "nginx_conf_path_personal: $nginx_conf_path_personal"
echo "defaultconf_default: ${defaultconf_default}"
echo "defaultconf_personal: ${defaultconf_personal}"

mkdir /personal-conf
mkdir /personal-conf/conf.d

if grep -qe "$resolver_replaced" $defaultconf_default
then
    sed "s/$resolver_replaced/$resolver_replace/" $defaultconf_default > $defaultconf_personal
else
    sed "1i $resolver_replace" $defaultconf_default > $defaultconf_personal
fi

echo "The resolver in the personal default.conf:"
grep -e "$resolver_replaced" $defaultconf_personal

cat $nginx_conf_path_default/nginx.conf > $nginx_conf_path_personal/nginx.conf
sed -i "s/$(echo $nginx_conf_path_default | sed 's/\//\\\//g')\/conf\.d/$(echo $nginx_conf_path_personal | sed 's/\//\\\//g')\/conf\.d/" $nginx_conf_path_personal/nginx.conf

echo "The conf.d path in the personal nginx.conf file:"
grep "conf.d" $nginx_conf_path_personal/nginx.conf

/usr/sbin/crond

nginx -c /personal-conf/nginx.conf -g "daemon off;"
