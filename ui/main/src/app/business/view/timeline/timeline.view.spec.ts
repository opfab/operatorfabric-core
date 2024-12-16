/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {TranslationServiceMock} from '@tests/mocks/translation.service.mock';
import {TimelineView} from './timeline.view';
import {I18nService} from 'app/business/services/translation/i18n.service';
import {DateTimeFormatterService} from 'app/services/dateTimeFormatter/DateTimeFormatterService';
import {ConfigService} from 'app/services/config/ConfigService';

describe('TimeLine view title', () => {
    let timeLineView: TimelineView;

    beforeEach(() => {
        timeLineView = new TimelineView();
        const translationService = new TranslationServiceMock();
        I18nService.setTranslationService(translationService);
        I18nService.initLocale();
        DateTimeFormatterService.init();
        ConfigService.setConfigValue('settings.locale', 'en');
    });

    afterEach(() => {
        timeLineView.destroy();
    });

    it('in RT mode title is the day of the period', () => {
        const xDomain = {
            startDate: new Date(2023, 1, 1, 8, 0).valueOf(),
            endDate: new Date(2023, 1, 1, 20, 0).valueOf(),
            overlap: 0
        };
        timeLineView.setDomain('RT', xDomain);
        expect(timeLineView.getTitle()).toEqual('01 February 2023');
    });

    it('in J mode title is the day of the period ', () => {
        const xDomain = {
            startDate: new Date(2023, 1, 1, 0, 0).valueOf(),
            endDate: new Date(2023, 1, 2, 0, 0).valueOf(),
            overlap: 0
        };
        timeLineView.setDomain('J', xDomain);
        expect(timeLineView.getTitle()).toEqual('01 February 2023');
    });

    it('in 7D mode title is the dates of the period ', () => {
        const xDomain = {
            startDate: new Date(2023, 1, 1, 0, 0).valueOf(),
            endDate: new Date(2023, 1, 8, 0, 0).valueOf(),
            overlap: 0
        };
        timeLineView.setDomain('7D', xDomain);
        expect(timeLineView.getTitle()).toEqual('01/02/2023 - 08/02/2023');
    });

    it('in W mode title is the dates of the period ', () => {
        const xDomain = {
            startDate: new Date(2023, 1, 1, 0, 0).valueOf(),
            endDate: new Date(2023, 1, 8, 0, 0).valueOf(),
            overlap: 0
        };
        timeLineView.setDomain('W', xDomain);
        expect(timeLineView.getTitle()).toEqual('01/02/2023 - 08/02/2023');
    });

    it('in M (month) mode should set title to the month value', () => {
        const xDomain = {
            startDate: new Date(2023, 1, 1, 0, 0).valueOf(),
            endDate: new Date(2023, 1, 28, 0, 0).valueOf(),
            overlap: 0
        };
        timeLineView.setDomain('M', xDomain);
        expect(timeLineView.getTitle()).toEqual('FEBRUARY 2023');
    });

    it('in Y (year) mode should set title to the year value', () => {
        const xDomain = {
            startDate: new Date(2023, 0, 1, 0, 0).valueOf(),
            endDate: new Date(2024, 0, 1, 0, 0).valueOf(),
            overlap: 0
        };
        timeLineView.setDomain('Y', xDomain);
        expect(timeLineView.getTitle()).toEqual('2023');
    });
});
