/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {Component, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {Observable} from 'rxjs';
import {LightCard} from '@ofModel/light-card.model';
import * as feedSelectors from '@ofSelectors/feed.selectors';
import {delay, map} from 'rxjs/operators';
import * as moment from 'moment';
import {LightCardsService} from '@ofServices/lightcards.service';

@Component({
    selector: 'of-cards',
    templateUrl: './feed.component.html',
    styleUrls: ['./feed.component.scss']
})
export class FeedComponent implements OnInit {

    lightCards$: Observable<LightCard[]>;
    selection$: Observable<string>;
    totalNumberOfLightsCards : number = 0;


    constructor(private store: Store<AppState>,private lightCardsService: LightCardsService ) {
    }

    ngOnInit() {

        this.selection$ = this.store.select(feedSelectors.selectLightCardSelection);

        moment.updateLocale('en', { week: {
            dow: 6, // First day of week is Saturday
            doy: 12 // First week of year must contain 1 January (7 + 6 - 1)
        }});

        
        this.lightCards$ = this.lightCardsService.getFilteredAndSortedLightCards().pipe(
            delay(0), // Solve error: 'Expression has changed after it was checked' --> See https://blog.angular-university.io/angular-debugging/
            map(cards => {
                this.totalNumberOfLightsCards = cards.length;
                return cards.slice(0, 100)
            }
            ));
    }


    public enoughSpaceForTimeLine()
    {
      return (window.innerWidth >1000 && window.innerHeight > 700 );
    }

    public enoughSpaceForCardDetail()
    {
      return (window.innerWidth > 1000);
    }
}
