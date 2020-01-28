/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {AppState} from "@ofStore/index";
import {createSelector} from "@ngrx/store";
import {TranslationState} from "@ofStates/translation.state";

export const selectTranslation = (state:AppState) => state.translation;
export const selectI18nUpLoaded = createSelector(selectTranslation
    , (transState: TranslationState) => transState.i18nBundleVersionLoaded);
