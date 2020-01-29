/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {IframeDisplayComponent} from './iframedisplay.component';
import {By, DomSanitizer} from "@angular/platform-browser";
import {Store, StoreModule} from "@ngrx/store";
import {appReducer, AppState} from "@ofStore/index";
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {getRandomAlphanumericValue} from "@tests/helpers";
import {SelectMenuLinkSuccess} from "@ofActions/menu.actions";

describe('IframeDisplayComponent', () => {
  let component: IframeDisplayComponent;
  let fixture: ComponentFixture<IframeDisplayComponent>;
  let sanitizer: DomSanitizer;
  let store: Store<AppState>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NgbModule.forRoot(),
        StoreModule.forRoot(appReducer),
      ],
      declarations: [IframeDisplayComponent],
      providers: [{provide: store, useClass: Store}]
    })
        .compileComponents();
    store = TestBed.get(Store);
    sanitizer= TestBed.get(DomSanitizer);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IframeDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display iframe with appropriate url', () => {

    const url = getRandomAlphanumericValue(5, 12);
    store.dispatch(new SelectMenuLinkSuccess({iframe_url: url}));
    component.ngOnInit();
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect( fixture.debugElement.queryAll(By.css('iframe')).length).toBe(1);
    expect( fixture.nativeElement.querySelector('iframe').getAttribute('src')).toEqual(url);

  });


});
