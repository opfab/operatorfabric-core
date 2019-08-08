/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {AppState} from "@ofStore/index";
import {createSelector} from "@ngrx/store";
import {SettingsState} from "@ofStates/settings.state";
import * as _ from 'lodash';
import {ArchiveState} from "@ofStates/archive.state";

export const selectArchive = (state:AppState) => state.archive;
export const selectArchiveFilters =  createSelector(selectArchive, (archiveState:ArchiveState)=> archiveState.filters);

export const selectArchiveLightCards = createSelector(selectArchive, (archiveState:ArchiveState)=> archiveState.resultPage.content);

export const selectArchiveLightCardSelection = createSelector(selectArchive, (archiveState:ArchiveState)=> archiveState.selectedCardId);

export function buildArchiveFilterSelector(path:string, fallback: any = null){
    return createSelector(selectArchiveFilters,(filters)=>{
        let result: string[];
        if(filters.has(path)) {
            result = filters.get(path);
        } else {
            result = null;
        }
        if(!result && fallback)
            return fallback;
        return result;
    });
}
