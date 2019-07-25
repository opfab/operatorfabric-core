import {
    initialThirdActionHolderState,
    initialThirdActionState,
    ThirdActionAdapter, thirdActionHolderAdapter, ThirdActionHolderState,
    ThirdActionState
} from "@ofStates/third-action.state";
import {ThirdActionActions, ThirdActionTypes} from "@ofActions/third-action.actions";

export function thirdActionReducer(state=initialThirdActionState,
                        action:ThirdActionActions):ThirdActionState{
    switch (action.type) {
        case ThirdActionTypes.LoadThirdActionSuccess:{
            return {
                ...ThirdActionAdapter.upsertMany(action.payload.actions, state)
            }
        }
        default:{
            return state;
        }
    }
}
export function thirdActionHolderReducer(state=initialThirdActionHolderState,
                                        action:ThirdActionActions):ThirdActionHolderState{
    switch (action.type) {
        case ThirdActionTypes.LoadThirdActionSuccess:{
            const holder=action.payload.holder;
            return {
                ...thirdActionHolderAdapter.upsertOne(holder, state),
                selectedThirdActionHolderId:`${holder.publisher}_${holder.processInstanceId}_${holder.version}_${holder.stateName}`,
            }
        }
        default:{
            return state;
        }
    }
}
