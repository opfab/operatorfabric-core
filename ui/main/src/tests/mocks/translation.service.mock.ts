/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {TranslationService} from 'app/business/services/translation/translation.service';

export class TranslationServiceMock extends TranslationService {
    lang = 'en';

    getTranslation(key: string, params?: Map<string, string>): string {
        let translation = 'Translation (' + this.lang + ') of ' + key;
        if (params) translation += ' with values=' + Array.from(params.values());
        return translation;
    }
    setLang(lang: string) {
        this.lang = lang;
    }

    setTranslation(lang: string, translation: Object, shouldMerge: boolean) {
        // Implementation not needed
    }
}
