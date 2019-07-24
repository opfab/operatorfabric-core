import {initialThirdActionState, ThirdActionAdapter, ThirdActionState} from "@ofStates/third-action.state";
import {ThirdActionActions, ThirdActionTypes} from "@ofActions/third-action.actions";

export function reducer(state=initialThirdActionState,
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
