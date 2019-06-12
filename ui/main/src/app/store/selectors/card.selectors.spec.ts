/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {AppState} from "@ofStore/index";
import {
    buildConfigSelector,
    selectConfig,
    selectConfigData,
    selectConfigLoaded,
    selectConfigRetry,
    selectMaxedRetries
} from "@ofSelectors/config.selectors";
import {configInitialState, ConfigState} from "@ofStates/config.state";
import {cardInitialState, CardState} from "@ofStates/card.state";
import {getOneRandomCard} from "@tests/helpers";
import {
    selectCardState,
    selectCardStateSelectedId,
    selectCardStateSelected,
    selectCardStateSelectedDetails
} from "@ofSelectors/card.selectors";

describe('ConfigSelectors', () => {
    let emptyAppState: AppState = {
        router: null,
        feed: null,
        timeline: null,
        authentication: null,
        card: null,
        menu: null,
        config: null
    }

    let selectedState: CardState = {
        ...cardInitialState,
        selected: getOneRandomCard()
    };


    it('manage empty card state', () => {
        let testAppState = {...emptyAppState, card: cardInitialState};
        expect(selectCardState(testAppState)).toEqual(cardInitialState);
        expect(selectCardStateSelected(testAppState)).toBeNull();
        expect(selectCardStateSelectedDetails(testAppState)).toBeNull();
        expect(selectCardStateSelectedId(testAppState)).toBeNull();
    });

    it('manage slected card state', () => {
        let testAppState = {...emptyAppState, card: selectedState};
        expect(selectCardState(testAppState)).toEqual(selectedState);
        expect(selectCardStateSelected(testAppState)).toEqual(selectedState.selected);
        expect(selectCardStateSelectedDetails(testAppState)).toEqual(selectedState.selected.details);
        expect(selectCardStateSelectedId(testAppState)).toEqual(selectedState.selected.id);
    });

});
