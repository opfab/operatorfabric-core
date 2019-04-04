/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Action} from '@ngrx/store';
import {LightCard} from '@ofModel/light-card.model';

export enum FeedActionTypes {
    ApplyFilter = '[Feed] Change filter Status'
}

export class ApplyFilter implements Action {
    readonly type = FeedActionTypes.ApplyFilter
    constructor(public payload:{name: String, active: boolean, status: any}){}
}

export type FeedActions =
     ApplyFilter;
