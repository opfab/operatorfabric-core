/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 *  See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable} from '@angular/core';
import {TranslationLib} from '@ofServices/translation/lib/TranslationLib';
import {TranslateService} from '@ngx-translate/core';

@Injectable({
    providedIn: 'root'
})
export class AngularTranslationLib extends TranslationLib {
    constructor(private readonly translateService: TranslateService) {
        super();
    }
    setTranslation(lang: string, translation: Object, shouldMerge: boolean) {
        this.translateService.setTranslation(lang, translation, shouldMerge);
    }

    /*
    To use params in a translation string, the translation string should look like
    "key": "This is an {{parameterKey}}"
    and params should be an Object constructed like this
    {parameterKey: 'example'}
    */
    getTranslation(key: string, params?: Object): string {
        if (!key) return '';
        return this.translateService.instant(key, params);
    }
    setLang(lang: string) {
        this.translateService.use(lang);
    }
}
