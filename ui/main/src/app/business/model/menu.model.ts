/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {I18n} from './i18n.model';

export class MenuEntry {
    linkType: MenuEntryLinkTypeEnum = MenuEntryLinkTypeEnum.BOTH;
    showOnlyForGroups: string[];

    constructor(
        public readonly id: string,
        public readonly customMenuId: string,
        public readonly opfabCoreMenuId: string,
        public readonly label: string,
        public readonly url: string,
        public readonly visible: boolean,
        public readonly entries: MenuEntry[],
        linkType?: MenuEntryLinkTypeEnum,
        showOnlyForGroups?: string[]
    ) {}
}

export enum MenuEntryLinkTypeEnum {
    TAB = 'TAB',
    IFRAME = 'IFRAME',
    BOTH = 'BOTH'
}

export class Locale {
    constructor(
        readonly language: string,
        readonly i18n: I18n
    ) {}
}

export class UIMenuFile {
    constructor(
        readonly navigationBar: MenuEntry[],
        readonly topRightIconMenus: MenuEntry[],
        readonly topRightMenus: MenuEntry[],
        readonly locales: Locale[],
        readonly showDropdownMenuEvenIfOnlyOneEntry: boolean
    ) {}
}
