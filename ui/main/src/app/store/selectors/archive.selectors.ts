

import {AppState} from '@ofStore/index';
import {createSelector} from '@ngrx/store';
import * as _ from 'lodash';
import {ArchiveState} from '@ofStates/archive.state';

export const selectArchive = (state: AppState) => state.archive;
export const selectArchiveFilters =  createSelector(selectArchive, (archiveState: ArchiveState) => archiveState.filters);

export const selectArchiveLightCards = createSelector(selectArchive, (archiveState: ArchiveState) => archiveState.resultPage.content);
export const selectArchiveCount = createSelector(selectArchive, (archiveState: ArchiveState) => archiveState.resultPage.totalElements);


export const selectArchiveLightCardSelection = createSelector(selectArchive, (archiveState: ArchiveState) => archiveState.selectedCardId);

//export const selectArchiveNoResultMessage = createSelector(selectArchive, (archiveState: ArchiveState) => archiveState.noResultMessage);
export const selectArchiveLoading= createSelector(selectArchive, (archiveState: ArchiveState) => archiveState.firstLoading);
