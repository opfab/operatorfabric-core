/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {AfterViewInit, Component, OnInit} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {Observable, of} from 'rxjs';
import {LightCard} from '@ofModel/light-card.model';
import * as feedSelectors from '@ofSelectors/feed.selectors';
import {catchError} from 'rxjs/operators';
import {buildConfigSelector} from '@ofSelectors/config.selectors';
import * as moment from 'moment';
import { NotifyService } from '@ofServices/notify.service';

@Component({
    selector: 'of-cards',
    templateUrl: './feed.component.html',
    styleUrls: ['./feed.component.scss']
})
export class FeedComponent implements OnInit, AfterViewInit {

    lightCards$: Observable<LightCard[]>;
    selection$: Observable<string>;
    hideTimeLine: boolean;

    constructor(private store: Store<AppState>, private notifyService: NotifyService) {
    }

    ngOnInit() {
        this.lightCards$ = this.store.pipe(
            select(feedSelectors.selectFilteredFeed),
            catchError(err => of([]))
        );
        this.selection$ = this.store.select(feedSelectors.selectLightCardSelection);
        this.store.select(buildConfigSelector('feed.timeline.hide')).subscribe(
            v => this.hideTimeLine = v
        );
        moment.updateLocale('en', { week: {
            dow: 6, // First day of week is Saturday
            doy: 12 // First week of year must contain 1 January (7 + 6 - 1)
        }});
        this.store.select(buildConfigSelector('feed.notify')).subscribe(
            (notif) => {
                if (notif) {
                    this.notifyService.requestPermission();
                }
            }
        );
    }
    ngAfterViewInit() {
    }
}
