import {initialThirdActionState, ThirdActionState} from "@ofStates/third-action.state";
import {ThirdActionActions, ThirdActionTypes} from "@ofActions/third-action.actions";

export function reducer(state=initialThirdActionState,
                        action:ThirdActionActions):ThirdActionState{
    switch (action.type) {
        case ThirdActionTypes.LoadThirdActions:{
            return{...state}
        }
        default:{
            return state;
        }
    }
}
