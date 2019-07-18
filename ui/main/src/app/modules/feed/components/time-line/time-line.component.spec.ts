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
import {CustomTimelineChartComponent} from '../custom-timeline-chart/custom-timeline-chart.component';
import {InitChartComponent} from '../init-chart/init-chart.component';
import {CustomRouterStateSerializer} from '@ofStates/router.state';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {getOneRandomLigthCard} from '@tests/helpers';
import {LoadLightCardsSuccess} from '@ofActions/light-card.actions';
import {LightCard} from '@ofModel/light-card.model';
import * as fromStore from '@ofSelectors/feed.selectors';
import * as timelineSelectors from '@ofSelectors/timeline.selectors';
import {DraggableDirective} from './app-draggable';
import {MouseWheelDirective} from './mouse-wheel.directive';
import {XAxisTickFormatPipe} from './x-axis-tick-format.pipe';
import * as moment from 'moment';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {compareBySeverityLttdPublishDate} from '@ofStates/feed.state';
import {TimeService} from '@ofServices/time.service';

describe('TimeLineComponent', () => {
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

  it('should return a date formatted by a cluster level W ' +
    'from dateWithSpaceBeforeMom function', () => {
    const actualMoment = moment();
    actualMoment.hours(0);
    const date = component.dateWithSpaceBeforeMoment(moment(actualMoment), 'W');
    const dateMoment = moment(actualMoment);
    dateMoment.minutes(0).seconds(0).millisecond(0);
    dateMoment.subtract(3 * 4, 'hours');
    expect(date.valueOf()).toEqual(dateMoment.valueOf());
  });


  it('should return a date formatted by a cluster level D-7 ' +
    'from dateWithSpaceBeforeMom function', () => {
    const actualMoment = moment();
    actualMoment.hours(1);
    const date = component.dateWithSpaceBeforeMoment(moment(actualMoment), '7D');
    const dateMoment = moment(actualMoment);
    dateMoment.minutes(0).seconds(0).millisecond(0);
    dateMoment.subtract(13, 'hours');
    expect(date.valueOf()).toEqual(dateMoment.valueOf());
  });


  it('should return a date formatted by a cluster level M ' +
    'from dateWithSpaceBeforeMom function', () => {
    const actualMoment = moment();
    const date = component.dateWithSpaceBeforeMoment(moment(actualMoment), 'M');
    const dateMoment = moment(actualMoment);
    dateMoment.startOf('day');
    dateMoment.subtract(3, 'days');
    expect(date.valueOf()).toEqual(dateMoment.valueOf());
  });


  it('should return a date formatted by a cluster level Y ' +
    'from dateWithSpaceBeforeMom function', () => {
    // referenceMoment date is after the half of the Month
    const referenceMoment = moment();
    referenceMoment.date(17);
    let date = component.dateWithSpaceBeforeMoment(moment(referenceMoment), 'Y');
    let dateMoment = moment(referenceMoment);
    dateMoment.startOf('day');
    dateMoment.startOf('month');
    dateMoment.subtract(1, 'months');
    expect(date.valueOf()).toEqual(dateMoment.valueOf());
    // referenceMoment date is before the half of the Month
    referenceMoment.date(4);
    date = component.dateWithSpaceBeforeMoment(moment(referenceMoment), 'Y');
    dateMoment = moment(referenceMoment);
    dateMoment.startOf('day');
    dateMoment.date(16);
    dateMoment.subtract(2, 'months');
    expect(date.valueOf()).toEqual(dateMoment.valueOf());
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
      publishDate: oneCard.publishDate,
      startDate: oneCard.startDate,
      endDate: oneCard.endDate,
      severity: oneCard.severity,
      summary: oneCard.summary.parameters.value
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
    const action = new LoadLightCardsSuccess({lightCards: [oneCard, actionCard, alarmCard, notificationCard] as LightCard[]});
    store.dispatch(action);
    const lightCards$ = store.select(fromStore.selectFeed);
    lightCards$.pipe(debounceTime(300), distinctUntilChanged())
        .subscribe(lightCard => {
      expect(lightCard).toEqual([oneCard, actionCard, alarmCard, notificationCard].sort(compareBySeverityLttdPublishDate));
    });
    const dataCard = [{
        publishDate: alarmCard.publishDate,
        startDate: alarmCard.startDate,
        endDate: alarmCard.endDate,
        severity: alarmCard.severity,
        summary: alarmCard.summary.parameters.value
    }, {
        publishDate: actionCard.publishDate,
        startDate: actionCard.startDate,
        endDate: actionCard.endDate,
        severity: actionCard.severity,
        summary: actionCard.summary.parameters.value
    }, {
        publishDate: oneCard.publishDate,
        startDate: oneCard.startDate,
        endDate: oneCard.endDate,
        severity: oneCard.severity,
        summary: oneCard.summary.parameters.value
    }, {
        publishDate: notificationCard.publishDate,
        startDate: notificationCard.startDate,
        endDate: notificationCard.endDate,
        severity: notificationCard.severity,
        summary: notificationCard.summary.parameters.value
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
});
