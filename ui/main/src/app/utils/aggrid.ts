/* Copyright (c) 2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Utilities} from './utilities';

export class Aggrid {
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
}
