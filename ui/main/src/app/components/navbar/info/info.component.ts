/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



import {Component, OnInit} from '@angular/core';
import {AppState} from '@ofStore/index';
import {Store} from '@ngrx/store';
import {selectUserNameOrIdentifier} from '@ofSelectors/authentication.selectors';
import {Observable} from 'rxjs';
import {buildSettingsSelector} from '@ofSelectors/settings.selectors';
import {TimeService} from '@ofServices/time.service';
import * as moment from 'moment';


@Component({
    selector: 'of-info',
    templateUrl: './info.component.html',
    styleUrls: ['./info.component.scss']
})
export class InfoComponent implements OnInit {
     _userName$: Observable<string>;
     _description$: Observable<string>;
     timeToDisplay: string;

    constructor(private store: Store<AppState>, private timeService: TimeService) {
    }

    ngOnInit() {
        this.updateTime();
        this._userName$ = this.store.select(selectUserNameOrIdentifier);
        this._description$ = this.store.select(buildSettingsSelector('description'));
    }


  updateTime(): void {
    this.timeToDisplay = this.timeService.formatTime(moment());
    setTimeout(() => {
      this.updateTime();
    }, 1000);
  }
}
