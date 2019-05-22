/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {AppState} from "@ofStore/index";
import {createSelector} from "@ngrx/store";
import {MenuState} from "@ofStates/menu.state";

export const selectMenuState = (state:AppState) => state.menu;
export const selectMenuStateMenu =  createSelector(selectMenuState, (menuState:MenuState)=> menuState.menu);
export const selectMenuStateSelectedMenuId =  createSelector(selectMenuState, (menuState:MenuState)=> menuState.selected_menu_id);
export const selectMenuStateSelectedMenuEntryId =  createSelector(selectMenuState, (menuState:MenuState)=> menuState.selected_menu_entry_id);
