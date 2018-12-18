/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {AfterViewInit, Component, OnInit} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {Observable} from 'rxjs';
import {LightCard} from '@ofModel/light-card.model';
import * as fromStore from '@ofStore/selectors/light-card.selectors';

@Component({
    selector: 'app-cards',
    templateUrl: './light-cards.component.html',
    styleUrls: ['./light-cards.component.scss']
})
export class LightCardsComponent implements OnInit, AfterViewInit {

    lightCards$: Observable<LightCard[]>;

    constructor(private store: Store<AppState>) {
    }

    ngOnInit() {
        this.lightCards$ = this.store.pipe(select(fromStore.selectAllLightCards));
    }


    ngAfterViewInit() {
    }
}
