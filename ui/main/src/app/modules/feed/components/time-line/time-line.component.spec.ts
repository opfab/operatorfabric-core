/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimeLineComponent } from './time-line.component';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { Store, StoreModule } from '@ngrx/store';
import { appReducer, AppState, storeConfig } from '@ofStore/index';
import { RouterTestingModule } from '@angular/router/testing';
import { RouterStateSerializer, StoreRouterConnectingModule } from '@ngrx/router-store';
import { CustomTimelineChartComponent } from '../custom-timeline-chart/custom-timeline-chart.component';
import { InitChartComponent } from '../init-chart/init-chart.component';
import { CustomRouterStateSerializer } from '@ofStates/router.state';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { getOneRandomLigthCard } from '@tests/helpers';
import { LoadLightCardsSuccess } from '@ofActions/light-card.actions';
import { LightCard } from '@ofModel/light-card.model';
import * as fromStore from '@ofSelectors/feed.selectors';

describe('TimeLineComponent', () => {
  let component: TimeLineComponent;
  // let componentInit: InitChartComponent;
  let store: Store<AppState>;
  let fixture: ComponentFixture<TimeLineComponent>;
  // let fixtureInit: ComponentFixture<InitChartComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule,
        BrowserAnimationsModule,
        FormsModule,
        StoreModule.forRoot(appReducer, storeConfig),
        RouterTestingModule,
        StoreRouterConnectingModule,
        NgxChartsModule ],
      declarations: [ TimeLineComponent, CustomTimelineChartComponent, InitChartComponent ],
      providers: [{provide: Store, useClass: Store},{provide: RouterStateSerializer, useClass: CustomRouterStateSerializer}],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
    store = TestBed.get(Store);
    spyOn(store, 'dispatch').and.callThrough();
    fixture = TestBed.createComponent(TimeLineComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

/*  it('should create', async() => {
    fixture.detectChanges();
    fixtureInit = TestBed.createComponent(InitChartComponent);
    componentInit = fixtureInit.componentInstance;
    fixtureInit.detectChanges();
    spyOn(componentInit, 'applyNewZoom');

    const button = fixture.nativeElement.children[1].children[0].querySelectorAll('button');
    button[2].click();
    button[3].click();
    componentInit.applyNewZoom('in');
    // button[4].click();
    /!*fixture.whenStable().then(() => {
      expect(component.onEditButtonClick).toHaveBeenCalled();
    });*!/
    expect(component).toBeTruthy();
  });*/

  it('should create timeline with other conf', () => {
    const conf = {
      enableDrag: true,
      enableZoom: false,
      autoScale: false,
      animations: true,
      showGridLines: false,
      realTimeBar: false,
      centeredOnTicks: false,
    };
    component.conf = conf;
    fixture.detectChanges();
    component.conf = conf;
    expect(component).toBeTruthy();
  });

  it('should create a list with one element when there are ' +
      'only one card in the state', () => {
    // const compiled = fixture.debugElement.nativeElement;
    const oneCard = getOneRandomLigthCard();
    const action = new LoadLightCardsSuccess({lightCards: [oneCard] as LightCard[]});
    store.dispatch(action);
    const lightCards$ = store.select(fromStore.selectFeed);
    lightCards$.subscribe(lightCard => {
      expect(lightCard).toEqual([oneCard]);
    });
    expect(store.dispatch).toHaveBeenCalledWith(action);
    expect(component).toBeTruthy();
    const compiled = fixture.debugElement.nativeElement;
    fixture.detectChanges();
/*
    // title exists
    // expect(compiled.querySelector('h3').textContent).toContain('Feed');
    // a list exists
    expect(compiled.querySelector('.feed-content > div')).toBeTruthy();*/
  });

  it('should create four differents circles when there are ' +
      'four cards with differents severity in the state', () => {
    // const compiled = fixture.debugElement.nativeElement;
    const oneCard = getOneRandomLigthCard();
    const actionCard = getOneRandomLigthCard({severity: 'ACTION'});
    const alarmCard = getOneRandomLigthCard({severity: 'ALARM'});
    const notificationCard = getOneRandomLigthCard({severity: 'NOTIFICATION'});
    const action = new LoadLightCardsSuccess({lightCards: [oneCard, actionCard, alarmCard, notificationCard] as LightCard[]});
    store.dispatch(action);
    const lightCards$ = store.select(fromStore.selectFeed);
    lightCards$.subscribe(lightCard => {
      expect(lightCard).toEqual([oneCard, actionCard, alarmCard, notificationCard]);
    });
    expect(store.dispatch).toHaveBeenCalledWith(action);
    expect(component).toBeTruthy();
    const compiled = fixture.debugElement.nativeElement;
    fixture.detectChanges();
/*
    expect(compiled.querySelector('.feed-content > div')).toBeTruthy();
    // counts the list elements
    const listElements = fixture.debugElement.queryAll(By.css('.feed-content > div'));
    const numberOfCardsInTheActionPayload = 2;
    expect(listElements.length).toEqual(numberOfCardsInTheActionPayload);*/
  });
});
