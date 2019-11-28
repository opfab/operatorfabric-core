/* Copyright (c) 2018, RTE (http://www.rte-france.com)
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
import {getOneRandomLigthCard} from '@tests/helpers';
import {LoadLightCardsSuccess} from '@ofActions/light-card.actions';
import {LightCard} from '@ofModel/light-card.model';
import * as fromStore from '@ofSelectors/feed.selectors';
import * as timelineSelectors from '@ofSelectors/timeline.selectors';
import {DraggableDirective} from './directives/app-draggable';
import {MouseWheelDirective} from './directives/mouse-wheel.directive';
import {XAxisTickFormatPipe} from './tick-format-pipe/x-axis-tick-format.pipe';
import * as moment from 'moment';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {compareBySeverityLttdPublishDate} from '@ofStates/feed.state';
import {TimeService} from '@ofServices/time.service';

fdescribe('TimeLineComponent', () => {
  let component: TimeLineComponent;
  let store: Store<AppState>;
  let fixture: ComponentFixture<TimeLineComponent>;
  // let componentInit: InitChartComponent;
  // let fixtureInit: ComponentFixture<InitChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule,
        BrowserAnimationsModule,
        FormsModule,
        StoreModule.forRoot(appReducer, storeConfig),
        RouterTestingModule,
        StoreRouterConnectingModule,
        NgxChartsModule ],
      declarations: [ TimeLineComponent, CustomTimelineChartComponent, InitChartComponent, DraggableDirective, MouseWheelDirective,
        XAxisTickFormatPipe],
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

  it('should return a date formatted by domain Conf pass on parameter ' +
    'from periodStartToEnd function', () => {
    fixture.detectChanges();
    const actualMoment = moment();
    const oneWeekConf = {
      week: 1,
    };
    const momentOnFuture = moment(actualMoment);
    momentOnFuture.add(1, 'week');
    // cause of execution time between declaration of actualMoment and periodStartToEnd
    momentOnFuture.minute(0).second(0).millisecond(0);
    const momentOnPast = moment(actualMoment);
    momentOnPast.subtract(1, 'week');
    momentOnPast.minute(0).second(0).millisecond(0);
    const startDomain = component.periodStartToEnd(oneWeekConf, false);
    startDomain.minute(0).second(0).millisecond(0);
    const endDomain = component.periodStartToEnd(oneWeekConf, true);
    endDomain.minute(0).second(0).millisecond(0);
    expect(endDomain.valueOf()).toEqual(momentOnFuture.valueOf());
    expect(startDomain.valueOf()).toEqual(momentOnPast.valueOf());
    expect(component).toBeTruthy();
  });

  it('should create a list with one element when there is ' +
    'only one card in the state', (done) => {
    fixture.detectChanges();
    const oneCard = getOneRandomLigthCard();
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
    // title exists
    // expect(compiled.childrend[0]); // .querySelector('h3').textContent).toContain('Feed');
    // a list exists
    // expect(compiled.querySelector('.feed-content > div')).toBeTruthy();
  });

  it('should create four differents circles when there is ' +
      'four cards with differents severity in the state', (done) => {
    // const compiled = fixture.debugElement.nativeElement;
    fixture.detectChanges();
    const oneCard = getOneRandomLigthCard();
    const actionCard = getOneRandomLigthCard({severity: 'ACTION'});
    const alarmCard = getOneRandomLigthCard({severity: 'ALARM'});
    const notificationCard = getOneRandomLigthCard({severity: 'NOTIFICATION'});
    // alarmCard.timeSpans = [{start: alarmCard.publishDate, end: alarmCard.endDate, display: 1}];  // display is an enum normally
    const action = new LoadLightCardsSuccess({lightCards: [oneCard, actionCard, alarmCard, notificationCard] as LightCard[]});
    store.dispatch(action);
    const lightCards$ = store.select(fromStore.selectFeed);
    lightCards$.pipe(debounceTime(300), distinctUntilChanged())
        .subscribe(lightCard => {
      expect(lightCard).toEqual([oneCard, actionCard, alarmCard, notificationCard].sort(compareBySeverityLttdPublishDate));
    });
    const dataCard = [{
        // timeSpans: [{start: alarmCard.publishDate, end: alarmCard.endDate, display: 1}],
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
        displayDate: oneCard.startDate,
        publishDate: oneCard.publishDate,
        startDate: oneCard.startDate,
        endDate: oneCard.endDate,
        severity: oneCard.severity,
        publisher: oneCard.publisher,
        publisherVersion: oneCard.publisherVersion,
        summary: oneCard.title
    }, {
        displayDate: notificationCard.startDate,
        publishDate: notificationCard.publishDate,
        startDate: notificationCard.startDate,
        endDate: notificationCard.endDate,
        severity: notificationCard.severity,
        publisher: notificationCard.publisher,
        publisherVersion: notificationCard.publisherVersion,
        summary: notificationCard.title
    }];
    const data$ = store.select((timelineSelectors.selectTimelineSelection));
    data$.pipe(debounceTime(300), distinctUntilChanged())
        .subscribe(value => {
          expect(value).toEqual(dataCard);
          done();
        });
    expect(store.dispatch).toHaveBeenCalledWith(action);
    expect(component).toBeTruthy();
/*
    // const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('.feed-content > div')).toBeTruthy();
    // counts the list elements
    const listElements = fixture.debugElement.queryAll(By.css('.feed-content > div'));
    const numberOfCardsInTheActionPayload = 2;
    expect(listElements.length).toEqual(numberOfCardsInTheActionPayload);*/
  });

  it('sould test constructMomentObj return an obj', () => {
    const result = component.constructMomentObj([0, 0, 1, 1, 2, 4, 0]);
    expect(result).toEqual({
      year: 0,
      month: 0,
      week: 1,
      day: 1,
      hour: 2,
      minute: 4,
      second: 0
    });

    const result1 = component.constructMomentObj([0, 0, 1, 1, 2, 4, 0], ['week']);
    expect(result1).toEqual({
      year: 0,
      month: 0,
      week: 1,
      day: 1,
      hour: 2,
      minute: 4,
      second: 0,
      startOf: ['week']
    });

    const result2 = component.constructMomentObj([0, 0, 1, 1, 2, 4, 0], null, [1, 15]);
    expect(result2).toEqual({
      year: 0,
      month: 0,
      week: 1,
      day: 1,
      hour: 2,
      minute: 4,
      second: 0,
      date: [1, 15]
    });
  });
});
