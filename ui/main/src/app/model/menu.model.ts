/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {I18n} from './i18n.model';


export class Menu {
    constructor(
        readonly id: string,
        readonly label: string,
        readonly entries: MenuEntry[]) {
    }
}

export class MenuEntry {

    linkType: MenuEntryLinkTypeEnum = MenuEntryLinkTypeEnum.BOTH;
    showOnlyForGroups: string[];

    constructor(
        readonly id: string,
        readonly label: string,
        readonly url: string,
        linkType?: MenuEntryLinkTypeEnum,
        showOnlyForGroups?: string[]
    ) {
    }
}

export enum MenuEntryLinkTypeEnum {
    TAB = 'TAB',
    IFRAME = 'IFRAME',
    BOTH = 'BOTH'
}

export class Locale {
    constructor(
        readonly language: string,
        readonly i18n: I18n) {

        }
}
    
export class UIMenuFile {
    constructor(
        readonly menus: Menu[],
        readonly locales: Locale[],
        readonly coreMenusConfiguration: CoreMenuConfig[]) {
        }
}

export class CoreMenuConfig {
    constructor(
        readonly id: string,
        readonly visible?: boolean,
        readonly showOnlyForGroups?: string[]
    ) {
    }
}