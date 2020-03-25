/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, of, Subscription } from 'rxjs';
import { LightCard } from '@ofModel/light-card.model';
import { select, Store } from '@ngrx/store';
import { catchError, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AppState } from '@ofStore/index';
import { SetCardDataTimeline } from '@ofActions/timeline.actions';
import * as _ from 'lodash';
import * as feedSelectors from '@ofSelectors/feed.selectors';
import { buildConfigSelector } from '@ofStore/selectors/config.selectors';
import { buildSettingsOrConfigSelector } from '@ofStore/selectors/settings.x.config.selectors';
import * as moment from 'moment';

@Component({
    selector: 'of-time-line',
    templateUrl: './time-line.component.html',
})
export class TimeLineComponent implements OnInit, OnDestroy {
    lightCards$: Observable<LightCard[]>;
    subscription: Subscription;
    localSubscription: Subscription;

    public confDomain = [];
    public domains: any;


    constructor(private store: Store<AppState>) { }
    ngOnInit() {

        this.loadConfiguration();
        this.loadDomainsListFromConfiguration();

        this.localSubscription = this.store.select(buildSettingsOrConfigSelector('locale')).subscribe(
            l => moment.locale(l)
        )

        this.subscription = this.store.pipe(select(feedSelectors.selectFeed))
            .pipe(debounceTime(300), distinctUntilChanged())
            .subscribe(value => this.sendAllCardsToDrawOnTheTimeLine(value));
    }

    loadConfiguration() {
    
        this.domains = {
            J: {
                buttonTitle: 'J',
                domainId:'J',
            }, TR: {
                buttonTitle: 'TR',
                domainId : 'TR',
            }, '7D': {
                buttonTitle: '7D',
                domainId:'7D',
                followClockTick: true
            }, 'W': {
                buttonTitle: 'W',
                domainId : 'W',
                followClockTick: false
            }, M: {
                buttonTitle: 'M',
                domainId : 'M',
                followClockTick: false
            }, Y: {
                buttonTitle: 'Y',
                domainId: 'Y',
                followClockTick: false
            }
        };

    }


    loadDomainsListFromConfiguration() {
        this.store.pipe(select(buildConfigSelector('feed.timeline.domains')), catchError(() => of([]))).subscribe(d => {
            if (d) {
                d.map(domain => {
                    if (Object.keys(this.domains).includes(domain)) {
                        this.confDomain.push(this.domains[domain]);
                    }
                });
            }
            
        });
    }

    sendAllCardsToDrawOnTheTimeLine(cards) {
        const cards_copy = _.cloneDeep(cards);
        const myCardsTimeline = [];
        for (const card of cards_copy) {
            if (card.timeSpans && card.timeSpans.length > 0) {
                card.timeSpans.forEach(d => {
                    const myCardTimelineTimespans = {
                        displayDate: d.start, publishDate: d.start, 
                        startDate: d.start, 
                        endDate: d.end, 
                        severity: card.severity, publisher: card.publisher,
                        publisherVersion: card.publisherVersion, summary: card.title
                    };
                    myCardsTimeline.push(myCardTimelineTimespans);
                });
            } else {
                const myCardTimeline = {
                    displayDate: card.startDate,
                    publishDate: card.publishDate, 
                    startDate: card.startDate, 
                    endDate: card.endDate, 
                    severity: card.severity, publisher: card.publisher,
                    publisherVersion: card.publisherVersion, summary: card.title
                };
                myCardsTimeline.push(myCardTimeline);
            }
        }
        this.store.dispatch(new SetCardDataTimeline({ cardsTimeline: myCardsTimeline }));
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
        if (this.localSubscription) {
            this.localSubscription.unsubscribe();
        }
        
    }
}
