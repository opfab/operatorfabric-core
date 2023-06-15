/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import 'jest'
import CardsRoutingUtilities from '../src/domain/application/cardRoutingUtilities';





describe('Card routing', function () {

    it('Card routing using only group', async function() {
        const user = {login: 'operator_1', groups: ['Dispatcher'], entities: ['ENTITY1']};
        const perimetersWithReceiveAndWriteRight = [{process: "defaultProcess", stateRights:[{state:"processState",right:"ReceiveAndWrite",filteringNotificationAllowed:true}]} ];
        const perimetersWithReceiveRight = [{process: "defaultProcess", stateRights:[{state:"processState",right:"Receive",filteringNotificationAllowed:true}]} ];

        const cardSentToGroupOfTheUser = {uid: "1001", id:"defaultProcess.process1", process: "defaultProcess", state: "processState", groupRecipients:["Dispatcher"]};
        const cardSentToGroupNotOfUser = {uid: "1001", id:"defaultProcess.process1", process: "defaultProcess", state: "processState", groupRecipients:["Supervisor"]};
        const cardSentToGroupOfTheUserAndEmptyEntities = {uid: "1001", id:"defaultProcess.process1", process: "defaultProcess", state: "processState", groupRecipients:["Dispatcher"], entityRecipients:[]};
        const cardSentToGroupNotOfUserAndEmptyEntities = {uid: "1001", id:"defaultProcess.process1", process: "defaultProcess", state: "processState", groupRecipients:["Supervisor"], entityRecipients:[]};

        const userSettings = {}

        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(user, perimetersWithReceiveAndWriteRight, userSettings, cardSentToGroupOfTheUser)).toBeTruthy();
        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(user, perimetersWithReceiveAndWriteRight, userSettings, cardSentToGroupNotOfUser)).toBeFalsy();
        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(user, perimetersWithReceiveAndWriteRight, userSettings, cardSentToGroupOfTheUserAndEmptyEntities)).toBeTruthy();
        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(user, perimetersWithReceiveAndWriteRight, userSettings, cardSentToGroupNotOfUserAndEmptyEntities)).toBeFalsy();

        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(user, perimetersWithReceiveRight, userSettings, cardSentToGroupOfTheUser)).toBeTruthy();
        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(user, perimetersWithReceiveRight, userSettings, cardSentToGroupNotOfUser)).toBeFalsy();
        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(user, perimetersWithReceiveRight, userSettings, cardSentToGroupOfTheUserAndEmptyEntities)).toBeTruthy();
        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(user, perimetersWithReceiveRight, userSettings, cardSentToGroupNotOfUserAndEmptyEntities)).toBeFalsy();
    })


    it('Card routing using only entity', async function() {
        const user = {login: 'operator_1', groups: ['Dispatcher'], entities: ['ENTITY1']};
        const perimetersWithReceiveAndWriteRight = [{process: "defaultProcess", stateRights:[{state:"processState",right:"ReceiveAndWrite",filteringNotificationAllowed:true}]} ];
        const perimetersWithReceiveRight = [{process: "defaultProcess", stateRights:[{state:"processState",right:"Receive",filteringNotificationAllowed:true}]} ];

        const cardSentToEntityOfTheUser = {uid: "1001", id:"defaultProcess.process1", process: "defaultProcess", state: "processState", entityRecipients:["ENTITY1"]};
        const cardSentToEntityNotOfUser = {uid: "1001", id:"defaultProcess.process1", process: "defaultProcess", state: "processState", entityRecipients:["ENTITY2"]};
        const cardSentToEntityOfTheUserAndEmptyGroups = {uid: "1001", id:"defaultProcess.process1", process: "defaultProcess", state: "processState", groupRecipients:[], entityRecipients:["ENTITY1"]};
        const cardSentToEntityNotOfUserAndEmptyGrroup = {uid: "1001", id:"defaultProcess.process1", process: "defaultProcess", state: "processState", groupRecipients:[], entityRecipients:["ENTITY2"]};

        const userSettings = {}

        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(user, perimetersWithReceiveAndWriteRight, userSettings, cardSentToEntityOfTheUser)).toBeTruthy();
        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(user, perimetersWithReceiveAndWriteRight, userSettings, cardSentToEntityNotOfUser)).toBeFalsy();
        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(user, perimetersWithReceiveAndWriteRight, userSettings, cardSentToEntityOfTheUserAndEmptyGroups)).toBeTruthy();
        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(user, perimetersWithReceiveAndWriteRight, userSettings, cardSentToEntityNotOfUserAndEmptyGrroup)).toBeFalsy();

        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(user, perimetersWithReceiveRight, userSettings, cardSentToEntityOfTheUser)).toBeTruthy();
        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(user, perimetersWithReceiveRight, userSettings, cardSentToEntityNotOfUser)).toBeFalsy();
        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(user, perimetersWithReceiveRight, userSettings, cardSentToEntityOfTheUserAndEmptyGroups)).toBeTruthy();
        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(user, perimetersWithReceiveRight, userSettings, cardSentToEntityNotOfUserAndEmptyGrroup)).toBeFalsy();
    })


    it('Card routing with no groups and no entities', async function() {
        const user = {login: 'operator_1', groups: ['Dispatcher'], entities: ['ENTITY1']};
        const perimetersWithReceiveAndWriteRight = [{process: "defaultProcess", stateRights:[{state:"processState",right:"ReceiveAndWrite",filteringNotificationAllowed:true}]} ];
        const perimetersWithReceiveRight = [{process: "defaultProcess", stateRights:[{state:"processState",right:"Receive",filteringNotificationAllowed:true}]} ];

        const cardSentToEmptyGroupsAndEnties = {uid: "1001", id:"defaultProcess.process1", process: "defaultProcess", state: "processState", groupRecipients:[], entityRecipients:[]};
        const cardwithNoEntityAndGroup = {uid: "1001", id:"defaultProcess.process1", process: "defaultProcess", state: "processState"};

        const userSettings = {}

        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(user, perimetersWithReceiveAndWriteRight, userSettings, cardSentToEmptyGroupsAndEnties)).toBeFalsy();
        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(user, perimetersWithReceiveAndWriteRight, userSettings, cardwithNoEntityAndGroup)).toBeFalsy();

        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(user, perimetersWithReceiveRight, userSettings, cardSentToEmptyGroupsAndEnties)).toBeFalsy();
        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(user, perimetersWithReceiveRight, userSettings, cardwithNoEntityAndGroup)).toBeFalsy();
    })
   
    it('Card routing to user recipient', async function() {
        const user = {login: 'operator_1'};
        const perimetersWithReceiveAndWriteRight = [{process: "defaultProcess", stateRights:[{state:"processState",right:"ReceiveAndWrite",filteringNotificationAllowed:true}]} ];
        const perimetersWithReceiveRight = [{process: "defaultProcess", stateRights:[{state:"processState",right:"Receive",filteringNotificationAllowed:true}]} ];

        const card = {uid: "1001", id:"defaultProcess.process1", process: "defaultProcess", state: "processState", userRecipients:["operator_1"]};

        const userSettings = {}

        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(user, perimetersWithReceiveAndWriteRight,userSettings,  card)).toBeTruthy();
        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(user, perimetersWithReceiveRight,userSettings,  card)).toBeTruthy();
    })


    it('Card routing with filtering notification', async function() {
        const user = {login: 'operator_1'};
        const perimetersWithReceiveAndWriteRight = [{process: "defaultProcess", stateRights:[{state:"processState",right:"ReceiveAndWrite",filteringNotificationAllowed:true}]} ];
        const perimetersWithReceiveRight = [{process: "defaultProcess", stateRights:[{state:"processState",right:"Receive",filteringNotificationAllowed:true}]} ];

        const card = {uid: "1001", id:"defaultProcess.process1", process: "defaultProcess", state: "processState", userRecipients:["operator_1"]};

        const userSettingsWithNoFilteringNotification = {}
        const userSettingsWithFilteringNotification = {processesStatesNotNotified:{defaultProcess: ["processState"]}}
        const userSettingsWithFilteringNotificationNotForProcessState = {processesStatesNotNotified:{defaultProcess: ["otherState"]}}

        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(user, perimetersWithReceiveAndWriteRight, userSettingsWithNoFilteringNotification,  card)).toBeTruthy();
        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(user, perimetersWithReceiveAndWriteRight, userSettingsWithFilteringNotification, card)).toBeFalsy();
        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(user, perimetersWithReceiveAndWriteRight, userSettingsWithFilteringNotificationNotForProcessState, card)).toBeTruthy();

        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(user, perimetersWithReceiveRight, userSettingsWithNoFilteringNotification,  card)).toBeTruthy();
        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(user, perimetersWithReceiveRight, userSettingsWithFilteringNotification, card)).toBeFalsy();
        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(user, perimetersWithReceiveRight, userSettingsWithFilteringNotificationNotForProcessState, card)).toBeTruthy();
    })
})
