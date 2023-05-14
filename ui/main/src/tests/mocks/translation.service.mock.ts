/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {TranslationService} from "app/business/services/translation.service";

export class TranslationServiceMock implements TranslationService {

    getTranslation(key: string, params?: Map<string,string>): string {
        let translation = "{TranslationMock : key=" + key;
        if (params) translation +=  ";values=" + Array.from(params.values());
        translation+='}'
        return translation;
    }
    setLang(lang: string) {
        // Implementation not needed
    }

    setTranslation(lang: string, translation: Object, shouldMerge: boolean) {
        // Implementation not needed
    }
}