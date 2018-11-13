#!/bin/bash

. ${BASH_SOURCE%/*}/load_variables.sh

sdk use gradle 4.7
sdk use java 8.0.181-zulu
sdk use maven 3.5.3
nvm use v10.10.0
