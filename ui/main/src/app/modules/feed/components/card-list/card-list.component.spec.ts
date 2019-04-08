/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {CardListComponent} from './card-list.component';
import {CardComponent} from '../../../cards/components/card/card.component';
import {FiltersComponent} from "./filters/filters.component";
import {TypeFilterComponent} from "./filters/type-filter/type-filter.component";
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";

describe('CardListComponent', () => {
  let component: CardListComponent;
  let fixture: ComponentFixture<CardListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
        imports: [NgbModule.forRoot()],
        declarations: [ CardListComponent, CardComponent, FiltersComponent, TypeFilterComponent]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
