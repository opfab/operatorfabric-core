import {translationInitialState, TranslationState} from "@ofStates/translation.state";
import {TranslateActions} from "@ofActions/translate.actions";

export function reducer (
    state = translationInitialState,
    action: TranslateActions
):TranslationState{
    switch(action.type){
        default:{
            return state;
        }
    }
}
