/* Copyright (c) 2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {NearestDomainId} from './NearestDomainId';

describe('NearestDomainId', () => {
    let nearestDomainId: NearestDomainId;
    const startDate: number = new Date().getTime();
    const twelveHoursInMillis = 1000 * 60 * 60 * 12;
    const threeMonthsInMillis = 1000 * 60 * 60 * 24 * 30 * 3;
    const oneAndHalfDaysInMillis = 1000 * 60 * 60 * 24 * 1.5;

    beforeEach(() => {
        nearestDomainId = new NearestDomainId();
    });

    it('should return the domain if there is only one domain', () => {
        nearestDomainId.setDomainList(['Y']);
        const endDate = startDate + twelveHoursInMillis - 1;
        expect(nearestDomainId.getNearestDomainId(startDate, endDate)).toEqual('Y');
    });

    it('should return RT if period is less than 12 hours and RT exists', () => {
        nearestDomainId.setDomainList(['D', 'RT']);
        const endDate = startDate + twelveHoursInMillis - 1;
        expect(nearestDomainId.getNearestDomainId(startDate, endDate)).toEqual('RT');
    });

    it('should return D if period is less than 12 hours and RT does not exist', () => {
        nearestDomainId.setDomainList(['D']);
        const endDate = startDate + twelveHoursInMillis - 1;
        expect(nearestDomainId.getNearestDomainId(startDate, endDate)).toEqual('D');
    });

    it('should return 7D if period is less than 12 hours and RT, J do not exist but 7D exists', () => {
        nearestDomainId.setDomainList(['7D', 'M', 'Y']);
        const endDate = startDate + twelveHoursInMillis - 1;
        expect(nearestDomainId.getNearestDomainId(startDate, endDate)).toEqual('7D');
    });

    it('should return W if period is less than 12 hours and RT, J, 7D do not exist but W exists', () => {
        nearestDomainId.setDomainList(['W', 'M', 'Y']);
        const endDate = startDate + twelveHoursInMillis - 1;
        expect(nearestDomainId.getNearestDomainId(startDate, endDate)).toEqual('W');
    });

    it('should return D if period is greater than 12 hours', () => {
        nearestDomainId.setDomainList(['D', 'RT']);
        const endDate = startDate + twelveHoursInMillis + 1;
        expect(nearestDomainId.getNearestDomainId(startDate, endDate)).toEqual('D');
    });

    it('should return Y if period is greater than 3 months and Y domain exists', () => {
        nearestDomainId.setDomainList(['M', 'Y']);
        const endDate = startDate + threeMonthsInMillis + 1;
        expect(nearestDomainId.getNearestDomainId(startDate, endDate)).toEqual('Y');
    });

    it('should return M if period is greater than 3 months and Y domain does not exist', () => {
        nearestDomainId.setDomainList(['RT', 'M']);
        const endDate = startDate + threeMonthsInMillis + 1;
        expect(nearestDomainId.getNearestDomainId(startDate, endDate)).toEqual('M');
    });

    it('should return 7D if period is greater than 1.5 days and 7D exists', () => {
        nearestDomainId.setDomainList(['RT', 'D', '7D', 'W']);
        const endDate = startDate + oneAndHalfDaysInMillis + 1;
        expect(nearestDomainId.getNearestDomainId(startDate, endDate)).toEqual('7D');
    });
});
