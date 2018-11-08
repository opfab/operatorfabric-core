/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LightCardsListComponent } from './light-cards-list.component';
import {MatButtonModule, MatCardModule} from '@angular/material';
import {LightCardsModule} from '../../light-cards.module';
import {LightCardDetailsComponent} from '../light-card-details/light-card-details.component';

describe('LightCardsListComponent', () => {
  let component: LightCardsListComponent;
  let fixture: ComponentFixture<LightCardsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
        imports: [MatCardModule, MatButtonModule],
        declarations: [ LightCardsListComponent, LightCardDetailsComponent]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LightCardsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
