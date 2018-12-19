/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {async, ComponentFixture, TestBed} from '@angular/core/testing';


import {CardComponent} from './card.component';
import {I18nData, LightCard, Severity} from '@ofModel/light-card.model';
import {MatButtonModule, MatCardModule} from '@angular/material';
import {getOneRandomLigthCard} from '../../../../../tests/helpers';

describe('CardComponent', () => {
    let lightCardDetailsComp: CardComponent;
    let fixture: ComponentFixture<CardComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [MatCardModule, MatButtonModule],
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

        expect(fixture.nativeElement.querySelector('mat-card-title').innerText)
            .toEqual(id);
        expect(fixture.nativeElement.querySelector('mat-card-subtitle').innerText)
            .toEqual(`${title}
${uid}`, 'title and uid should be displayed on two different lines');
        expect(fixture.nativeElement.querySelector('mat-card-content').innerText.trim())
            .toEqual(`${summaryValue}`, 'summary should be followed with an empty line');
    });

});
