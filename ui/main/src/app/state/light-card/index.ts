import {createFeatureSelector, createSelector} from '@ngrx/store';
import * as fromCards from './light-card.reducer';
import {State as lightCardsState} from './light-card.reducer';

export const getLightCardsState = createFeatureSelector<lightCardsState>( 'lightCard');

export const {
  selectIds: getLightCardIds,
  selectAll: getAllLightCards,
  selectEntities: getLightCardEntities
} = fromCards.adapter.getSelectors(getLightCardsState);


export const getSelectedLightCardId = createSelector(
  getLightCardsState,
  fromCards.getSelectedId
);

export const getSelectedLightCard = createSelector(
  getSelectedLightCardId,
  getLightCardEntities,
  (selectedLightCardId, entities) => selectedLightCardId && entities[selectedLightCardId]
);
