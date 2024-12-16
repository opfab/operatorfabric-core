/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {waitForAsync} from '@angular/core/testing';

import {ConfigServerMock} from '@tests/mocks/configServer.mock';
import {ConfigService} from 'app/services/config/ConfigService';
import {DateTimeFormatterService} from 'app/services/dateTimeFormatter/DateTimeFormatterService';

describe('DateTimeFormatterService', () => {
    beforeEach(waitForAsync(() => {
        ConfigService.setConfigServer(new ConfigServerMock());
        DateTimeFormatterService.init();
    }));

    it('should handle non existent timestamp with an empty string', () => {
        ConfigService.setConfigValue('settings.locale', 'en');
        const expectedEmptyString = DateTimeFormatterService.getFormattedDateAndTime(undefined);
        expect(expectedEmptyString).toEqual('');
    });

    it('should handle timestamp in English', () => {
        ConfigService.setConfigValue('settings.locale', 'en');
        const date = new Date(2019, 5, 25, 10, 0, 0, 0);
        const TwentyFiveJune2019at10AMDateString = DateTimeFormatterService.getFormattedDateAndTime(date.valueOf());
        expect(TwentyFiveJune2019at10AMDateString).toEqual('06/25/2019 10:00 AM');
    });

    it('should handle timestamp in French', () => {
        ConfigService.setConfigValue('settings.locale', 'fr');
        const date = new Date(2019, 5, 25, 10, 0, 0, 0);
        const TwentyFiveJune2019at10AMDateString = DateTimeFormatterService.getFormattedDateAndTime(date.valueOf());
        expect(TwentyFiveJune2019at10AMDateString).toEqual('25/06/2019 10:00');
    });
});
