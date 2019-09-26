import {AppState} from "@ofStore/index";
import {createSelector} from "@ngrx/store";
import {TranslationState} from "@ofStates/translation.state";

export const selectTranslation = (state:AppState) => state.translation;
export const selectI18nUpLoaded = createSelector(selectTranslation
    , (transState: TranslationState) => transState.i18nBundleVersionLoaded);
