/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable} from '@angular/core';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {GlobalStyleUpdateAction} from '@ofActions/global-style.actions';

declare const opfabStyle: any;

@Injectable({
    providedIn: 'root'
})
export class GlobalStyleService {
    private static style: string;

    constructor(private store: Store<AppState>) {
        opfabStyle.init();
    }

    public getStyle(): string {
        return GlobalStyleService.style;
    }

    public setStyle(style: string) {
        GlobalStyleService.style = style;
        switch (style) {
            case 'DAY': {
                opfabStyle.setCss(opfabStyle.DAY_STYLE);
                break;
            }
            case 'NIGHT': {
                opfabStyle.setCss(opfabStyle.NIGHT_STYLE);
                break;
            }
            default:
                opfabStyle.setCss(opfabStyle.DAY_STYLE);
        }
        this.store.dispatch(new GlobalStyleUpdateAction({style: style}));
    }

}
