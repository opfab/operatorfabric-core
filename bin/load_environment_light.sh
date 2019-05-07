#!/bin/bash

. ${BASH_SOURCE%/*}/load_variables.sh

sdk use gradle 5.1.1
sdk use java 8.0.212-zulu
sdk use maven 3.5.3
nvm use v10.10.0
