/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import 'jest';
import CardsRoutingUtilities from '../domain/application/cardRoutingUtilities';

describe('Card routing', function () {
    const user = {login: 'operator_1', groups: ['Dispatcher'], entities: ['ENTITY1']};
    const perimetersWithReceiveAndWriteRight = [
        {
            process: 'defaultProcess',
            processVersion: 'v1',
            state: 'processState',
            rights: 'ReceiveAndWrite',
            filteringNotificationAllowed: true
        }
    ];
    const perimetersWithReceiveRight = [
        {
            process: 'defaultProcess',
            processVersion: 'v1',
            state: 'processState',
            rights: 'Receive',
            filteringNotificationAllowed: true
        }
    ];

    const currentUserWithReceiveAndWriteRight = {
        userData: user,
        email: 'test@opfab.com',
        processesStatesNotifiedByEmail: {defaultProcess: ['processState']},
        computedPerimeters: perimetersWithReceiveAndWriteRight
    };

    const currentUserWithReceiveRight = {
        userData: user,
        email: 'test@opfab.com',
        processesStatesNotifiedByEmail: {defaultProcess: ['processState']},
        computedPerimeters: perimetersWithReceiveRight
    };

    it('Card routing using only group', async function () {
        const cardSentToGroupOfTheUser = {
            uid: '1001',
            id: 'defaultProcess.process1',
            process: 'defaultProcess',
            processVersion: 'v1',
            state: 'processState',
            groupRecipients: ['Dispatcher'],
            publishDate: 123456789
        };
        const cardSentToGroupNotOfUser = {
            uid: '1001',
            id: 'defaultProcess.process1',
            process: 'defaultProcess',
            processVersion: 'v1',
            state: 'processState',
            groupRecipients: ['Supervisor'],
            publishDate: 123456789
        };
        const cardSentToGroupOfTheUserAndEmptyEntities = {
            uid: '1001',
            id: 'defaultProcess.process1',
            process: 'defaultProcess',
            processVersion: 'v1',
            state: 'processState',
            groupRecipients: ['Dispatcher'],
            entityRecipients: [],
            publishDate: 123456789
        };
        const cardSentToGroupNotOfUserAndEmptyEntities = {
            uid: '1001',
            id: 'defaultProcess.process1',
            process: 'defaultProcess',
            processVersion: 'v1',
            state: 'processState',
            groupRecipients: ['Supervisor'],
            entityRecipients: [],
            publishDate: 123456789
        };

        expect(
            CardsRoutingUtilities.shouldUserReceiveTheCard(
                currentUserWithReceiveAndWriteRight,
                cardSentToGroupOfTheUser
            )
        ).toBeTruthy();
        expect(
            CardsRoutingUtilities.shouldUserReceiveTheCard(
                currentUserWithReceiveAndWriteRight,
                cardSentToGroupNotOfUser
            )
        ).toBeFalsy();
        expect(
            CardsRoutingUtilities.shouldUserReceiveTheCard(
                currentUserWithReceiveAndWriteRight,
                cardSentToGroupOfTheUserAndEmptyEntities
            )
        ).toBeTruthy();
        expect(
            CardsRoutingUtilities.shouldUserReceiveTheCard(
                currentUserWithReceiveAndWriteRight,
                cardSentToGroupNotOfUserAndEmptyEntities
            )
        ).toBeFalsy();

        expect(
            CardsRoutingUtilities.shouldUserReceiveTheCard(currentUserWithReceiveRight, cardSentToGroupOfTheUser)
        ).toBeTruthy();
        expect(
            CardsRoutingUtilities.shouldUserReceiveTheCard(currentUserWithReceiveRight, cardSentToGroupNotOfUser)
        ).toBeFalsy();
        expect(
            CardsRoutingUtilities.shouldUserReceiveTheCard(
                currentUserWithReceiveRight,
                cardSentToGroupOfTheUserAndEmptyEntities
            )
        ).toBeTruthy();
        expect(
            CardsRoutingUtilities.shouldUserReceiveTheCard(
                currentUserWithReceiveRight,
                cardSentToGroupNotOfUserAndEmptyEntities
            )
        ).toBeFalsy();
    });

    it('Card routing using only entity', async function () {
        const cardSentToEntityOfTheUser = {
            uid: '1001',
            id: 'defaultProcess.process1',
            process: 'defaultProcess',
            processVersion: 'v1',
            state: 'processState',
            entityRecipients: ['ENTITY1'],
            publishDate: 123456789
        };
        const cardSentToEntityNotOfUser = {
            uid: '1001',
            id: 'defaultProcess.process1',
            process: 'defaultProcess',
            processVersion: 'v1',
            state: 'processState',
            entityRecipients: ['ENTITY2'],
            publishDate: 123456789
        };
        const cardSentToEntityOfTheUserAndEmptyGroups = {
            uid: '1001',
            id: 'defaultProcess.process1',
            process: 'defaultProcess',
            processVersion: 'v1',
            state: 'processState',
            groupRecipients: [],
            entityRecipients: ['ENTITY1'],
            publishDate: 123456789
        };
        const cardSentToEntityNotOfUserAndEmptyGroup = {
            uid: '1001',
            id: 'defaultProcess.process1',
            process: 'defaultProcess',
            processVersion: 'v1',
            state: 'processState',
            groupRecipients: [],
            entityRecipients: ['ENTITY2'],
            publishDate: 123456789
        };

        expect(
            CardsRoutingUtilities.shouldUserReceiveTheCard(
                currentUserWithReceiveAndWriteRight,
                cardSentToEntityOfTheUser
            )
        ).toBeTruthy();
        expect(
            CardsRoutingUtilities.shouldUserReceiveTheCard(
                currentUserWithReceiveAndWriteRight,
                cardSentToEntityNotOfUser
            )
        ).toBeFalsy();
        expect(
            CardsRoutingUtilities.shouldUserReceiveTheCard(
                currentUserWithReceiveAndWriteRight,
                cardSentToEntityOfTheUserAndEmptyGroups
            )
        ).toBeTruthy();
        expect(
            CardsRoutingUtilities.shouldUserReceiveTheCard(
                currentUserWithReceiveAndWriteRight,
                cardSentToEntityNotOfUserAndEmptyGroup
            )
        ).toBeFalsy();

        expect(
            CardsRoutingUtilities.shouldUserReceiveTheCard(currentUserWithReceiveRight, cardSentToEntityOfTheUser)
        ).toBeTruthy();
        expect(
            CardsRoutingUtilities.shouldUserReceiveTheCard(currentUserWithReceiveRight, cardSentToEntityNotOfUser)
        ).toBeFalsy();
        expect(
            CardsRoutingUtilities.shouldUserReceiveTheCard(
                currentUserWithReceiveRight,
                cardSentToEntityOfTheUserAndEmptyGroups
            )
        ).toBeTruthy();
        expect(
            CardsRoutingUtilities.shouldUserReceiveTheCard(
                currentUserWithReceiveRight,
                cardSentToEntityNotOfUserAndEmptyGroup
            )
        ).toBeFalsy();
    });

    it('Card routing with no groups and no entities', async function () {
        const cardSentToEmptyGroupsAndEntities = {
            uid: '1001',
            id: 'defaultProcess.process1',
            process: 'defaultProcess',
            processVersion: 'v1',
            state: 'processState',
            groupRecipients: [],
            entityRecipients: [],
            publishDate: 123456789
        };
        const cardWithNoEntityAndGroup = {
            uid: '1001',
            id: 'defaultProcess.process1',
            process: 'defaultProcess',
            processVersion: 'v1',
            state: 'processState',
            publishDate: 123456789
        };

        expect(
            CardsRoutingUtilities.shouldUserReceiveTheCard(
                currentUserWithReceiveAndWriteRight,
                cardSentToEmptyGroupsAndEntities
            )
        ).toBeFalsy();
        expect(
            CardsRoutingUtilities.shouldUserReceiveTheCard(
                currentUserWithReceiveAndWriteRight,
                cardWithNoEntityAndGroup
            )
        ).toBeFalsy();

        expect(
            CardsRoutingUtilities.shouldUserReceiveTheCard(
                currentUserWithReceiveRight,
                cardSentToEmptyGroupsAndEntities
            )
        ).toBeFalsy();
        expect(
            CardsRoutingUtilities.shouldUserReceiveTheCard(currentUserWithReceiveRight, cardWithNoEntityAndGroup)
        ).toBeFalsy();
    });

    it('Card routing to user recipient', async function () {
        const card = {
            uid: '1001',
            id: 'defaultProcess.process1',
            process: 'defaultProcess',
            processVersion: 'v1',
            state: 'processState',
            userRecipients: ['operator_1'],
            publishDate: 123456789
        };

        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(currentUserWithReceiveAndWriteRight, card)).toBeTruthy();
        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(currentUserWithReceiveRight, card)).toBeTruthy();
    });

    it('Card routing to user recipient but without mail notif option activated', async function () {
        const card = {
            uid: '1001',
            id: 'defaultProcess.process1',
            process: 'defaultProcess',
            processVersion: 'v1',
            state: 'processState',
            userRecipients: ['operator_1'],
            publishDate: 123456789
        };

        const currentUserWithReceiveAndWriteRightNoMail = {
            userData: user,
            computedPerimeters: perimetersWithReceiveAndWriteRight
        };

        const currentUserWithReceiveRightNoMail = {userData: user, computedPerimeters: perimetersWithReceiveRight};

        expect(
            CardsRoutingUtilities.shouldUserReceiveTheCard(currentUserWithReceiveAndWriteRightNoMail, card)
        ).toBeFalsy();
        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(currentUserWithReceiveRightNoMail, card)).toBeFalsy();
    });

    it('Card routing to user recipient but without mail notif option activated for this process/state', async function () {
        const card = {
            uid: '1001',
            id: 'defaultProcess.process1',
            process: 'defaultProcess',
            processVersion: 'v1',
            state: 'processState',
            userRecipients: ['operator_1'],
            publishDate: 123456789
        };

        const currentUserWithReceiveAndWriteRightNoMailForProcessState = {
            userData: user,
            email: 'test@opfab.com',
            processesStatesNotifiedByEmail: {defaultProcess: ['messageState']},
            computedPerimeters: perimetersWithReceiveAndWriteRight
        };

        const currentUserWithReceiveRightNoMailForProcessState = {
            userData: user,
            email: 'test@opfab.com',
            processesStatesNotifiedByEmail: {defaultProcess: ['messageState']},
            computedPerimeters: perimetersWithReceiveRight
        };

        expect(
            CardsRoutingUtilities.shouldUserReceiveTheCard(
                currentUserWithReceiveAndWriteRightNoMailForProcessState,
                card
            )
        ).toBeFalsy();
        expect(
            CardsRoutingUtilities.shouldUserReceiveTheCard(currentUserWithReceiveRightNoMailForProcessState, card)
        ).toBeFalsy();
    });

    it('Card routing with filtering notification', async function () {
        const card = {
            uid: '1001',
            id: 'defaultProcess.process1',
            process: 'defaultProcess',
            processVersion: 'v1',
            state: 'processState',
            userRecipients: ['operator_1'],
            publishDate: 123456789
        };

        const currentUserWithReceiveAndWriteRightWithFilteringNotification = {
            userData: user,
            email: 'test@opfab.com',
            processesStatesNotifiedByEmail: {defaultProcess: ['processState']},
            processesStatesNotNotified: {defaultProcess: ['processState']},
            computedPerimeters: perimetersWithReceiveAndWriteRight
        };
        const currentUserWithReceiveRightWithFilteringNotification = {
            userData: user,
            email: 'test@opfab.com',
            processesStatesNotifiedByEmail: {defaultProcess: ['processState']},
            processesStatesNotNotified: {defaultProcess: ['processState']},
            computedPerimeters: perimetersWithReceiveRight
        };

        const currentUserWithReceiveAndWriteRightWithFilteringNotificationNotForProcessState = {
            userData: user,
            email: 'test@opfab.com',
            processesStatesNotifiedByEmail: {defaultProcess: ['processState']},
            processesStatesNotNotified: {defaultProcess: ['otherState']},
            computedPerimeters: perimetersWithReceiveAndWriteRight
        };
        const currentUserWithReceiveRightWithFilteringNotificationNotForProcessState = {
            userData: user,
            email: 'test@opfab.com',
            processesStatesNotifiedByEmail: {defaultProcess: ['processState']},
            processesStatesNotNotified: {defaultProcess: ['otherState']},
            computedPerimeters: perimetersWithReceiveRight
        };

        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(currentUserWithReceiveAndWriteRight, card)).toBeTruthy();
        expect(
            CardsRoutingUtilities.shouldUserReceiveTheCard(
                currentUserWithReceiveAndWriteRightWithFilteringNotification,
                card
            )
        ).toBeTruthy();
        expect(
            CardsRoutingUtilities.shouldUserReceiveTheCard(
                currentUserWithReceiveAndWriteRightWithFilteringNotificationNotForProcessState,
                card
            )
        ).toBeTruthy();

        expect(CardsRoutingUtilities.shouldUserReceiveTheCard(currentUserWithReceiveRight, card)).toBeTruthy();
        expect(
            CardsRoutingUtilities.shouldUserReceiveTheCard(currentUserWithReceiveRightWithFilteringNotification, card)
        ).toBeTruthy();
        expect(
            CardsRoutingUtilities.shouldUserReceiveTheCard(
                currentUserWithReceiveRightWithFilteringNotificationNotForProcessState,
                card
            )
        ).toBeTruthy();
    });
});
