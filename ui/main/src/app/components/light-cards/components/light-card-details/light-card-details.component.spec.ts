/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {async, ComponentFixture, TestBed} from '@angular/core/testing';


import {LightCardDetailsComponent} from './light-card-details.component';
import {I18nData, LightCard, Severity} from '@state/light-card/light-card.model';
import {MatButtonModule, MatCardModule} from '@angular/material';

describe('LightCardDetailsComponent', () => {
    let lightCardDetailsComp: LightCardDetailsComponent;
    let fixture: ComponentFixture<LightCardDetailsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [MatCardModule, MatButtonModule],
            declarations: [LightCardDetailsComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LightCardDetailsComponent);
        lightCardDetailsComp = fixture.debugElement.componentInstance;
    });

    it('should create', () => {
        const i18nData = new I18nData('title-key', ['title-string-0']);
        const title = i18nData;
        expect(title).toBeTruthy();
        expect(title.key).toEqual('title-key');

        const summary = new I18nData('summary-key', ['summary-string-0']);
        expect(lightCardDetailsComp).toBeTruthy();
        const lightCard = new LightCard('uid'
            , 'id'
            , 1
            , 2
            , Severity.QUESTION
            , 'mainRecipient'
            , 'processId'
            , 3
            , title
            , summary
        ) as LightCard;

        expect(lightCard.title).toEqual(title);
        lightCardDetailsComp.lightCard = lightCard;

        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('mat-card-title').innerText)
            .toEqual('title-key-id-uid');

    });

});
