import {ThirdActionState} from "@ofStates/third-action.state";
import {createFeatureSelector, createSelector} from "@ngrx/store";
import {AppState} from "@ofStore/index";

// const selectThirdActions = (state:AppState) => state.thirdActions;
//
// export const selectThirdActionList = createSelector(
//     selectThirdActions,
//     (state:ThirdActionState) => state.thirdActionHolder
// );
//
// export const fetchSelectedThirdActionHolder = createSelector(
//     selectThirdActions,
//
// )

export const getThirdActionHolderSelector =createFeatureSelector<ThirdActionState>('thirdActions');

export const selectThirdActionList = createSelector(
    getThirdActionHolderSelector,
    (state:ThirdActionState) => state.thirdActionHolder
);
