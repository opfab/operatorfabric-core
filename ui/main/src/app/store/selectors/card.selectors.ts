/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {AppState} from "@ofStore/index";
import {createSelector} from "@ngrx/store";
import {CardState} from "@ofStates/card.state";
import {Card} from "@ofModel/card.model";

export const selectCardState = (state:AppState) => state.card;
export const selectCardStateSelection =  createSelector(selectCardState, (cardState:CardState)=> cardState.selected)
export const selectCardStateSelectionDetails =  createSelector(selectCardStateSelection, (card:Card)=> {
    return card==null?null:card.details;
})
export const selectCardStateIdSelection =  createSelector(selectCardStateSelection, (card:Card)=> {
    return card==null?null:card.id;
})