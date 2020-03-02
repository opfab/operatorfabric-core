/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


import {Component, OnDestroy, OnInit} from '@angular/core';
import {MultiSettingsComponent} from '../multi-settings/multi-settings.component';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';

@Component({
    selector: 'of-type-ahead-settings',
    templateUrl: './type-ahead-settings.component.html',
    styleUrls: ['./type-ahead-settings.component.scss']
})
export class TypeAheadSettingsComponent extends MultiSettingsComponent implements OnInit, OnDestroy {

    constructor(protected store: Store<AppState>) {
        super(store);
    }

}
