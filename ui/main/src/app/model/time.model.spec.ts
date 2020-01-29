/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {neutralTimeReference, TimeReference, TimeSpeed} from "@ofModel/time.model";
import {getRandomAlphanumericValue} from "@tests/helpers";
import * as moment from "moment";

describe('Time reference', () => {


    beforeAll(() => {
        moment.tz.setDefault("Europe/Paris");
        moment.locale('fr-FR');
    });


    it('should convert a key named speed with the value X1 into TimeSpeed.X1', () => {
            const input = 'X1';
            expect(TimeReference.convertSpeedIntoEnum('speed', input)).toBe(TimeSpeed.X1);
        }
    );

    it('should  leave a key named differently than speed with the value X1 as a string with the value X1',
        () => {
            let testedKey = null;
            while (testedKey === 'speed' || testedKey === null) {
                testedKey = getRandomAlphanumericValue(3, 12);
            }
            const value = 'X1'
            expect(TimeReference.convertSpeedIntoEnum(testedKey, value)).toBe(value);
        });

    it('should return the time given as argument for neutral time Reference', () => {
        const momentAtRequestMoment = moment('2019-06-12T17:08:25+02:00');

        const tested = neutralTimeReference;

        const result = tested.computeNow(momentAtRequestMoment);
        expect(result).toEqual(momentAtRequestMoment);

    });

    it('should at normal speed, with a reference time but no virtual time return time given as argument',
        () => {
            const referenceTime = moment('2001-01-01T12:00:00+02:00');
            const momentAtRequestMoment = moment('2019-06-12T17:08:25+02:00');
            const tested = new TimeReference(referenceTime.valueOf(), null, null, TimeSpeed.X1);
            const result = tested.computeNow(momentAtRequestMoment);
            expect(result).toEqual(momentAtRequestMoment);
        });

    it('should at a speed different that X1, with a reference time give an correct added time',
        () => {
            const referenceTime = moment('2019-06-12T17:08:20+02:00');
            const momentAtRequestMoment = moment('2019-06-12T17:08:25+02:00');
            const tested = new TimeReference(referenceTime.valueOf(), null, null, TimeSpeed.X10);
            const result = tested.computeNow(momentAtRequestMoment);
            const expectedMoment = moment('2019-06-12T17:09:10+02:00');
            expect(result.valueOf()).toEqual(expectedMoment.valueOf());
        });

    it('should compute a time in the future of the virtual time if current time is ahead from reference time ' +
        'for TimeSpeed.X1', () => {
        const referenceTime = moment('2019-06-12T17:08:20+02:00');
        const virtualTime = moment('2018-01-01T12:00:00+02:00');
        const momentAtRequestMoment = moment('2019-06-12T17:08:25+02:00');
        const tested = new TimeReference(referenceTime.valueOf(), virtualTime.valueOf(), null, TimeSpeed.X1);
        const result = tested.computeNow(momentAtRequestMoment);
        const expectedMoment = moment('2018-01-01T12:00:05+02:00');
        expect(result.valueOf()).toEqual(expectedMoment.valueOf());

    });

    it('should give what ever the instance the some result for a moment or the timestamp', () => {
        const testedMoment = moment('2019-06-12T17:08:20+02:00');
        const testedTimeStamp = testedMoment.valueOf();

        function compare(ref: TimeReference, mom: moment.Moment, timeStamp: number) {
            return ref.computeNow(mom).valueOf() === ref.computeNow(timeStamp).valueOf();
        }

        expect(compare(neutralTimeReference, testedMoment, testedTimeStamp)).toEqual(true);
        const anotherTimeRef = new TimeReference(1560352150000, 1560352155000, null, TimeSpeed.X3600);
        expect(compare(anotherTimeRef, testedMoment, testedTimeStamp)).toEqual(true);


    })

})
