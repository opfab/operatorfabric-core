/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {AppState} from '@ofStore/index';
import {createSelector} from '@ngrx/store';
import * as _ from 'lodash';
import {ArchiveState} from '@ofStates/archive.state';

export const selectArchive = (state: AppState) => state.archive;
export const selectArchiveFilters =  createSelector(selectArchive, (archiveState: ArchiveState) => archiveState.filters);

export const selectArchiveLightCards = createSelector(selectArchive, (archiveState: ArchiveState) => archiveState.resultPage.content);
export const selectArchiveCount = createSelector(selectArchive, (archiveState: ArchiveState) => archiveState.resultPage.totalElements);


export const selectArchiveLightCardSelection = createSelector(selectArchive, (archiveState: ArchiveState) => archiveState.selectedCardId);
