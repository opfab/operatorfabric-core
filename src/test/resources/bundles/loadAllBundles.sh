#!/bin/bash
for d in */; do
bundle=${d:0:-1}  #remove last character /
 ./loadBundle.sh $bundle $1
done

