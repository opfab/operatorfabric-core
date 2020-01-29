/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


import {Map} from "@ofModel/map";

export interface TranslationState {
    i18nBundleVersionLoaded: Map<Set<string>>,
    loading:boolean,
    error:string
}

export const translationInitialState: TranslationState = {
    i18nBundleVersionLoaded:new Map<Set<string>>(),
    loading:false,
    error:null

}
