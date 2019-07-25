import {ThirdActionState} from "@ofStates/third-action.state";
import {createFeatureSelector, createSelector} from "@ngrx/store";
import {LightCard} from "@ofModel/light-card.model";

export const getThirdActionHolderSelector =createFeatureSelector<ThirdActionState>('thirdActions');

export const selectThirdActionList = createSelector(
    getThirdActionHolderSelector,
    (state:ThirdActionState) => state.thirdActions
);

export const selectThirdAction = id => createSelector(getThirdActionHolderSelector,
    thirdActions => thirdActions[id]);

export const selectThirdActionFromCard =(card:LightCard) => createSelector(getThirdActionHolderSelector,
    thirdActions =>{
    const id = `${card.publisher}_${card.processId}_${card.publisherVersion}_${card.state}`;
    return thirdActions[id];
    });
