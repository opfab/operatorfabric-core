/* Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {XAxis} from './XAxis';
import {TranslationLibMock} from '@tests/mocks/TranslationLib.mock';
import {ConfigService} from 'app/services/config/ConfigService';
import {DateTimeFormatterService} from 'app/services/dateTimeFormatter/DateTimeFormatterService';
import {TranslationService} from '@ofServices/translation/TranslationService';

describe('XAxis', () => {
    let xAxis: XAxis;

    beforeEach(() => {
        xAxis = new XAxis();
        const translationService = new TranslationLibMock();
        TranslationService.setTranslationLib(translationService);
        TranslationService.initLocale();
        DateTimeFormatterService.init();
        ConfigService.setConfigValue('settings.locale', 'en');
    });

    it('should set xTicks correctly for Realtime Mode (RT) , one tick per 15 minutes ', () => {
        const start = new Date(2020, 1, 1, 6, 0);
        const end = new Date(2020, 1, 1, 18, 0);
        xAxis.setupAxis('RT', [start.valueOf(), end.valueOf()]);
        const xTicks = xAxis.getTicks();
        expect(xTicks[0].valueOf()).toEqual(start.valueOf());
        expect(xTicks[1].valueOf()).toEqual(new Date(2020, 1, 1, 6, 15).valueOf());
        expect(xTicks[2].valueOf()).toEqual(new Date(2020, 1, 1, 6, 30).valueOf());
        expect(xTicks[3].valueOf()).toEqual(new Date(2020, 1, 1, 6, 45).valueOf());
        expect(xTicks[4].valueOf()).toEqual(new Date(2020, 1, 1, 7, 0).valueOf());

        expect(xAxis.getTickLabel(xTicks[0])).toEqual('06h');
        expect(xAxis.getTickLabel(xTicks[1])).toEqual('');
        expect(xAxis.getTickLabel(xTicks[2])).toEqual('06h30');
        expect(xAxis.getTickLabel(xTicks[3])).toEqual('');
        expect(xAxis.getDayRectangles().length).toEqual(0);
    });

    it('should set xTicks correctly for Day Mode (J) , one tick per half hour', () => {
        const start = new Date(2020, 1, 1, 0, 0);
        const end = new Date(2020, 1, 2, 0, 0);
        xAxis.setupAxis('J', [start.valueOf(), end.valueOf()]);
        const xTicks = xAxis.getTicks();
        expect(xTicks[0].valueOf()).toEqual(start.valueOf());
        expect(xTicks[1].valueOf()).toEqual(new Date(2020, 1, 1, 0, 30).valueOf());
        expect(xTicks[2].valueOf()).toEqual(new Date(2020, 1, 1, 1, 0).valueOf());
        expect(xTicks[3].valueOf()).toEqual(new Date(2020, 1, 1, 1, 30).valueOf());
        expect(xTicks[4].valueOf()).toEqual(new Date(2020, 1, 1, 2, 0).valueOf());

        expect(xAxis.getTickLabel(xTicks[0])).toEqual('00h');
        expect(xAxis.getTickLabel(xTicks[1])).toEqual('');
        expect(xAxis.getTickLabel(xTicks[2])).toEqual('01h');
        expect(xAxis.getTickLabel(xTicks[3])).toEqual('');
        expect(xAxis.getDayRectangles().length).toEqual(0);
    });

    it('should set xTicks correctly for 7 Day Mode (7D) , one tick per 4 hour', () => {
        const start = new Date(2020, 1, 1, 0, 0);
        const end = new Date(2020, 1, 8, 0, 0);
        xAxis.setupAxis('7D', [start.valueOf(), end.valueOf()]);
        const xTicks = xAxis.getTicks();
        expect(xTicks[0].valueOf()).toEqual(start.valueOf());
        expect(xTicks[1].valueOf()).toEqual(new Date(2020, 1, 1, 4, 0).valueOf());
        expect(xTicks[2].valueOf()).toEqual(new Date(2020, 1, 1, 8, 0).valueOf());
        expect(xTicks[3].valueOf()).toEqual(new Date(2020, 1, 1, 12, 0).valueOf());
        expect(xTicks[4].valueOf()).toEqual(new Date(2020, 1, 1, 16, 0).valueOf());

        expect(xAxis.getTickLabel(xTicks[0])).toEqual('00h');
        expect(xAxis.getTickLabel(xTicks[1])).toEqual('');
        expect(xAxis.getTickLabel(xTicks[2])).toEqual('08h');
        expect(xAxis.getTickLabel(xTicks[3])).toEqual('');
    });

    it('should set xTicks correctly for 7 Day Mode (7D) when DayLight Saving (winter), one tick per 4 hour', () => {
        const start = new Date(2023, 9, 29, 0, 0);
        const end = new Date(2023, 10, 5, 0, 0);
        xAxis.setupAxis('7D', [start.valueOf(), end.valueOf()]);
        const xTicks = xAxis.getTicks();
        expect(xTicks[0].valueOf()).toEqual(start.valueOf());
        expect(xTicks[1].valueOf()).toEqual(new Date(2023, 9, 29, 4, 0).valueOf());
        expect(xTicks[2].valueOf()).toEqual(new Date(2023, 9, 29, 8, 0).valueOf());
        expect(xTicks[3].valueOf()).toEqual(new Date(2023, 9, 29, 12, 0).valueOf());
        expect(xTicks[4].valueOf()).toEqual(new Date(2023, 9, 29, 16, 0).valueOf());

        expect(xAxis.getTickLabel(xTicks[0])).toEqual('00h');
        expect(xAxis.getTickLabel(xTicks[1])).toEqual('');
        expect(xAxis.getTickLabel(xTicks[2])).toEqual('08h');
        expect(xAxis.getTickLabel(xTicks[3])).toEqual('');
    });

    it('should set xTicks correctly for 7 Day Mode (7D) when DayLight Saving (summer), one tick per 4 hour', () => {
        const start = new Date(2024, 2, 31, 0, 0);
        const end = new Date(2024, 3, 7, 0, 0);
        xAxis.setupAxis('7D', [start.valueOf(), end.valueOf()]);
        const xTicks = xAxis.getTicks();
        expect(xTicks[0].valueOf()).toEqual(start.valueOf());
        expect(xTicks[1].valueOf()).toEqual(new Date(2024, 2, 31, 4, 0).valueOf());
        expect(xTicks[2].valueOf()).toEqual(new Date(2024, 2, 31, 8, 0).valueOf());
        expect(xTicks[3].valueOf()).toEqual(new Date(2024, 2, 31, 12, 0).valueOf());
        expect(xTicks[4].valueOf()).toEqual(new Date(2024, 2, 31, 16, 0).valueOf());

        expect(xAxis.getTickLabel(xTicks[0])).toEqual('00h');
        expect(xAxis.getTickLabel(xTicks[1])).toEqual('');
        expect(xAxis.getTickLabel(xTicks[2])).toEqual('08h');
        expect(xAxis.getTickLabel(xTicks[3])).toEqual('');
    });

    it('should set xTicks correctly for Week Day Mode (W) , one tick per 4 hour', () => {
        const start = new Date(2020, 1, 1, 0, 0);
        const end = new Date(2020, 1, 8, 0, 0);
        xAxis.setupAxis('W', [start.valueOf(), end.valueOf()]);
        const xTicks = xAxis.getTicks();
        expect(xTicks[0].valueOf()).toEqual(start.valueOf());
        expect(xTicks[1].valueOf()).toEqual(new Date(2020, 1, 1, 4, 0).valueOf());
        expect(xTicks[2].valueOf()).toEqual(new Date(2020, 1, 1, 8, 0).valueOf());
        expect(xTicks[3].valueOf()).toEqual(new Date(2020, 1, 1, 12, 0).valueOf());
        expect(xTicks[4].valueOf()).toEqual(new Date(2020, 1, 1, 16, 0).valueOf());

        expect(xAxis.getTickLabel(xTicks[0])).toEqual('00h');
        expect(xAxis.getTickLabel(xTicks[1])).toEqual('');
        expect(xAxis.getTickLabel(xTicks[2])).toEqual('08h');
        expect(xAxis.getTickLabel(xTicks[3])).toEqual('');
    });

    it('should set xTicks correctly for Month Mode (M) , one tick per  day', () => {
        const start = new Date(2020, 1, 1, 0, 0);
        const end = new Date(2020, 2, 1, 0, 0);
        xAxis.setupAxis('M', [start.valueOf(), end.valueOf()]);
        const xTicks = xAxis.getTicks();
        expect(xTicks[0].valueOf()).toEqual(start.valueOf());
        expect(xTicks[1].valueOf()).toEqual(new Date(2020, 1, 2, 0, 0).valueOf());
        expect(xTicks[2].valueOf()).toEqual(new Date(2020, 1, 3, 0, 0).valueOf());
        expect(xTicks[3].valueOf()).toEqual(new Date(2020, 1, 4, 0, 0).valueOf());
        expect(xTicks[4].valueOf()).toEqual(new Date(2020, 1, 5, 0, 0).valueOf());

        expect(xAxis.getTickLabel(xTicks[0])).toEqual('SAT 01');
        expect(xAxis.getTickLabel(xTicks[1])).toEqual('');
        expect(xAxis.getTickLabel(xTicks[2])).toEqual('MON 03');
        expect(xAxis.getTickLabel(xTicks[3])).toEqual('');
        expect(xAxis.getDayRectangles().length).toEqual(0);
    });

    it('should set xTicks correctly for Year Mode (Y) , one tick per half month', () => {
        const start = new Date(2020, 0, 1, 0, 0);
        const end = new Date(2021, 0, 1, 0, 0);
        xAxis.setupAxis('Y', [start.valueOf(), end.valueOf()]);
        const xTicks = xAxis.getTicks();
        expect(xTicks[0].valueOf()).toEqual(start.valueOf());
        expect(xTicks[1].valueOf()).toEqual(new Date(2020, 0, 16, 0, 0).valueOf());
        expect(xTicks[2].valueOf()).toEqual(new Date(2020, 1, 1, 0, 0).valueOf());
        expect(xTicks[3].valueOf()).toEqual(new Date(2020, 1, 16, 0, 0).valueOf());
        expect(xTicks[4].valueOf()).toEqual(new Date(2020, 2, 1, 0, 0).valueOf());

        expect(xAxis.getTickLabel(xTicks[0])).toEqual('1 Jan');
        expect(xAxis.getTickLabel(xTicks[1])).toEqual('');
        expect(xAxis.getTickLabel(xTicks[2])).toEqual('1 Feb');
        expect(xAxis.getTickLabel(xTicks[3])).toEqual('');
        expect(xAxis.getDayRectangles().length).toEqual(0);
    });

    it('should set day rectangles correctly for 7 Day Mode (7D) ', () => {
        const start = new Date(2020, 1, 1, 0, 0);
        const end = new Date(2020, 1, 8, 0, 0);
        xAxis.setupAxis('7D', [start.valueOf(), end.valueOf()]);

        expect(xAxis.getDayRectangles().length).toEqual(7);
        expect(xAxis.getDayRectangles()[0].dateToDisplay).toEqual('Sat 01 Feb');
        expect(xAxis.getDayRectangles()[0].changeBgColor).toEqual(true);
        expect(xAxis.getDayRectangles()[0].start.valueOf()).toEqual(new Date(2020, 1, 1, 0, 0).valueOf());
        expect(xAxis.getDayRectangles()[0].end.valueOf()).toEqual(new Date(2020, 1, 1, 23, 59).valueOf());
        expect(xAxis.getDayRectangles()[1].dateToDisplay).toEqual('Sun 02 Feb');
        expect(xAxis.getDayRectangles()[1].changeBgColor).toEqual(false);
        expect(xAxis.getDayRectangles()[1].start.valueOf()).toEqual(new Date(2020, 1, 2, 0, 0).valueOf());
        expect(xAxis.getDayRectangles()[1].end.valueOf()).toEqual(new Date(2020, 1, 2, 23, 59).valueOf());
        expect(xAxis.getDayRectangles()[6].dateToDisplay).toEqual('Fri 07 Feb');
        expect(xAxis.getDayRectangles()[6].start.valueOf()).toEqual(new Date(2020, 1, 7, 0, 0).valueOf());
        expect(xAxis.getDayRectangles()[6].end.valueOf()).toEqual(new Date(2020, 1, 7, 23, 59).valueOf());
    });

    it('should set day rectangles correctly for W Mode (W) ', () => {
        const start = new Date(2020, 1, 1, 0, 0);
        const end = new Date(2020, 1, 8, 0, 0);
        xAxis.setupAxis('W', [start.valueOf(), end.valueOf()]);

        expect(xAxis.getDayRectangles().length).toEqual(7);
        expect(xAxis.getDayRectangles()[0].start.valueOf()).toEqual(new Date(2020, 1, 1, 0, 0).valueOf());
        expect(xAxis.getDayRectangles()[0].end.valueOf()).toEqual(new Date(2020, 1, 1, 23, 59).valueOf());
        expect(xAxis.getDayRectangles()[1].start.valueOf()).toEqual(new Date(2020, 1, 2, 0, 0).valueOf());
        expect(xAxis.getDayRectangles()[1].end.valueOf()).toEqual(new Date(2020, 1, 2, 23, 59).valueOf());
    });

    it('should set first day rectangle with no label if too small  ', () => {
        const start = new Date(2020, 1, 1, 22, 0);
        const end = new Date(2020, 1, 8, 0, 0);
        xAxis.setupAxis('7D', [start.valueOf(), end.valueOf()]);

        expect(xAxis.getDayRectangles().length).toEqual(7);
        expect(xAxis.getDayRectangles()[0].dateToDisplay).toEqual('');
        expect(xAxis.getDayRectangles()[0].start.valueOf()).toEqual(new Date(2020, 1, 1, 22, 0).valueOf());
        expect(xAxis.getDayRectangles()[0].end.valueOf()).toEqual(new Date(2020, 1, 1, 23, 59).valueOf());
        expect(xAxis.getDayRectangles()[1].dateToDisplay).toEqual('Sun 02 Feb');
    });

    it('should set last day rectangle with no label if too small  ', () => {
        const start = new Date(2020, 1, 1, 0, 0);
        const end = new Date(2020, 1, 7, 4, 0);
        xAxis.setupAxis('W', [start.valueOf(), end.valueOf()]);

        expect(xAxis.getDayRectangles().length).toEqual(7);
        expect(xAxis.getDayRectangles()[6].dateToDisplay).toEqual('');
        expect(xAxis.getDayRectangles()[6].start.valueOf()).toEqual(new Date(2020, 1, 7, 0, 0).valueOf());
        expect(xAxis.getDayRectangles()[6].end.valueOf()).toEqual(new Date(2020, 1, 7, 4, 0).valueOf());
    });
});
