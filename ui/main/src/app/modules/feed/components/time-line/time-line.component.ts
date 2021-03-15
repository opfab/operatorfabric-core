/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



import {Component, OnInit, OnDestroy} from '@angular/core';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from '@ofStore/index';
import { buildSettingsOrConfigSelector } from '@ofStore/selectors/settings.x.config.selectors';
import * as moment from 'moment';

@Component({
    selector: 'of-time-line',
    templateUrl: './time-line.component.html',
})
export class TimeLineComponent implements OnInit, OnDestroy {

    localSubscription: Subscription;

    constructor(private store: Store<AppState>) { }

    ngOnInit() {
        this.localSubscription = this.store.select(buildSettingsOrConfigSelector('locale')).subscribe(
            l => moment.locale(l)
        )
    }

    ngOnDestroy() {
        if (this.localSubscription) {
            this.localSubscription.unsubscribe();
        }
    }
}
