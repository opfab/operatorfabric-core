/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Circles} from './circles';
import {XAxis} from './xaxis';
import {getOneCard} from '@tests/helpers';
import {Frequency} from '@ofModel/light-card.model';
import {TimeSpan} from '@ofModel/card.model';
import {add, startOfYear, sub} from 'date-fns';

describe('Timeline Circles', () => {
    const startDate = startOfYear(new Date());
    const endDate = add(startOfYear(new Date()), {years: 1});
    const circles = new Circles();

    const RED = '#A71A1A';
    const ORANGE = '#FD9313';
    const GREEN = '#00BB03';
    const BLUE = '#1074AD';

    beforeEach(() => {
        const gridTimeDomain = [startDate.valueOf(), endDate.valueOf()];
        const cardsTimeDomain = {startDate: startDate.valueOf(), endDate: endDate.valueOf()};
        const domainId = 'Y';
        const xAxis = new XAxis();
        xAxis.setupAxis(domainId, gridTimeDomain);
        circles.setDomain(cardsTimeDomain, gridTimeDomain, xAxis.getTicks());
    });

    it('set no circle if no card ', () => {
        circles.setCardsToDrawOnTimeLine([]);
        expect(circles.circles.length).toEqual(0);
    });

    it('set one circle with count=1 if one card ', () => {
        const card = getOneCard({
            startDate: add(startDate, {days: 5, hours: 1}).valueOf(),
            severity: 'ACTION'
        });

        circles.setCardsToDrawOnTimeLine([card]);
        expect(circles.circles.length).toEqual(1);
        expect(circles.circles[0].count).toEqual(1);
        expect(circles.circles[0].circleYPosition).toEqual(3);
        expect(circles.circles[0].color).toEqual(ORANGE);
    });

    it('set one circle with severity information if  one card with unknown severity ', () => {
        const card = getOneCard({
            startDate: add(startDate, {days: 5, hours: 1}).valueOf(),
            severity: 'DUMMY'
        });

        circles.setCardsToDrawOnTimeLine([card]);
        expect(circles.circles.length).toEqual(1);
        expect(circles.circles[0].count).toEqual(1);
        expect(circles.circles[0].circleYPosition).toEqual(1);
        expect(circles.circles[0].color).toEqual(BLUE);
    });

    it('set no circle if one card is after time domain ', () => {
        const card = getOneCard({
            startDate: add(endDate, {hours: 1}).valueOf(),
            severity: 'ALARM'
        });

        circles.setCardsToDrawOnTimeLine([card]);
        expect(circles.circles.length).toEqual(0);
    });

    it('set no circle if one card is before time domain ', () => {
        const card = getOneCard({
            startDate: sub(startOfYear(new Date()), {months: 1}).valueOf(),
            severity: 'ALARM'
        });

        circles.setCardsToDrawOnTimeLine([card]);
        expect(circles.circles.length).toEqual(0);
    });

    it('set one circle with count=2 if two card in the same interval and same severity ', () => {
        const card1 = getOneCard({
            startDate: add(startDate, {days: 2, hours: 1}).valueOf(),
            severity: 'ALARM'
        });

        const card2 = getOneCard({
            startDate: add(startDate, {days: 4, hours: 2}).valueOf(),
            severity: 'ALARM'
        });

        circles.setCardsToDrawOnTimeLine([card1, card2]);
        expect(circles.circles.length).toEqual(1);
        expect(circles.circles[0].count).toEqual(2);
    });

    it('set two circles with count=1 if two card are not in the same interval but same severity ', () => {
        const card1 = getOneCard({
            startDate: add(startDate, {days: 2, hours: 1}).valueOf(),
            severity: 'COMPLIANT'
        });
        const card2 = getOneCard({
            startDate: add(startDate, {months: 2, hours: 1}).valueOf(),
            severity: 'COMPLIANT'
        });

        circles.setCardsToDrawOnTimeLine([card1, card2]);
        expect(circles.circles.length).toEqual(2);
        expect(circles.circles[0].count).toEqual(1);
        expect(circles.circles[0].circleYPosition).toEqual(2);
        expect(circles.circles[0].color).toEqual(GREEN);
        expect(circles.circles[1].count).toEqual(1);
        expect(circles.circles[1].circleYPosition).toEqual(2);
        expect(circles.circles[1].color).toEqual(GREEN);
    });

    it('set two circles with count=1 if two cards are in the same interval but not same severity ', () => {
        const card1 = getOneCard({
            startDate: add(startDate, {days: 2, hours: 1}).valueOf(),
            severity: 'ALARM'
        });
        const card2 = getOneCard({
            startDate: add(startDate, {days: 2, hours: 1}).valueOf(),
            severity: 'INFORMATION'
        });
        circles.setCardsToDrawOnTimeLine([card1, card2]);

        expect(circles.circles.length).toEqual(2);
        expect(circles.circles[0].count).toEqual(1);
        expect(circles.circles[0].circleYPosition).toEqual(1);
        expect(circles.circles[0].color).toEqual(BLUE);
        expect(circles.circles[1].count).toEqual(1);
        expect(circles.circles[1].circleYPosition).toEqual(4);
        expect(circles.circles[1].color).toEqual(RED);
    });

    it('set two circles with one count=1 and one count= 2 if three cards of same severity  and 2 in the same interval ', () => {
        const card1 = getOneCard({
            startDate: add(startDate, {days: 2, hours: 1}).valueOf(),
            severity: 'ALARM'
        });
        const card2 = getOneCard({
            startDate: add(startDate, {days: 4, hours: 1}).valueOf(),
            severity: 'ALARM'
        });

        const card3 = getOneCard({
            startDate: add(startDate, {months: 6, hours: 1}).valueOf(),
            severity: 'ALARM'
        });

        circles.setCardsToDrawOnTimeLine([card1, card2, card3]);

        expect(circles.circles.length).toEqual(2);
        expect(circles.circles[0].count).toEqual(2);
        expect(circles.circles[1].count).toEqual(1);
    });

    it('set three cards in the same interval and same severity , there should be one circle with 3 summary  ', () => {
        const card1 = getOneCard({
            id: 'card1',
            startDate: add(startDate, {days: 5, hours: 1}).valueOf(),
            severity: 'ALARM',
            titleTranslated: 'title1'
        });

        const card2 = getOneCard({
            id: 'card2',
            startDate: add(startDate, {days: 6, hours: 3}).valueOf(),
            severity: 'ALARM',
            titleTranslated: 'title2'
        });

        const card3 = getOneCard({
            id: 'card3',
            startDate: add(startDate, {days: 8, hours: 8}).valueOf(),
            severity: 'ALARM',
            titleTranslated: 'title3'
        });
        circles.setCardsToDrawOnTimeLine([card1, card2, card3]);

        expect(circles.circles.length).toEqual(1);
        expect(circles.circles[0].summary.length).toEqual(3);
        expect(circles.circles[0].summary[0].titleTranslated).toEqual('title1');
        expect(circles.circles[0].summary[0].cardId).toEqual('card1');
        expect(circles.circles[0].summary[1].titleTranslated).toEqual('title2');
        expect(circles.circles[0].summary[1].cardId).toEqual('card2');
        expect(circles.circles[0].summary[2].titleTranslated).toEqual('title3');
        expect(circles.circles[0].summary[2].cardId).toEqual('card3');
    });

    it('1 rRule recurrence per month shall generate 12 circles on timeline in year mode', () => {
        const card1 = getOneCard({
            id: 'card1',
            startDate: startDate.valueOf(),
            endDate: endDate.valueOf(),
            severity: 'ALARM',
            titleTranslated: 'title1',
            secondsBeforeTimeSpanForReminder: 5,
            rRule: {
                freq: Frequency.MONTHLY,
                byhour: [10],
                byminute: [0],
                bymonthday: [1]
            }
        });

        circles.setCardsToDrawOnTimeLine([card1]);

        expect(circles.circles.length).toEqual(12);
    });

    it('set two circle with if one card with two timespans', () => {
        const card = getOneCard({
            startDate: startDate.valueOf(),
            severity: 'ALARM',
            timeSpans: [
                new TimeSpan(startDate.valueOf(), endDate.valueOf()),
                new TimeSpan(add(startDate, {months: 2}).valueOf(), endDate.valueOf())
            ]
        });

        circles.setCardsToDrawOnTimeLine([card]);
        expect(circles.circles.length).toEqual(2);
        expect(circles.circles[0].count).toEqual(1);
        expect(circles.circles[0].circleYPosition).toEqual(4);
    });
});
