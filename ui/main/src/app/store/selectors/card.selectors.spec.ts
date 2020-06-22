/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



import {AppState} from '@ofStore/index';
import {cardInitialState, CardState} from '@ofStates/card.state';
import {emptyAppState4Test , getOneRandomCard} from '@tests/helpers';
import {
    selectCardState,
    selectCardStateSelected,
    selectCardStateSelectedDetails,
    selectCardStateSelectedId
} from '@ofSelectors/card.selectors';

describe('CardSelectors', () => {
    const emptyAppState: AppState = emptyAppState4Test;
    const selectedState: CardState = {
        ...cardInitialState,
        selected: getOneRandomCard()
    };

    it('manage empty card state', () => {
        const testAppState = {...emptyAppState, card: cardInitialState};
        expect(selectCardState(testAppState)).toEqual(cardInitialState);
        expect(selectCardStateSelected(testAppState)).toBeNull();
        expect(selectCardStateSelectedDetails(testAppState)).toBeNull();
        expect(selectCardStateSelectedId(testAppState)).toBeNull();
    });
    it('manage selected card state', () => {
        const testAppState = {...emptyAppState, card: selectedState};
        expect(selectCardState(testAppState)).toEqual(selectedState);
        expect(selectCardStateSelected(testAppState)).toEqual(selectedState.selected);
        expect(selectCardStateSelectedDetails(testAppState)).toEqual(selectedState.selected.details);
        expect(selectCardStateSelectedId(testAppState)).toEqual(selectedState.selected.id);
    });
});
