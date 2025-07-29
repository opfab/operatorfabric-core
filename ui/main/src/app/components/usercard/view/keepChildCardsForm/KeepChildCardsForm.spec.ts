/* Copyright (c) 2024-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {UserCardUIControlMock} from '@tests/userCardView/userCardUIControlMock';
import {KeepChildCardsForm} from './KeepChildCardsForm';
import {getOneCard, initOpfabAPI, setProcessConfiguration} from '@tests/helpers';
import {Response, State} from '@ofServices/processes/model/Processes';
import {EditionMode} from '../UserCardModel';

declare const opfab: any;

async function setProcessConfigWithUserCardConfig(userCardConfig) {
    const response = new Response(true, 'response_state', [], false);
    await setProcessConfiguration([
        {
            id: 'process1',
            version: 'v1',
            name: 'process name 1',
            states: new Map<string, State>([
                ['state1_1', {name: 'State 1_1', userCard: userCardConfig, response: response}],
                ['state_with_no_response', {name: 'state_with_no_response', userCard: userCardConfig}]
            ])
        }
    ]);
}

describe('UserCard KeepChildCardsForm', () => {
    let userCardKeepChildCards: KeepChildCardsForm;
    let userCardUIControl: UserCardUIControlMock;
    beforeEach(() => {
        userCardUIControl = new UserCardUIControlMock();
        userCardKeepChildCards = new KeepChildCardsForm(userCardUIControl);
        initOpfabAPI();
    });

    it(`KeepChildCards visibility should be set to true if keepChildCards visibility set visible in state configuration and usercard is in edition mode`, async () => {
        await setProcessConfigWithUserCardConfig({keepChildCardsVisible: true});
        const card = getOneCard({});
        userCardKeepChildCards.setValueAndVisibility('process1', 'state1_1', card, EditionMode.EDITION);
        expect(userCardKeepChildCards.isKeepChildCardsVisible()).toEqual(true);
        expect(userCardUIControl.inputVisibility_FctCalls['keepChildCards']).toEqual(true);
    });
    it(`KeepChildCards visibility should be set to false if keepChildCards visibility set invisible in state configuration`, async () => {
        await setProcessConfigWithUserCardConfig({keepChildCardsVisible: false});
        const card = getOneCard({});
        userCardKeepChildCards.setValueAndVisibility('process1', 'state1_1', card, EditionMode.EDITION);
        expect(userCardKeepChildCards.isKeepChildCardsVisible()).toEqual(false);
        expect(userCardUIControl.inputVisibility_FctCalls['keepChildCards']).toEqual(false);
    });
    it(`KeepChildCards visibility should be set to false if keepChildCards visibility is not defined in state configuration`, async () => {
        await setProcessConfigWithUserCardConfig({});
        const card = getOneCard({});
        userCardKeepChildCards.setValueAndVisibility('process1', 'state1_1', card, EditionMode.EDITION);
        expect(userCardUIControl.inputVisibility_FctCalls['keepChildCards']).toEqual(false);
    });
    it(`KeepChildCards visibility should be set to false if keepChildCards visibility is not defined in state configuration and the state has no response`, async () => {
        await setProcessConfigWithUserCardConfig({});
        const card = getOneCard({});
        userCardKeepChildCards.setValueAndVisibility('process1', 'state_with_no_response', card, EditionMode.EDITION);
        expect(userCardUIControl.inputVisibility_FctCalls['keepChildCards']).toEqual(false);
    });
    it('KeepChildCards should be set to true by default', async () => {
        await setProcessConfigWithUserCardConfig({});
        const card = getOneCard({});
        userCardKeepChildCards.setValueAndVisibility('process1', 'state1_1', card, EditionMode.EDITION);
        expect(userCardUIControl.keepChildCards).toEqual(true);
        expect(userCardKeepChildCards.getSelectedKeepChildCards()).toEqual(true);
    });
    it('KeepChildCards should be set to Card keepChildCards if edition mode', async () => {
        await setProcessConfigWithUserCardConfig({});
        const card = getOneCard({keepChildCards: true});
        userCardKeepChildCards.setValueAndVisibility('process1', 'state1_1', card, EditionMode.EDITION);
        expect(userCardUIControl.keepChildCards).toEqual(true);
        expect(userCardKeepChildCards.getSelectedKeepChildCards()).toEqual(true);
    });
    it('Should set keepChildCards to value set by template via opfab.currentUserCard.setInitialKeepChildCards ', async () => {
        await setProcessConfigWithUserCardConfig({});
        opfab.currentUserCard.setInitialKeepChildCards(false);
        const card = getOneCard({});
        userCardKeepChildCards.setValueAndVisibility('process1', 'state1_1', card, EditionMode.EDITION);
        expect(userCardUIControl.keepChildCards).toEqual(false);
        expect(userCardKeepChildCards.getSelectedKeepChildCards()).toEqual(false);
    });
    it('Should set selected keepChildCards when user selects keepChildCards', async () => {
        await setProcessConfigWithUserCardConfig({});
        const card = getOneCard({keepChildCards: true});
        userCardKeepChildCards.setValueAndVisibility('process1', 'state1_1', card, EditionMode.EDITION);
        userCardKeepChildCards.userSelectsKeepChildCards(false);
        expect(userCardKeepChildCards.getSelectedKeepChildCards()).toEqual(false);
    });
});
