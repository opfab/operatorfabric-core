/* Copyright (c) 2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ScreenDefinition, ScreenType} from '../ScreenDefinition';

export class DashboardScreenDefinition extends ScreenDefinition {
    processList: string[];
    customTiles?: CustomTile[];
    initialBusinessPeriod?: string;
    type = ScreenType.DASHBOARD;
}

export interface ProcessCustomLink {
    processId: string;
    customLinks: CustomLink[];
}

export interface CustomLink {
    label: string;
    customScreenId: string;
}

export interface CustomTile {
    title: string;
    cells: CustomTileCell[];
}

export interface CustomTileCell {
    label: string;
    customScreenId: string;
}
