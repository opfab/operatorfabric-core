/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


const templateGateway = {
    opfabEntityNames : null, 

    validyForm: function(formData=null) {
        console.log(new Date().toISOString() , ` Template.js : no validyForm method define in template , valid set to true`);
        return this.isValid = undefined;
    },

    setEntityNames: function(entityNames){
        this.opfabEntityNames = entityNames;
       },
       
    getEntityName: function(entityId) {
        if (!this.opfabEntityNames) {
            console.log(new Date().toISOString() , ` Template.js : no entities information loaded`);
            return entityId;
        }
        if (!this.opfabEntityNames.has(entityId)) {
            console.log(new Date().toISOString() , ` Template.js : entityId ${entityId} is unknown`);
            return entityId;
        }
        return this.opfabEntityNames.get(entityId);
    },

    lockAnswer: function() {},
    applyChildCards: function() {},
    unlockAnswer: function() {},
    setLttdExpired: function(expired) {},
    setScreenSize: function(size) {},
    childCards: []
    
};

