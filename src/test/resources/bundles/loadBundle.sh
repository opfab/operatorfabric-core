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
	echo "Will load bundle $1 on $url"
	(
	cd $1
	tar -czf $1.tar.gz ./*
	mv $1.tar.gz ../
	cd ..
	source ../getToken.sh $url
	curl -s -v -X POST "$url:2100/businessconfig/processes" -H  "accept: application/json" -H  "Content-Type: multipart/form-data" -H "Authorization:Bearer $token" -F "file=@$1.tar.gz;type=application/gzip"
	echo ""
	rm $1.tar.gz
	)
fi


