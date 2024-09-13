/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {waitForAsync} from '@angular/core/testing';

import {I18nService} from 'app/business/services/translation/i18n.service';
import {ConfigServerMock} from '@tests/mocks/configServer.mock';
import {TranslationServiceMock} from '@tests/mocks/translation.service.mock';
import {ConfigService} from 'app/business/services/config.service';
import {DateTimeFormatterService} from 'app/business/services/date-time-formatter.service';

describe('DateTimeFormatterService', () => {
    beforeEach(waitForAsync(() => {
        ConfigService.setConfigServer(new ConfigServerMock());
        I18nService.setTranslationService(new TranslationServiceMock());
        DateTimeFormatterService.init();
    }));

    it('should handle non existent timestamp with an empty string', () => {
        I18nService.changeLocale('en');
        const expectedEmptyString = DateTimeFormatterService.getFormattedDateAndTimeFromEpochDate(undefined);
        expect(expectedEmptyString).toEqual('');
    });

    it('should handle timestamp in English', () => {
        I18nService.changeLocale('en');
        const date = new Date(2019, 5, 25, 10, 0, 0, 0);
        const TwentyFiveJune2019at10AMDateString = DateTimeFormatterService.getFormattedDateAndTimeFromEpochDate(
            date.valueOf()
        );
        expect(TwentyFiveJune2019at10AMDateString).toEqual('06/25/2019 10:00 AM');
    });

    it('should handle timestamp in French', () => {
        I18nService.changeLocale('fr');
        const date = new Date(2019, 5, 25, 10, 0, 0, 0);
        const TwentyFiveJune2019at10AMDateString = DateTimeFormatterService.getFormattedDateAndTimeFromEpochDate(
            date.valueOf()
        );
        expect(TwentyFiveJune2019at10AMDateString).toEqual('25/06/2019 10:00');
    });
});
