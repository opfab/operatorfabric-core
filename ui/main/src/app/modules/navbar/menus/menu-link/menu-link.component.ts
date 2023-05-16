/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, Input} from '@angular/core';
import {CustomMenu, MenuEntryLinkTypeEnum} from '@ofModel/menu.model';

@Component({
    selector: 'of-menu-link',
    templateUrl: './menu-link.component.html',
    styleUrls: ['./menu-link.component.scss']
})
export class MenuLinkComponent {
    @Input() public menu: CustomMenu;
    @Input() public menuEntry: any;

    constructor() {
        // No body because all members are Inputs.
    }

    LinkType = MenuEntryLinkTypeEnum;

    public hasLinkType(type: MenuEntryLinkTypeEnum) {
        return !!this.menuEntry.customMenuId && this.menuEntry.linkType === type;
    }

    public isLinkACoreMenu() {
        return !!this.menuEntry.opfabCoreMenuId;
    }
}
