/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {TestBed} from '@angular/core/testing';

import {TimeService} from './time.service';

import * as moment from 'moment';

describe('TimeService', () => {

    let service: TimeService;
    beforeAll(()=>{
       moment.tz.setDefault("Europe/Paris");
       moment.locale('fr-FR');
    });
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                TimeService
            ]
        });
        service = TestBed.get(TimeService);
    });

    it('should be created', () => {

        expect(service).toBeTruthy();
    });

    it('should return now', () => {
        expect(service).toBeTruthy();
        expect(service.currentTime().valueOf() / 100).toBeCloseTo(moment().valueOf() / 100, 1);
    });

    it('should parse', () => {
        expect(service).toBeTruthy();
        expect(service.parseString('2019-05-24T10:25').valueOf()).toEqual(1558686300000);
    });
    it('should format html input value string', () => {
        expect(service).toBeTruthy();
        expect(service.asInputString(1558686353000)).toEqual('2019-05-24T10:25:53.000');
    });
});
