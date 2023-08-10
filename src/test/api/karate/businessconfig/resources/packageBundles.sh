
# Copyright (c) 2023, RTE (http://www.rte-france.com)
# See AUTHORS.txt
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
# SPDX-License-Identifier: MPL-2.0
# This file is part of the OperatorFabric project.

cd bundle_api_test 
tar -czvf bundle_api_test.tar.gz config.json i18n.json css/ template/ 
mv bundle_api_test.tar.gz ../
cd ..

cd bundle_api_test_v2
tar -czvf bundle_api_test_v2.tar.gz config.json i18n.json css/ template/ 
mv bundle_api_test_v2.tar.gz ../
cd ..

cd bundle_test_action
tar -czvf bundle_test_action.tar.gz config.json i18n.json template/ 
mv bundle_test_action.tar.gz ../
cd ..

cd bundle_api_test_apogee
tar -czvf bundle_api_test_apogee.tar.gz config.json i18n.json css/ template/ 
mv bundle_api_test_apogee.tar.gz ../
cd ..

cd ../../../../resources/bundles/defaultProcess_V1
tar -czvf bundle_defaultProcess_V1.tar.gz config.json i18n.json css/ template/
mv bundle_defaultProcess_V1.tar.gz ../../../api/karate/businessconfig/resources/
cd ../../../api/karate/businessconfig/resources

cd bundle_api_test_with_newState
tar -czvf bundle_api_test_with_newState.tar.gz config.json i18n.json css/ template/
mv bundle_api_test_with_newState.tar.gz ../
cd ..

cd bundle_api_test_without_i18n_file
tar -czvf bundle_api_test_without_i18n_file.tar.gz config.json css/ template/
mv bundle_api_test_without_i18n_file.tar.gz ../
cd ..

cd bundle_process_1
tar -czvf bundle_process_1.tar.gz config.json i18n.json css/ template/
mv bundle_process_1.tar.gz ../
cd ..

cd bundle_process_2
tar -czvf bundle_process_2.tar.gz config.json i18n.json css/ template/
mv bundle_process_2.tar.gz ../
cd ..

cd bundle_processDeleteUserCard
tar -czvf bundle_processDeleteUserCard.tar.gz config.json i18n.json css/ template/
mv bundle_processDeleteUserCard.tar.gz ../
cd ..


cd bundle_api_test_with_forbidden_processId
tar -czvf bundle_api_test_with_forbidden_processId.tar.gz config.json css/ template/
mv bundle_api_test_with_forbidden_processId.tar.gz ../
cd ..

cd bundle_supervisor
tar -czvf bundle_supervisor.tar.gz config.json i18n.json template/
mv bundle_supervisor.tar.gz ../
cd ..