/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

const usercardTemplateGateway = {

    editionMode: null,
    childCard: null,
    currentState: null,
    currentProcess: null,
    startDate: null,
    endDate: null,
    lttd: null,

    setUserEntityChildCardFromCurrentCard : function(childCard){
        this.childCard = childCard;
    },
    
    // The template calls this method to get the editon mode (CREATE/EDITION)
    getEditionMode() {
        return this.editionMode;
    },

    getUserEntityChildCardFromCurrentCard() {
        return this.childCard;
    },

    getCurrentState() {
        return this.currentState;
    },

    getCurrentProcess() {
        return this.currentProcess;
    },

    getStartDate() {
        return this.startDate;
    },

    getEndDate() {
        return this.endDate;
    },

    getLttd() {
        return this.lttd;
    },

    setInitialStartDate: function(start)  {
        this.startDate = start;
    },

    setInitialEndDate: function(endDate)  {
        this.endDate = endDate;
    },

    setInitialLttd: function(lttd)  {
        this.lttd = lttd;
    },

    initUsercardTemplateGateway() {
        this.editionMode=  null;
        this.childCard = null;
        this.currentState = null;
        this.currentProcess = null;
        this.startDate = null;
        this.endDate = null;
        this.lttd = null;
    }
};

