import {AppState} from "@ofStore/index";
import {createSelector} from "@ngrx/store";
import {CardState} from "@ofStates/card.state";
import {Card} from "@ofModel/card.model";

export const selectCardState = (state:AppState) => state.card;
export const selectCardStateSelection =  createSelector(selectCardState, (cardState:CardState)=> cardState.selected)
export const selectCardStateSelectionDetails =  createSelector(selectCardStateSelection, (card:Card)=> {
    return card==null?null:card.details;
})