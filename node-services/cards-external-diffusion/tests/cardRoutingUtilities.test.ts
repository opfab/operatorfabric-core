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

    let user = {login: 'operator_1', groups: ['Dispatcher'], entities: ['ENTITY1']};
    const perimetersWithReceiveAndWriteRight = [{process: "defaultProcess", state: "processState", rights: "ReceiveAndWrite", filteringNotificationAllowed: true}];
    const perimetersWithReceiveRight = [{process: "defaultProcess", state: "processState", rights: "Receive", filteringNotificationAllowed: true}];

    const currentUserWithReceiveAndWriteRight = {userData: user, email: 'test@opfab.com', processesStatesNotifiedByEmail: {defaultProcess: ["processState"]}, computedPerimeters: perimetersWithReceiveAndWriteRight};

    const currentUserWithReceiveRight = {userData: user, email: 'test@opfab.com', processesStatesNotifiedByEmail: {defaultProcess: ["processState"]}, computedPerimeters: perimetersWithReceiveRight};

    it('Card routing using only group', async function() {

        const cardSentToGroupOfTheUser = {uid: "1001", id:"defaultProcess.process1", process: "defaultProcess", state: "processState", groupRecipients:["Dispatcher"]};
        const cardSentToGroupNotOfUser = {uid: "1001", id:"defaultProcess.process1", process: "defaultProcess", state: "processState", groupRecipients:["Supervisor"]};
        const cardSentToGroupOfTheUserAndEmptyEntities = {uid: "1001", id:"defaultProcess.process1", process: "defaultProcess", state: "processState", groupRecipients:["Dispatcher"], entityRecipients:[]};
        const cardSentToGroupNotOfUserAndEmptyEntities = {uid: "1001", id:"defaultProcess.process1", process: "defaultProcess", state: "processState", groupRecipients:["Supervisor"], entityRecipients:[]};

        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(currentUserWithReceiveAndWriteRight, cardSentToGroupOfTheUser)).toBeTruthy();
        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(currentUserWithReceiveAndWriteRight, cardSentToGroupNotOfUser)).toBeFalsy();
        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(currentUserWithReceiveAndWriteRight, cardSentToGroupOfTheUserAndEmptyEntities)).toBeTruthy();
        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(currentUserWithReceiveAndWriteRight, cardSentToGroupNotOfUserAndEmptyEntities)).toBeFalsy();

        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(currentUserWithReceiveRight, cardSentToGroupOfTheUser)).toBeTruthy();
        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(currentUserWithReceiveRight, cardSentToGroupNotOfUser)).toBeFalsy();
        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(currentUserWithReceiveRight, cardSentToGroupOfTheUserAndEmptyEntities)).toBeTruthy();
        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(currentUserWithReceiveRight, cardSentToGroupNotOfUserAndEmptyEntities)).toBeFalsy();
    })


    it('Card routing using only entity', async function() {

        const cardSentToEntityOfTheUser = {uid: "1001", id:"defaultProcess.process1", process: "defaultProcess", state: "processState", entityRecipients: ["ENTITY1"]};
        const cardSentToEntityNotOfUser = {uid: "1001", id:"defaultProcess.process1", process: "defaultProcess", state: "processState", entityRecipients: ["ENTITY2"]};
        const cardSentToEntityOfTheUserAndEmptyGroups = {uid: "1001", id:"defaultProcess.process1", process: "defaultProcess", state: "processState", groupRecipients: [], entityRecipients: ["ENTITY1"]};
        const cardSentToEntityNotOfUserAndEmptyGroup = {uid: "1001", id:"defaultProcess.process1", process: "defaultProcess", state: "processState", groupRecipients: [], entityRecipients: ["ENTITY2"]};

        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(currentUserWithReceiveAndWriteRight, cardSentToEntityOfTheUser)).toBeTruthy();
        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(currentUserWithReceiveAndWriteRight, cardSentToEntityNotOfUser)).toBeFalsy();
        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(currentUserWithReceiveAndWriteRight, cardSentToEntityOfTheUserAndEmptyGroups)).toBeTruthy();
        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(currentUserWithReceiveAndWriteRight, cardSentToEntityNotOfUserAndEmptyGroup)).toBeFalsy();

        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(currentUserWithReceiveRight, cardSentToEntityOfTheUser)).toBeTruthy();
        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(currentUserWithReceiveRight, cardSentToEntityNotOfUser)).toBeFalsy();
        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(currentUserWithReceiveRight, cardSentToEntityOfTheUserAndEmptyGroups)).toBeTruthy();
        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(currentUserWithReceiveRight, cardSentToEntityNotOfUserAndEmptyGroup)).toBeFalsy();
    })


    it('Card routing with no groups and no entities', async function() {

        const cardSentToEmptyGroupsAndEntities = {uid: "1001", id:"defaultProcess.process1", process: "defaultProcess", state: "processState", groupRecipients:[], entityRecipients:[]};
        const cardWithNoEntityAndGroup = {uid: "1001", id:"defaultProcess.process1", process: "defaultProcess", state: "processState"};

        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(currentUserWithReceiveAndWriteRight, cardSentToEmptyGroupsAndEntities)).toBeFalsy();
        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(currentUserWithReceiveAndWriteRight, cardWithNoEntityAndGroup)).toBeFalsy();

        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(currentUserWithReceiveRight, cardSentToEmptyGroupsAndEntities)).toBeFalsy();
        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(currentUserWithReceiveRight, cardWithNoEntityAndGroup)).toBeFalsy();
    })
   
    it('Card routing to user recipient', async function() {

        const card = {uid: "1001", id: "defaultProcess.process1", process: "defaultProcess", state: "processState", userRecipients: ["operator_1"]};

        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(currentUserWithReceiveAndWriteRight, card)).toBeTruthy();
        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(currentUserWithReceiveRight, card)).toBeTruthy();
    })


    it('Card routing to user recipient but without mail notif option activated', async function() {

        const card = {uid: "1001", id: "defaultProcess.process1", process: "defaultProcess", state: "processState", userRecipients: ["operator_1"]};

        const currentUserWithReceiveAndWriteRightNoMail = {userData: user, computedPerimeters: perimetersWithReceiveAndWriteRight};

        const currentUserWithReceiveRightNoMail = {userData: user, computedPerimeters: perimetersWithReceiveRight};

        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(currentUserWithReceiveAndWriteRightNoMail, card)).toBeFalsy();
        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(currentUserWithReceiveRightNoMail, card)).toBeFalsy();
    })


    it('Card routing to user recipient but without mail notif option activated for this process/state', async function() {

        const card = {uid: "1001", id: "defaultProcess.process1", process: "defaultProcess", state: "processState", userRecipients: ["operator_1"]};


        const currentUserWithReceiveAndWriteRightNoMailForProcessState = {userData: user, email: 'test@opfab.com', processesStatesNotifiedByEmail: {defaultProcess: ["messageState"]}, computedPerimeters: perimetersWithReceiveAndWriteRight};

        const currentUserWithReceiveRightNoMailForProcessState = {userData: user, email: 'test@opfab.com', processesStatesNotifiedByEmail: {defaultProcess: ["messageState"]}, computedPerimeters: perimetersWithReceiveRight};
    
        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(currentUserWithReceiveAndWriteRightNoMailForProcessState, card)).toBeFalsy();
        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(currentUserWithReceiveRightNoMailForProcessState, card)).toBeFalsy();
    })


    it('Card routing with filtering notification', async function() {

        const card = {uid: "1001", id: "defaultProcess.process1", process: "defaultProcess", state: "processState", userRecipients: ["operator_1"]};

        const currentUserWithReceiveAndWriteRightWithFilteringNotification = {userData: user, email: 'test@opfab.com', processesStatesNotifiedByEmail: {defaultProcess: ["processState"]}, processesStatesNotNotified: {defaultProcess: ["processState"]}, computedPerimeters: perimetersWithReceiveAndWriteRight};
        const currentUserWithReceiveRightWithFilteringNotification = {userData: user, email: 'test@opfab.com', processesStatesNotifiedByEmail: {defaultProcess: ["processState"]}, processesStatesNotNotified: {defaultProcess: ["processState"]}, computedPerimeters: perimetersWithReceiveRight};

        const currentUserWithReceiveAndWriteRightWithFilteringNotificationNotForProcessState = {userData: user, email: 'test@opfab.com', processesStatesNotifiedByEmail: {defaultProcess: ["processState"]}, processesStatesNotNotified: {defaultProcess: ["otherState"]}, computedPerimeters: perimetersWithReceiveAndWriteRight};
        const currentUserWithReceiveRightWithFilteringNotificationNotForProcessState = {userData: user, email: 'test@opfab.com', processesStatesNotifiedByEmail: {defaultProcess: ["processState"]}, processesStatesNotNotified: {defaultProcess: ["otherState"]}, computedPerimeters: perimetersWithReceiveRight};                                     

        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(currentUserWithReceiveAndWriteRight, card)).toBeTruthy();
        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(currentUserWithReceiveAndWriteRightWithFilteringNotification, card)).toBeFalsy();
        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(currentUserWithReceiveAndWriteRightWithFilteringNotificationNotForProcessState, card)).toBeTruthy();

        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(currentUserWithReceiveRight, card)).toBeTruthy();
        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(currentUserWithReceiveRightWithFilteringNotification, card)).toBeFalsy();
        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(currentUserWithReceiveRightWithFilteringNotificationNotForProcessState, card)).toBeTruthy();
    })

})
