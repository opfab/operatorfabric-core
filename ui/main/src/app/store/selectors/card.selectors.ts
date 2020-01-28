
import {AppState} from '@ofStore/index';
import {createSelector} from '@ngrx/store';
import {CardState} from '@ofStates/card.state';
import {Card} from '@ofModel/card.model';

export const selectCardState = (state: AppState) => state.card;
export const selectCardStateSelected =  createSelector(selectCardState, (cardState: CardState) => cardState.selected);
export const selectCardStateSelectedDetails =  createSelector(selectCardStateSelected, (card: Card) => {
    return card == null ? null : card.details;
});
export const selectCardStateSelectedId =  createSelector(selectCardStateSelected, (card: Card) => {
    return card == null ? null : card.id;
});

export const selectCardActionsAppearState = createSelector(selectCardState, (cardState: CardState) => cardState.actionsAppear);
