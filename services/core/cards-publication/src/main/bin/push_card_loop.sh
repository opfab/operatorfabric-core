#!/bin/bash
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

publisher=TEST_PUBLISHER
process=TEST
content=empty
interval=5
url=http://localhost:2102/cards
processNumber=5
dateShift=0
severity=ACTION
useTimeSpan=false
payload="{ "$'\n'
payload+="    \"rootProp\": \"This is a root property\", "$'\n'
payload+="    \"level1\": { "$'\n'
payload+="      \"level1Prop\": \"This is a level1 property\", "$'\n'
payload+="      \"level1Array\": [ "$'\n'
payload+="        {\"level1ArrayProp\" : 1}, "$'\n'
payload+="        {\"level1ArrayProp\" : 2}, "$'\n'
payload+="        {\"level1ArrayProp\" : 3} "$'\n'
payload+="        ] "$'\n'
payload+="      }, "$'\n'
payload+="    \"rootArray\": [ "$'\n'
payload+="      \"value 1\", "$'\n'
payload+="      \"value 2\", "$'\n'
payload+="      \"value 3\" "$'\n'
payload+="      ] "$'\n'
payload+="    } "$'\n'

display_usage() {
	echo "This script sends card periodically to a card publication server to groups RTE, CORESO and user admin.\n"
	echo -e "Usage:\n"
	echo -e "\tpush_card_loop.sh.sh [OPTIONS] \n"
	echo -e "options:\n"
	echo -e "\t-u, --url  : string. POST url. Default to $url"
	echo -e "\t-i, --interval  : number. interval in seconds between card sendings. Defaults to $interval"
	echo -e "\t-p, --publisher  : string. Publisher service name. Defaults to $publisher"
	echo -e "\t-r, --process  : string. Process id suffix. Defaults to $process"
	echo -e "\t-c, --process-count  : number. Number of different process. Defaults to $processNumber"
	echo -e "\t-d, --date-shift  : number. millisecond date shift. Defaults to $dateShift"
    echo -e "\t-s, --severity : string. Card severity. Defaults to $severity"
	echo -e "\t-a, --payload  : specify an external json file as payload."
	echo -e "\t-t, --timeSpans  : use timeSpans instead of card start and end time. Defaults to $useTimeSpan"
}

# dateShift example values
# s 1 000
# m 60 000
# h	3 600 000
# day 86 400 000

while [[ $# -gt 0 ]]
do
key="$1"
# echo $key
case $key in
    -u|--url)
    url="$2"
    shift # past argument
    shift # past value
    ;;
    -d|--date-shift)
    dateShift="$2"
    shift # past argument
    shift # past value
    ;;
    -p|--publisher)
    publisher="$2"
    shift # past argument
    shift # past value
    ;;
    -a|--payload)
    payload=`cat $2`
    shift # past argument
    shift # past value
    ;;
    -r|--process)
    process="$2"
    shift # past argument
    shift # past value
    ;;
    -c|--process-count)
    processNumber="$2"
    shift # past argument
    shift # past value
    ;;
    -i|--interval)
    interval="$2"
    shift # past argument
    shift # past value
    ;;
    -s|--severity)
    severity="$2"
    shift # past argument
    shift # past value
    ;;
    -t|--timeSpans)
    useTimeSpan=true
    shift # past argument
    shift # past value
    ;;
    -h|--help)
    interval="$2"
    shift # past argument
display_usage
    exit 0
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

now=$(($(date +%s%N)/1000000 + dateShift))
plusOneH=$(($now + 3600000))
plusOneHTen=$(($now + 4200000))
plusTwoH=$(($now + 7200000))

#$1 publisher
#$2 processInstanceId
#$3 startDate
#$4 lttd
#$5 endDate
#$6 processNum
#$7 severity

piece_of_data(){
    date="  \"startDate\": $3, "$'\n'
    date+="  \"endDate\": $5, "$'\n'
    if [ $useTimeSpan ]; then
        date+="  \"timeSpans\": [ "$'\n'
        date+="    {"$'\n'
        date+="      \"start\": $3,"$'\n'
        date+="      \"end\": $5"$'\n'
        date+="    }"$'\n'
        date+="   ],"$'\n'
    fi
    piece=$'{\n'
    piece+="  \"publisher\": \"$1\", "$'\n'
    piece+="  \"processVersion\": \"1\", "$'\n'
    piece+="  \"process\": \"$2\", "$'\n'
    piece+="  \"processInstanceId\": \"$2$6\", "$'\n'
    piece+="  \"state\": \"firstState\", "$'\n'
#    piece+="  \"startDate\": $3, "$'\n'
    piece+=$date
    piece+="  \"endDate\": $5, "$'\n'
    piece+="  \"lttd\": $4, "$'\n'
    piece+="  \"severity\": \"$7\", "$'\n'
    piece+="  \"tags\": [ "$'\n'
    piece+="    \"$1\", "$'\n'
    piece+="    \"$2\" "$'\n'
    piece+="  ], "$'\n'
    piece+="  \"title\": { "$'\n'
    piece+="    \"key\": \"$2.title\", "$'\n'
    piece+="    \"parameters\": { \"value\": \"title value\" } "$'\n'
    piece+="    }, "$'\n'
    piece+="  \"summary\": { "$'\n'
    piece+="    \"key\": \"$2.summary\", "$'\n'
    piece+="    \"parameters\": { \"value\": \"summary value\" } "$'\n'
    piece+="    }, "$'\n'
    piece+="  \"data\":  "$'\n'
    piece+=$payload
    piece+="    , "$'\n'
    piece+="  \"details\": [ "$'\n'
    piece+="    { "$'\n'
    piece+="      \"title\": { \"key\": \"$2.detail.tab.first\" }, "$'\n'
    piece+="      \"templateName\": \"template1\" "$'\n'
    piece+="    }, "$'\n'
    piece+="    { "$'\n'
    piece+="      \"title\": { \"key\": \"$2.detail.tab.second\" }, "$'\n'
    piece+="      \"templateName\": \"template2\" "$'\n'
    piece+="    } "$'\n'
    piece+="    ], "$'\n'
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
    piece+="    }, "$'\n'
    piece+="  \"tags\": [ "$'\n'
    piece+="      \"tag1\", \"$2\" "$'\n'
    piece+="    ] "$'\n'
    piece+="} "$'\n'

    echo "$piece"
}

card_data(){
    data="["
    for((i=0;i<$processNumber;i=$((i+1))));
    do
        data+="$(piece_of_data $1 $2 $3 $4 $5 $i $6)"
        if((i<$((processNumber - 1)))); then
            data+=","
        fi
    done
    data+="]"
    echo "${data}"
}
while true
do
    echo "Preparing card data"
    cardData=$(card_data $publisher $process $plusOneHTen $plusOneH $plusTwoH $severity)
    echo $cardData > /tmp/tmpCard.json
    echo "Sending card data"
    curl --header "Content-Type: application/json" \
      --request POST \
      --data @/tmp/tmpCard.json \
      $url

    plusOneH=$((plusOneH+1000*interval))
    plusOneHTen=$((plusOneHTen+1000*interval))
    plusTwoH=$((plusTwoH+1000*interval))
    echo -e "\nWaiting..."
    sleep $interval
done
