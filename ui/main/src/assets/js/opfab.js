/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

const opfab = {};

opfab.multiSelect = {
    // these value is to be provide at startup by opfab angular application
    // it is done in i18n.service.ts
    searchPlaceholderText: '',
    clearButtonText: 'test',
    noOptionsText: '',
    noSearchResultsText: '',

    init: function (id, options) {
        const multiSelect = {
            id: this.id,
            getSelectedValues() {
                return document.querySelector('#' + id).value;
            }
        };
        VirtualSelect.init({
            ele: '#' + id,
            options: options,
            optionsCount: 8,
            multiple: true,
            showValueAsTags: true,
            placeholder: '',
            selectAllOnlyVisible: true,
            searchPlaceholderText: this.searchPlaceholderText,
            clearButtonText: this.clearButtonText,
            noOptionsText: this.noOptionsText,
            noSearchResultsText: this.noSearchResultsText
        });
        return multiSelect;
    }
};
