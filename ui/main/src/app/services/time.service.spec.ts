/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


import {TestBed} from '@angular/core/testing';

import {TimeService} from './time.service';

import * as moment from 'moment';
import {RouterTestingModule} from '@angular/router/testing';
import {StoreModule} from '@ngrx/store';
import {appReducer} from '@ofStore/index';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {AuthenticationImportHelperForSpecs} from '@ofServices/authentication/authentication.service.spec';

describe('TimeService', () => {

    let service: TimeService;
    let httpMock: HttpTestingController;
    beforeAll(()=>{
       moment.tz.setDefault("Europe/Paris");
       moment.locale('fr-FR');
    });
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [TimeService, AuthenticationImportHelperForSpecs],
            imports:[  HttpClientTestingModule,
                        RouterTestingModule,
                        StoreModule.forRoot(appReducer)
                    ],
        });

        httpMock = TestBed.get(HttpTestingController);
        service = TestBed.get(TimeService);
    });

    afterEach(()=>{
        httpMock.verify();
    })
    it('should be created', () => {

        expect(service).toBeTruthy();
    });

    it('should parse', () => {
        expect(service).toBeTruthy();
        expect(service.parseString('2019-05-24T10:25').valueOf()).toEqual(1558686300000);
    });

    it('should format timestamp, date and moment to date time string', () => {
        moment.locale('en');
        expect(service).toBeTruthy();
        expect(service.formatDateTime(1559721634989)).toEqual('06/05/2019 10:00 AM');
        expect(service.formatDateTime(new Date(1559721634989))).toEqual('06/05/2019 10:00 AM');
        expect(service.formatDateTime(moment(new Date(1559721634989)))).toEqual('06/05/2019 10:00 AM');
    });

    it('should format timestamp, date and moment to date string', () => {
        moment.locale('en');
        expect(service).toBeTruthy();
        expect(service.formatDate(1559721634989)).toEqual('06/05/2019');
        expect(service.formatDate(new Date(1559721634989))).toEqual('06/05/2019');
        expect(service.formatDate(moment(new Date(1559721634989)))).toEqual('06/05/2019');
    });

    it('should format timestamp, date and moment to predefined timeline formats', () => {
        moment.locale('en');
        expect(service).toBeTruthy();
        expect(service.predefinedFormat(1559721634989,'dateOnWeek')).toEqual('05/06/19');
        expect(service.predefinedFormat(new Date(1559721634989),'dateOnWeek')).toEqual('05/06/19');
        expect(service.predefinedFormat(moment(new Date(1559721634989)),'dateOnWeek')).toEqual('05/06/19');
        expect(service.predefinedFormat(1559721634989,'realTimeBarFormat')).toEqual('05/06/19 10:00');
        expect(service.predefinedFormat(new Date(1559721634989),'realTimeBarFormat')).toEqual('05/06/19 10:00');
        expect(service.predefinedFormat(moment(new Date(1559721634989)),'realTimeBarFormat')).toEqual('05/06/19 10:00');
    });

    it('should convert date string to timestamp', () => {
        expect(service.toNgBTimestamp('2019-05-24T10:25').valueOf()).toEqual('1558686300000');
    });
});
