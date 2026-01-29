/* Copyright (c) 2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {DateRangePicker} from './DateRangePicker';

describe('DateRangePicker', () => {
    describe('convertNgxDateRangePickerDateToEpochDate', () => {
        it('should return null when ngxDate is null', () => {
            const result = DateRangePicker.convertNgxDateRangePickerDateToEpochDate(null);
            expect(result).toBeNull();
        });

        it('should return null when ngxDate is undefined', () => {
            const result = DateRangePicker.convertNgxDateRangePickerDateToEpochDate(undefined);
            expect(result).toBeNull();
        });

        it('should handle standard JS Date object (without isUTC method)', () => {
            const jsDate = new Date('2026-01-15T10:30:00');
            const result = DateRangePicker.convertNgxDateRangePickerDateToEpochDate(jsDate);
            const expected = Date.parse(jsDate.toString());
            expect(result).toBe(expected);
        });

        it('should convert ngx date object correctly', () => {
            // Mock ngx-daterangepicker-material date object
            const ngxDate = {
                isUTC: () => true,
                toISOString: () => '2026-01-15T10:30:00.000Z'
            };

            const result = DateRangePicker.convertNgxDateRangePickerDateToEpochDate(ngxDate);

            // Expected: 2026-01-15 10:30 in local timezone
            const expected = new Date(2026, 0, 15, 10, 30).valueOf();
            expect(result).toBe(expected);
        });
    });
});
