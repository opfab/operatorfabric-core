/* Copyright (c) 2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {TranslationService} from '@ofServices/translation/TranslationService';
import {Utilities} from './Utilities';

export class AgGrid {
    public static getTextMatcherWithEmojis(filterOption, value, filterText): boolean {
        if (filterText == null || value == null) {
            return false;
        }
        switch (filterOption) {
            case 'contains':
                return value.indexOf(filterText) >= 0;
            case 'notContains':
                return value.indexOf(filterText) < 0;
            case 'equals':
                return Utilities.compareObj(value, filterText) === 0;
            case 'notEqual':
                return Utilities.compareObj(value, filterText) !== 0;
            case 'startsWith':
                return Utilities.removeEmojis(value).startsWith(filterText);
            case 'endsWith':
                return Utilities.removeEmojis(value).endsWith(filterText);
        }
    }

    public static getDefaultGridOptions() {
        return {
            domLayout: 'autoHeight',
            ensureDomOrder: true, // rearrange row-index of rows when sorting cards (used for cypress)
            pagination: true,
            suppressCellFocus: true,
            headerHeight: 70,
            suppressPaginationPanel: true,
            suppressHorizontalScroll: true,
            rowHeight: 45,
            // Changing the default value of the row buffer is necessary to be able to
            // dynamically change the pagination page size, if we keep the default value (10),
            // when a vertical scroll is present and for example the user pass from
            // 10 to 100 items per page, the grid will not display all the 100 items
            rowBuffer: 100,

            getLocaleText: function (params) {
                // To avoid clashing with opfab assets, all keys defined by ag-grid are prefixed with "ag-grid."
                // e.g. key "to" defined by ag-grid for use with pagination can be found under "ag-grid.to" in assets
                return TranslationService.getTranslation('ag-grid.' + params.key);
            }
        };
    }
}
