/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

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
