/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 *  See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable} from '@angular/core';
import {TranslationService} from 'app/business/services/translation/translation.service';
import {TranslateService} from '@ngx-translate/core';

@Injectable({
    providedIn: 'root'
})
export class AngularTranslationService extends TranslationService {
    constructor(private translateService: TranslateService) {
        super();
    }
    setTranslation(lang: string, translation: Object, shouldMerge: boolean) {
        this.translateService.setTranslation(lang, translation, shouldMerge);
    }

    getTranslation(key: string, params?: Map<string, string>): string {
        if (!key) return '';
        return this.translateService.instant(key, params);
    }
    setLang(lang: string) {
        this.translateService.use(lang);
    }
}
