#!/bin/bash
url=$2 
if [ -z $url ] 
then
	url="http://localhost"
fi
if [ -z $1 ]
then
    echo "Usage loadBundle bundle_name opfab_url"
else
	echo "Will load processGroups $1 on $url"
	source ../getToken.sh $url
	curl -s -v -X POST "$url:2100/businessconfig/processgroups" -H  "accept: application/json" -H  "Content-Type: multipart/form-data" -H "Authorization:Bearer $token" -F "file=@$1"
	echo ""
fi


