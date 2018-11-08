import {createFeatureSelector, createSelector} from '@ngrx/store';
import * as fromCardOperations from './card-operation.reducer';
import {State as CardOperationsState} from './card-operation.reducer';

export const getCardOperationsState =
  createFeatureSelector<CardOperationsState>( 'cardOperation');

export const {
  selectIds: getCardOperationIds,
  selectAll: getAllCardOperations,
  selectEntities: getCardOperationEntities
} = fromCardOperations.adapter.getSelectors(getCardOperationsState);


export const getSelectedCardOperationId = createSelector(
  getCardOperationsState,
  fromCardOperations.getSelectedId
);

export const getSelectedCardOperation = createSelector(
  getSelectedCardOperationId,
  getCardOperationEntities,
  (selectedCardOperationId, entities) =>
    selectedCardOperationId && entities[selectedCardOperationId]
);
