/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {TestBed, inject, async} from '@angular/core/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {Observable} from 'rxjs';

import {IdentificationEffects} from './identification.effects';
import {Actions} from '@ngrx/effects';
import SpyObj = jasmine.SpyObj;
import {IdentificationService} from '@core/services/identification.service';
import createSpyObj = jasmine.createSpyObj;

describe('IdentificationEffects', () => {
    let actions$: Observable<any>;
    let effects: IdentificationEffects;
    let authenticationService: SpyObj<IdentificationService>;

    beforeEach(async(() => {
        const authenticationServiceSpy = createSpyObj('authenticationService'
            , ['extractToken'
                , 'verifyExpirationDate'
                , 'clearAuthenticationInformation'
                , 'registerAuthenticationInformation'
            ]);
        TestBed.configureTestingModule({
            providers: [
                IdentificationEffects,
                provideMockActions(() => actions$),
                {provide: IdentificationService, useValue: authenticationServiceSpy}
            ]
        });

        effects = TestBed.get(IdentificationEffects);

    }));

    beforeEach(() => {
        actions$ = TestBed.get(Actions);
        authenticationService = TestBed.get(IdentificationService);
    });

    it('should be created', () => {
        expect(effects).toBeTruthy();
    });
});
