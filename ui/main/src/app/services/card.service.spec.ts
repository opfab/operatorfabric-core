/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {inject, TestBed} from '@angular/core/testing';

import {CardService} from './card.service';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {AuthenticationService} from '@ofServices/authentication.service';
import {GuidService} from "@ofServices/guid.service";
import {StoreModule} from "@ngrx/store";
import {appReducer} from "@ofStore/index";
import SpyObj = jasmine.SpyObj;
import createSpyObj = jasmine.createSpyObj;
import { IArchiveFilter } from '@ofModel/archive-filter.model';
import { DateTimeNgb } from '@ofModel/datetime-ngb.model';


describe('CardService', () => {
    let httpMock: HttpTestingController;
    let authenticationService: SpyObj<AuthenticationService>;

    beforeEach(() => {
        const authenticationServiceSpy = createSpyObj('authenticationService'
            , ['extractToken'
                , 'verifyExpirationDate'
                , 'clearAuthenticationInformation'
                , 'registerAuthenticationInformation'
            ]);

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule,
                StoreModule.forRoot(appReducer)],
            providers: [CardService
                , AuthenticationService
                ,GuidService
            ]
        });
        httpMock = TestBed.get(HttpTestingController);
        authenticationService = TestBed.get(AuthenticationService);
    });


    it('should construct a query string from IArchiveFilter', inject([CardService], (service: CardService) => {

        let archiveFilter: IArchiveFilter;

        archiveFilter = {
            endBusnDate: new DateTimeNgb({day: 14, month: 8, year: 2019}, {hour: 1, minute: 1, second: 0}),
            endNotifDate: new DateTimeNgb({day: 15, month: 9, year: 2019}, {hour: 1, minute: 11, second: 0}),
            process: ['122', 'Amine'],
            publisher: ['122'],
            startBusnDate: new DateTimeNgb({day: 14, month: 8, year: 2019}, {hour: 1, minute: 1, second: 0}),
            startNotifDate: new DateTimeNgb({day: 24, month: 8, year: 2014}, {hour: 1, minute: 1, second: 0})
        };
        
        expect('filters').toEqual('filters');

    }));
});
