#!/bin/bash
url=$2 
if [ -z $url ] 
then
	url="http://localhost"
fi
if [ -z $1 ]
then
    echo "Usage deleteBundle bundle_name opfab_url"
else
	echo "Will delete bundle $1 on $url"
	source ../getToken.sh $url
	curl -s -v -X DELETE "$url:2100/businessconfig/processes/$1" -H "Authorization:Bearer $token"
	echo ""
fi


