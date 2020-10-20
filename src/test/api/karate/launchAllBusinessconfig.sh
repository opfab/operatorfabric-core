#/bin/sh

# Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
# See AUTHORS.txt
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
# SPDX-License-Identifier: MPL-2.0
# This file is part of the OperatorFabric project.

rm -rf target

echo "Zip all bundles"
cd businessconfig/resources
./packageBundles.sh
cd ../..

echo "Launch Karate test"
java -jar karate.jar                      \
      businessconfig/deleteBundle.feature `#nice to be the very first one`\
      businessconfig/deleteBundleVersion.feature          \
      businessconfig/uploadBundle.feature                 \
      businessconfig/getABusinessconfig.feature           \
      businessconfig/getCss.feature                       \
      businessconfig/getDetailsBusinessconfig.feature     \
      businessconfig/getI18n.feature                      \
      businessconfig/getBusinessconfigActions.feature     \
      businessconfig/getBusinessconfig.feature            \
      businessconfig/getBusinessconfigTemplate.feature    \
      businessconfig/getProcessGroups.feature             \
      businessconfig/uploadProcessGroupsFile.feature      \
      businessconfig/getResponseBusinessconfig.feature    \
      businessconfig/security.feature
