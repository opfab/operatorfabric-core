/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IframeDisplayComponent } from './iframedisplay.component';
import {DomSanitizer} from "@angular/platform-browser";
import {ThirdsService} from "@ofServices/thirds.service";
import {ThirdsServiceMock} from "@tests/mocks/thirds.service.mock";
import {Store, StoreModule} from "@ngrx/store";
import {appReducer, AppState} from "@ofStore/index";
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";

describe('IframeDisplayComponent', () => {
  let component: IframeDisplayComponent;
  let fixture: ComponentFixture<IframeDisplayComponent>;
  let sanitizer: DomSanitizer;
  let thirdService: ThirdsService;
  let store: Store<AppState>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NgbModule.forRoot(),
        StoreModule.forRoot(appReducer),
      ],
      declarations: [IframeDisplayComponent],
      providers: [{provide: store, useClass: Store},
        {provide: ThirdsService, useClass: ThirdsServiceMock}]
    })
        .compileComponents();
    store = TestBed.get(Store);
    sanitizer= TestBed.get(DomSanitizer);
    thirdService= TestBed.get(ThirdsService);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IframeDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


});
