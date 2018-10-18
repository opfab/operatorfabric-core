#!/bin/bash
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

publisher=defaultPublisher
process=defaultProcess
content=empty
interval=5
url=http://localhost:2102/cards
processNumber=5

display_usage() {
	echo "This script sends card periodically to a card publication server to groups RTE, CORESO and user admin.\n"
	echo -e "Usage:\n"
	echo -e "\tpush_card_loop.sh.sh [OPTIONS] \n"
	echo -e "options:\n"
	echo -e "\t-u, --url  : string. POST url. Default to $url"
	echo -e "\t-i, --interval  : number. interval in seconds between card sendings. Defaults to $interval"
	echo -e "\t-p, --publisher  : string. Publisher service name. Defaults to $publisher"
	echo -e "\t-r, --process  : string. Process id suffix. Defaults to $defaultProcess"
	echo -e "\t-c, --processCount  : number. Number of different process. Defaults to $processNumber"
}

while [[ $# -gt 0 ]]
do
key="$1"
echo $key
case $key in
    -u|--url)
    url="$2"
    shift # past argument
    shift # past value
    ;;
    -p|--publisher)
    publisher="$2"
    shift # past argument
    shift # past value
    ;;
    -r|--process)
    process="$2"
    shift # past argument
    shift # past value
    ;;
    -c|--content)
    content="$2"
    shift # past argument
    shift # past value
    ;;
    -i|--interval)
    interval="$2"
    shift # past argument
    shift # past value
    ;;
    -h|--help)
    interval="$2"
    shift # past argument

    ;;
    *)    # unknown option
    POSITIONAL+=("$1") # save it in an array for later
    shift # past argument
    ;;
esac
done
echo publisher = "${publisher}"
echo process = "${process}"
echo content   = "${content}"
echo interval  = "${interval}"

now=$(($(date +%s%N)/1000000))
plusOneH=$(($now + 3600000))
plusOneHTen=$(($now + 4200000))

#$1 publisher
#$2 processId
#$3 startDate
#$4 lttd
#$5 processNum
piece_of_data(){
    piece=$'{\n'
    piece+="  \"publisher\": \"$1\", "$'\n'
    piece+="  \"publisherVersion\": \"0.0.1\", "$'\n'
    piece+="  \"processId\": \"$2$5\", "$'\n'
    piece+="  \"startDate\": $3, "$'\n'
    piece+="  \"lttd\": $4, "$'\n'
    piece+="  \"severity\": \"ACTION\", "$'\n'
    piece+="  \"tags\": [ "$'\n'
    piece+="    \"$1\", "$'\n'
    piece+="    \"$2\" "$'\n'
    piece+="  ], "$'\n'
    piece+="  \"title\": { "$'\n'
    piece+="    \"key\": \"$1.$2.title\" "$'\n'
    piece+="    }, "$'\n'
    piece+="  \"summary\": { "$'\n'
    piece+="    \"key\": \"$1.$2.summary\" "$'\n'
    piece+="    }, "$'\n'
    piece+="  \"recipient\": { "$'\n'
    piece+="    \"type\": \"UNION\", "$'\n'
    piece+="    \"recipients\": [ "$'\n'
    piece+="        { "$'\n'
    piece+="          \"type\": \"GROUP\", "$'\n'
    piece+="          \"identity\": \"RTE\" "$'\n'
    piece+="        }, "$'\n'
    piece+="        { "$'\n'
    piece+="          \"type\": \"GROUP\", "$'\n'
    piece+="          \"identity\": \"CORESO\" "$'\n'
    piece+="        }, "$'\n'
    piece+="        { "$'\n'
    piece+="          \"type\": \"USER\", "$'\n'
    piece+="          \"identity\": \"admin\" "$'\n'
    piece+="        } "$'\n'
    piece+="      ] "$'\n'
    piece+="    } "$'\n'
    piece+="} "$'\n'

    echo "$piece"
}

card_data(){
    data="["
    for((i=0;i<$processNumber;i=$((i+1))));
    do
        data+="$(piece_of_data $1 $2 $3 $4 $i)"
        if((i<$((processNumber - 1)))); then
            data+=","
        fi
    done
    data+="]"
    echo "${data}"
}

while true
do
    cardData=$(card_data $publisher $process $plusOneHTen $plusOneH)
#    echo "sending $cardData"
    curl --header "Content-Type: application/json" \
      --request POST \
      --data "$cardData" \
      $url

    plusOneH=$((plusOneH+1000*interval))
    plusOneHTen=$((plusOneHTen+1000*interval))
    echo -e "\nWaiting..."
    sleep $interval
done