#!/bin/bash
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

rm -R $POC_HOME/.gradle
rm -R $POC_HOME/.vscode
rm $POC_HOME/.project
rm -R $POC_HOME/.settings
rm $POC_NOSQL/.project
rm -R $POC_NOSQL/.settings

for prj in "${OF_COMPONENTS[@]}"; do
  hash="$(echo -n "$prj" | md5sum | sed 's/ .*$//')"
#   if [ ! -L $prj/build ]; then
#     if [ -d $prj/build ]; then
      rm -R $prj/build/*
      rm $prj/.classpath
      rm $prj/.project
      rm -R $prj/.settings
      rm -R $prj/bin
      rm -R $prj/out
#     fi
#   fi
done
