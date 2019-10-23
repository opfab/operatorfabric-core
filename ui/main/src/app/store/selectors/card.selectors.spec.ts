/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {AppState} from '@ofStore/index';
import {cardInitialState, CardState} from '@ofStates/card.state';
import {emptyAppState4Test , getOneRandomCard} from '@tests/helpers';
import {
    selectCardState,
    selectCardStateSelected,
    selectCardStateSelectedDetails,
    selectCardStateSelectedId,
    selectCardActionsAppearState
} from '@ofSelectors/card.selectors';

describe('ConfigSelectors', () => {
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
    it('manage slected card state', () => {
        const testAppState = {...emptyAppState, card: selectedState};
        expect(selectCardState(testAppState)).toEqual(selectedState);
        expect(selectCardStateSelected(testAppState)).toEqual(selectedState.selected);
        expect(selectCardStateSelectedDetails(testAppState)).toEqual(selectedState.selected.details);
        expect(selectCardStateSelectedId(testAppState)).toEqual(selectedState.selected.id);
    });
    it('should select the card appear array', () => {
        const testAppState = {...emptyAppState, card: selectedState};
        expect(selectCardActionsAppearState(testAppState)).toEqual(selectedState.actionsAppear);
    });
});
