import {translationInitialState, TranslationState} from "@ofStates/translation.state";
import {TranslateActions, TranslateActionsTypes} from "@ofActions/translate.actions";

export function reducer (
    state = translationInitialState,
    action: TranslateActions
):TranslationState{
    switch(action.type){
        case TranslateActionsTypes.UpdateTranslation:{
            return {
                ...state,
                loading:false,
                i18nBundleVersionLoaded:{...state.i18nBundleVersionLoaded,...action.payload.versions}
            }
        }
        default:{
            return state;
        }
    }
}
