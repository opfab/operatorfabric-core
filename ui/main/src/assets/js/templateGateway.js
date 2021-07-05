/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


const templateGateway = {
    opfabEntityNames : null, 
    childCards: [],
    userAllowedToRespond : false,
    userMemberOfAnEntityRequiredToRespond : false,

    setEntityNames: function(entityNames){
        this.opfabEntityNames = entityNames;
       },

       
    // UTILITIES FOR TEMPLATE 

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

    redirectToBusinessMenu: function(menuId,menuItemId,params){
        const urlSplit = document.location.href.split('#');
        var  newUrl =  urlSplit[0] + '#/businessconfigparty/' + menuId + '/' + menuItemId ;
        if (!!params) newUrl +=  '?' + params;
        document.location.href = newUrl;
    },

    // True if user is allowed to respond to the current card :
    //  - his entity is allowed to respond 
    //  - he is member of a group having a perimeter permitting the response 
    isUserAllowedToRespond  : function() {
        return this.userAllowedToRespond;
    },

    // True if user is member of an entity required to respond to the current card
    isUserMemberOfAnEntityRequiredToRespond: function() {
        return this.userMemberOfAnEntityRequiredToRespond;
    },
    

    //
    // FUNCTIONS TO OVERRIDE BY TEMPLATES 
    //

    initTemplateGateway: function () {

        this.childCards =  [];
        this.userAllowedToRespond = false;
        this.userMemberOfAnEntityRequiredToRespond = false;

        // OpFab calls this function to inform the template that the card is locked
        this.lockAnswer = function () {
            // This function should be overridden in the template.
        };

        // OpFab calls this function to inform the template that the card is unlocked
        this.unlockAnswer = function () {
            // This function should be overridden in the template.
        };

        // OpFab calls this function to inform that the template has to apply child cards (called after template rendering and after change in child cards)
        this.applyChildCards =  function () {
            // This function should be overridden in the template.
        };

        // OpFab calls this function when lttd expire with expired set to true
        this.setLttdExpired =  function (expired) {
            // This function should be overridden in the template.
        };

        // OpFab calls this method to inform the template of the size of the screen dedicated to the card
        // size = 'md' for standard size 
        // size = 'lg' for large size , i.e when the card is in full screen mode
        this.setScreenSize =  function (size) {
            // This function should be overridden in the template.
        };

        // OpFab calls this method to get the form result when the user wants to send a response
        this.getUserResponse =  function () {
            console.log(new Date().toISOString(), ` Template.js : no getUserResponse method defined in template , valid set to true`);
            return this.isValid = undefined;
        }
}


};

