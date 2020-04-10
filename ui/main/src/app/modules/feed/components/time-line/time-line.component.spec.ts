/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {TimeLineComponent} from './time-line.component';
import {APP_BASE_HREF, CommonModule} from '@angular/common';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule} from '@angular/forms';
import {NgxChartsModule} from '@swimlane/ngx-charts';
import {Store, StoreModule} from '@ngrx/store';
import {appReducer, AppState, storeConfig} from '@ofStore/index';
import {RouterTestingModule} from '@angular/router/testing';
import {RouterStateSerializer, StoreRouterConnectingModule} from '@ngrx/router-store';
import {CustomTimelineChartComponent} from './custom-timeline-chart/custom-timeline-chart.component';
import {InitChartComponent} from './init-chart/init-chart.component';
import {CustomRouterStateSerializer} from '@ofStates/router.state';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {getOneRandomLightCard} from '@tests/helpers';
import {LoadLightCardsSuccess} from '@ofActions/light-card.actions';
import {LightCard} from '@ofModel/light-card.model';
import * as fromStore from '@ofSelectors/feed.selectors';
import * as timelineSelectors from '@ofSelectors/timeline.selectors';
import {MouseWheelDirective} from './directives/mouse-wheel.directive';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {compareBySeverityPublishDate} from '@ofStates/feed.state';
import {TimeService} from '@ofServices/time.service';

describe('TimeLineComponent', () => {
  let component: TimeLineComponent;
  let store: Store<AppState>;
  let fixture: ComponentFixture<TimeLineComponent>;
;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule,
        BrowserAnimationsModule,
        FormsModule,
        StoreModule.forRoot(appReducer, storeConfig),
        RouterTestingModule,
        StoreRouterConnectingModule,
        NgxChartsModule ],
      declarations: [ TimeLineComponent, CustomTimelineChartComponent, InitChartComponent,MouseWheelDirective],
      providers: [{provide: APP_BASE_HREF, useValue: '/'},
        {provide: Store, useClass: Store},
        {provide: RouterStateSerializer, useClass: CustomRouterStateSerializer},
        {provide: TimeService, useClass: TimeService}],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
    store = TestBed.get(Store);
    spyOn(store, 'dispatch').and.callThrough();
    fixture = TestBed.createComponent(TimeLineComponent);
    component = fixture.componentInstance;
  }));

  it('should init timeline', () => {
    component.ngOnInit();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });


  it('should create a list with one element when there is ' +
    'only one card in the state', (done) => {
    fixture.detectChanges();
    const oneCard = getOneRandomLightCard();
    const action = new LoadLightCardsSuccess({lightCards: [oneCard] as LightCard[]});
    store.dispatch(action);
    const lightCards$ = store.select(fromStore.selectFeed);
    lightCards$.pipe(debounceTime(300), distinctUntilChanged())
        .subscribe(lightCard => {
      expect(lightCard).toEqual([oneCard]);
    });
    const dataCard = [{
      displayDate: oneCard.startDate,
      publishDate: oneCard.publishDate,
      startDate: oneCard.startDate,
      endDate: oneCard.endDate,
      severity: oneCard.severity,
      publisher: oneCard.publisher,
      publisherVersion: oneCard.publisherVersion,
      summary: oneCard.title
    }];
    const data$ = store.select((timelineSelectors.selectTimelineSelection));
    data$.pipe(debounceTime(300), distinctUntilChanged())
        .subscribe(value => {
          expect(value).toEqual(dataCard);
          done();
        });
    expect(store.dispatch).toHaveBeenCalledWith(action);
    expect(component).toBeTruthy();

  });

  it('should create four different circles when there is ' +
      'four cards with different severity in the state', (done) => {
    fixture.detectChanges();
    const compliantCard = getOneRandomLightCard({severity: 'COMPLIANT'});
    const actionCard = getOneRandomLightCard({severity: 'ACTION'});
    const alarmCard = getOneRandomLightCard({severity: 'ALARM'});
    const informationCard = getOneRandomLightCard({severity: 'INFORMATION'});
    const action = new LoadLightCardsSuccess({lightCards: [alarmCard,actionCard,compliantCard,informationCard] as LightCard[]});
    store.dispatch(action);
    const lightCards$ = store.select(fromStore.selectSortedFilteredLightCards);
    lightCards$.pipe(debounceTime(300), distinctUntilChanged())
        .subscribe(lightCards => {
      expect(lightCards).toEqual([informationCard, alarmCard, actionCard, compliantCard].sort(compareBySeverityPublishDate)); //Default sort
    });
    const dataCard = [{
        displayDate: alarmCard.startDate,
        publishDate: alarmCard.publishDate,
        startDate: alarmCard.startDate,
        endDate: alarmCard.endDate,
        severity: alarmCard.severity,
        publisher: alarmCard.publisher,
        publisherVersion: alarmCard.publisherVersion,
        summary: alarmCard.title
    }, {
        displayDate: actionCard.startDate,
        publishDate: actionCard.publishDate,
        startDate: actionCard.startDate,
        endDate: actionCard.endDate,
        severity: actionCard.severity,
        publisher: actionCard.publisher,
        publisherVersion: actionCard.publisherVersion,
        summary: actionCard.title
    }, {
        displayDate: compliantCard.startDate,
        publishDate: compliantCard.publishDate,
        startDate: compliantCard.startDate,
        endDate: compliantCard.endDate,
        severity: compliantCard.severity,
        publisher: compliantCard.publisher,
        publisherVersion: compliantCard.publisherVersion,
        summary: compliantCard.title
    }, {
        displayDate: informationCard.startDate,
        publishDate: informationCard.publishDate,
        startDate: informationCard.startDate,
        endDate: informationCard.endDate,
        severity: informationCard.severity,
        publisher: informationCard.publisher,
        publisherVersion: informationCard.publisherVersion,
        summary: informationCard.title
    }];
    const data$ = store.select((timelineSelectors.selectTimelineSelection));
    data$.pipe(debounceTime(300), distinctUntilChanged())
        .subscribe(value => {
          expect(value).toEqual(dataCard);
          done();
        });
    expect(store.dispatch).toHaveBeenCalledWith(action);
    expect(component).toBeTruthy();

  });


});
