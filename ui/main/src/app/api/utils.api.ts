/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {TranslationService} from 'app/business/services/translation/translation.service';

declare const opfab: any;

export function initUtilsAPI(translationService: TranslationService) {
    opfab.utils = {
        escapeHtml: function (htmlStr) {
            if (!htmlStr) return htmlStr;
            return htmlStr
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        },

        convertSpacesAndNewLinesInHTML: function (txt) {
            return txt.replace(/\n/g, '<br/>').replace(/\s\s/g, '&nbsp;&nbsp;');
        },

        getTranslation: function (key, params) {
            return translationService.getTranslation(key, params);
        }
    };

    // prevent unwanted modifications from templates code
    Object.freeze(opfab.utils);
}
