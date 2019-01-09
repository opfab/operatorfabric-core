/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {async, ComponentFixture, TestBed} from '@angular/core/testing';


import {CardComponent} from './card.component';
import {getOneRandomLigthCard} from '../../../../../tests/helpers';
import {RouterTestingModule} from "@angular/router/testing";

describe('CardComponent', () => {
    let lightCardDetailsComp: CardComponent;
    let fixture: ComponentFixture<CardComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [CardComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CardComponent);
        lightCardDetailsComp = fixture.debugElement.componentInstance;
    });

    it('should create and display minimal light card information', () => {
        const lightCard = getOneRandomLigthCard();

        // extract expected data
        const id = lightCard.id;
        const uid = lightCard.uid;
        const title = lightCard.title.key;
        const summaryValue = lightCard.summary.key;

        lightCardDetailsComp.lightCard = lightCard;

        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('.card-title').innerText)
            .toEqual(title);
        expect(fixture.nativeElement.querySelector('.card-body > p'))
            .toBeFalsy();
    });

});
