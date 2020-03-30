#!/bin/bash

certificates_to_add=$1
export cacerts=$2

# This function adds certificate from the given file to the $cacerts keystore with its filename as alias
add_certif_from_file() {
    filepath=$1
    alias=$(basename "./${filepath%.*}")
    $JAVA_HOME/bin/keytool -import -keystore $cacerts -file $filepath -alias $alias -storepass changeit -noprompt
}; 
export -f add_certif_from_file;

find $certificates_to_add -type f -exec bash -c 'add_certif_from_file "$0"' {} \;

