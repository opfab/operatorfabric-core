import {MenuEntryLinkType} from '../../../model/MenuEntryLinkType';

/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

export class MenuEntry {
    linkType: MenuEntryLinkType = MenuEntryLinkType.BOTH;
    showOnlyForGroups: string[];

    constructor(
        public readonly id: string,
        public readonly customMenuId: string,
        public readonly customScreenId: string,
        public readonly opfabCoreMenuId: string,
        public readonly label: string,
        public readonly url: string,
        public readonly visible: boolean,
        public readonly entries: MenuEntry[],
        linkType?: MenuEntryLinkType,
        showOnlyForGroups?: string[]
    ) {}
}
