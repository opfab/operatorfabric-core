/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {MenuEntry} from '@ofServices/config/model/MenuEntry';
import {Locale} from '@ofServices/config/model/Locale';

export class UIMenuFile {
    constructor(
        readonly navigationBar: MenuEntry[],
        readonly topRightIconMenus: MenuEntry[],
        readonly topRightMenus: MenuEntry[],
        readonly locales: Locale[],
        readonly showDropdownMenuEvenIfOnlyOneEntry: boolean
    ) {}
}
