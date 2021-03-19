#!/bin/bash
url=$1 
if [[ -z $url ]]
then
	url="http://localhost"
fi

echo "Get token on $url"

access_token_pattern='"access_token":"([^"]+)"'
response=$(curl -s -X POST -d "username=admin&password=test&grant_type=password&client_id=opfab-client" $url:2002/auth/token)
if [[ $response =~ $access_token_pattern ]] ; then
	export token=${BASH_REMATCH[1]}
fi
echo  token=$token



