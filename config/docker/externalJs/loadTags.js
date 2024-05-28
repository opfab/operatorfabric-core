/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

console.log(new Date().toISOString(), 'Custom getTags function loaded');  

async function getTags(screenName ) {
   let tags;
   if (screenName === 'processMonitoring')
      tags = [{
         "label": "Label for custom tag 1",
         "value": "custom1"
      },
      {
         "label": "Label for custom tag 2",
         "value": "custom2"
      }];
   return tags;
};

opfab.businessconfig.registerFunctionToGetTags(getTags);