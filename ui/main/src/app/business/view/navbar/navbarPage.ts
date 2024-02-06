/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {MenuEntryLinkTypeEnum} from '@ofModel/menu.model';

export class NavbarPage {
    showEnvironmentName: boolean;
    environmentName: string;
    environmentColor: string;
    logo: Logo;
}

export class Logo {
    isDefaultOpfabLogo: boolean;
    base64Image: string;
    height: number;
    width: number;
}

export class NavbarMenu {
    upperMenuElements: NavbarMenuElement[];
    isCalendarIconVisible: boolean;
    isCreateUserCardIconVisible: boolean;
    rightMenuElements: NavbarMenuElement[];
    rightMenuCollapsedElements: NavbarMenuElement[];
    currentSelectedMenuId: string;
}

export class NavbarMenuElement {
    isCoreMenu: boolean;
    id: string;
    url: string;
    label: string;
    linkType: MenuEntryLinkTypeEnum;
    dropdownMenu: NavbarMenuElement[];
}
