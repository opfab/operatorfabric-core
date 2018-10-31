#!/bin/bash
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

. ${BASH_SOURCE%/*}/load_variables.sh

sdk use gradle 4.7
sdk use java 8.0.163-zulu
sdk use maven 3.5.3
nvm use v10.10.0
