/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {AfterViewInit, Component, OnInit} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {AppState} from '../../store/index';
import {Observable, of} from 'rxjs';
import {LightCard} from '@ofModel/light-card.model';
import * as lightCardSelectors from '../../store/selectors/light-card.selectors';
import {catchError, tap} from "rxjs/operators";
import {selectLightCardsState} from "../../store/selectors/light-card.selectors";

@Component({
    selector: 'of-cards',
    templateUrl: './feed.component.html',
    styleUrls: ['./feed.component.scss']
})
export class FeedComponent implements OnInit, AfterViewInit {

    lightCards$: Observable<LightCard[]>;
    selection$: Observable<string>;

    constructor(private store: Store<AppState>) {
    }

    ngOnInit() {
        this.lightCards$ = this.store.pipe(
            select(lightCardSelectors.selectAllLightCards),
            catchError(err => of([]))
        );
        this.selection$ = this.store.select(lightCardSelectors.selectLightCardSelection);
    }


    ngAfterViewInit() {
    }
}
