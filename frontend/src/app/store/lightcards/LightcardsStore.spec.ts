/* Copyright (c) 2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Card} from 'app/model/Card';
import {getOneLightCard, setUserPerimeter} from '@tests/helpers';
import {LightCardsStore} from './LightcardsStore';
import {OpfabEventStreamServerMock} from '@tests/mocks/opfab-event-stream.server.mock';
import {OpfabEventStreamService} from '@ofServices/events/OpfabEventStreamService';

describe('Lightcards store ', () => {
    let lightCardsStore: LightCardsStore;

    function initStore() {
        const opfabEventStreamServerMock = new OpfabEventStreamServerMock();
        OpfabEventStreamService.setEventStreamServer(opfabEventStreamServerMock);
        lightCardsStore = new LightCardsStore();
        lightCardsStore.initStore();
    }

    beforeEach(async () => {
        await setUserPerimeter({
            computedPerimeters: [],
            userData: {
                login: 'test',
                firstName: 'firstName',
                lastName: 'lastName',
                entities: ['entity1']
            }
        });
        initStore();
    });

    afterEach(() => {
        lightCardsStore.destroy();
    });

    describe('get child card with parent card card1 for current user member of entity1', () => {
        it('should return an empty array if card1 has no child card ', () => {
            const card: Card = getOneLightCard({id: 'card1'});
            lightCardsStore.addOrUpdateLightCard(card);
            const childCards = lightCardsStore.getCurrentUserChildCardsForParentCard('card1');
            expect(childCards.length).toEqual(0);
        });

        it('should contains a card if card1 has a child card with publisher entity1', () => {
            const parentCard: Card = getOneLightCard({id: 'card1'});
            lightCardsStore.addOrUpdateLightCard(parentCard);
            const childCard: Card = getOneLightCard({id: 'card2', parentCardId: 'card1', publisher: 'entity1'});
            lightCardsStore.addOrUpdateLightCard(childCard);
            const childCards = lightCardsStore.getCurrentUserChildCardsForParentCard('card1');
            expect(childCards.length).toEqual(1);
            expect(childCards[0].id).toEqual('card2');
            expect(childCards[0].parentCardId).toEqual('card1');
        });
        it('should return an empty array if card1 has a child card with publisher entity2', () => {
            const parentCard: Card = getOneLightCard({id: 'card1'});
            lightCardsStore.addOrUpdateLightCard(parentCard);
            const childCard: Card = getOneLightCard({id: 'card2', parentCardId: 'card1', publisher: 'entity2'});
            lightCardsStore.addOrUpdateLightCard(childCard);
            const childCards = lightCardsStore.getCurrentUserChildCardsForParentCard('card1');
            expect(childCards.length).toEqual(0);
        });
    });
});
