/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, OnInit} from '@angular/core';
import {AppState} from "@ofStore/index";
import {Store} from "@ngrx/store";
import {selectUserNameOrIdentifier} from "@ofSelectors/authentication.selectors";
import {combineLatest, Observable} from "rxjs";
import {buildSettingsSelector} from "@ofSelectors/settings.selectors";
import {TimeService} from "@ofServices/time.service";
import {map} from "rxjs/operators";
import * as moment from "moment";
import {buildSettingsOrConfigSelector} from "@ofSelectors/settings.x.config.selectors";
import {selectCurrentDate} from "@ofSelectors/time.selectors";

@Component({
    selector: 'of-info',
    templateUrl: './info.component.html',
    styleUrls: ['./info.component.scss']
})
export class InfoComponent implements OnInit {
    private _userName$: Observable<string>;
    private _description$: Observable<string>;
    private _time$: Observable<string>

    constructor(private store: Store<AppState>, private timeService: TimeService) {
    }

    ngOnInit() {
        this._userName$ = this.store.select(selectUserNameOrIdentifier);
        this._description$ = this.store.select(buildSettingsSelector('description'));
        this._time$ = combineLatest(
        this.store.select(selectCurrentDate),
            this.store.select(buildSettingsOrConfigSelector('locale')),
            this.store.select(buildSettingsOrConfigSelector('timeZone'))
        ).pipe(
            map(values => this.timeService.formatTime(moment(values[0])))
        );
    }
    get userName$() {
        return this._userName$;
    }

    get description$() {
        return this._description$;
    }

    get time$() {
        return this._time$;
    }
}
