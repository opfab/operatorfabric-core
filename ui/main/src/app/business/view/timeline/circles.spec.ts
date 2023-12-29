/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import moment from 'moment';
import {Circles} from './circles';
import {XAxis} from './xaxis';
import {getOneCard} from '@tests/helpers';
import {Frequency} from '@ofModel/light-card.model';
import {Recurrence, TimeSpan} from '@ofModel/card.model';



describe('Timeline Circles', () => {
    const startDate = moment().startOf('year');
    const endDate = moment().startOf('year').add(1, 'year');
    const circles = new Circles();

    const RED= '#A71A1A';
    const ORANGE = '#FD9313';
    const GREEN ='#00BB03';
    const BLUE = '#1074AD';

    beforeEach(() => {
        const gridTimeDomain = [moment(startDate).valueOf(), moment(endDate).valueOf()];
        const cardsTimeDomain = {startDate:moment(startDate).valueOf(), endDate: moment(endDate).valueOf()};
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
            startDate: moment(startDate).add(5, 'days').add(1, 'hours').valueOf(),
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
            startDate: moment(startDate).add(5, 'days').add(1, 'hours').valueOf(),
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
            startDate: moment(endDate).add(1, 'hours').valueOf(),
            severity: 'ALARM'
        });

        circles.setCardsToDrawOnTimeLine([card]);
        expect(circles.circles.length).toEqual(0);
    });

    it('set no circle if one card is before time domain ', () => {
        const card = getOneCard({
            startDate: moment().startOf('year').subtract(1, 'month').valueOf(),
            severity: 'ALARM'
        });

        circles.setCardsToDrawOnTimeLine([card]);
        expect(circles.circles.length).toEqual(0);
    });

    it('set one circle with count=2 if two card in the same interval and same severity ', () => {
        const card1 = getOneCard({
            startDate: moment(startDate).add(2, 'day').add(1, 'hour').valueOf(),
            severity: 'ALARM'
        });

        const card2 = getOneCard({
            startDate: moment(startDate).add(4, 'day').add(2, 'hour').valueOf(),
            severity: 'ALARM'
        });

        circles.setCardsToDrawOnTimeLine([card1, card2]);
        expect(circles.circles.length).toEqual(1);
        expect(circles.circles[0].count).toEqual(2);
    });

    it('set two circles with count=1 if two card are not in the same interval but same severity ', () => {
        const card1 = getOneCard({
            startDate: moment(startDate).add(2, 'day').add(1, 'hour').valueOf(),
            severity: 'COMPLIANT'
        });
        const card2 = getOneCard({
            startDate: moment(startDate).add(2, 'month').add(1, 'hour').valueOf(),
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
            startDate: moment(startDate).add(2, 'day').add(1, 'hour').valueOf(),
            severity: 'ALARM'
        });
        const card2 = getOneCard({
            startDate: moment(startDate).add(2, 'day').add(1, 'hour').valueOf(),
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
            startDate: moment(startDate).add(2, 'day').add(1, 'hour').valueOf(),
            severity: 'ALARM'
        });
        const card2 = getOneCard({
            startDate: moment(startDate).add(4, 'day').add(1, 'hour').valueOf(),
            severity: 'ALARM'
        });

        const card3 = getOneCard({
            startDate: moment(startDate).add(6, 'month').add(1, 'hour').valueOf(),
            severity: 'ALARM'
        });

        circles.setCardsToDrawOnTimeLine([card1, card2, card3]);

        expect(circles.circles.length).toEqual(2);
        expect(circles.circles[0].count).toEqual(2);
        expect(circles.circles[1].count).toEqual(1);
    });


    it('set three cards in the same interval and same severity , there shoud be one circle with 3 summary  ', () => {

        const card1 = getOneCard({
            id : 'card1',
            startDate: moment(startDate).add(5, 'day').add(1, 'hour').valueOf(),
            severity: 'ALARM',
            titleTranslated: 'title1'
        });

        const card2 = getOneCard({
            id : 'card2',
            startDate: moment(startDate).add(6, 'day').add(3, 'hour').valueOf(),
            severity: 'ALARM',
            titleTranslated: 'title2'
        });

        const card3 = getOneCard({
            id : 'card3',
            startDate: moment(startDate).add(8, 'day').add(8, 'hour').valueOf(),
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

    it("1 rRule recurrence per month shall generate 12 circles on timeline in year mode", () => {
        const card1 = getOneCard({
            id : 'card1',
            startDate: moment(startDate).valueOf(),
            endDate: moment(endDate).valueOf(),
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

    it(" recurrence per month for 5 months  shall generate 10 circles on timeline in year mode (1 per half month)", () => {


        const recurrence = new Recurrence(null);
        recurrence.timeZone = 'Europe/Paris';;
        recurrence.hoursAndMinutes = {hours: 16, minutes: 30};
        recurrence.months = [1,2,3,4,5];
        recurrence.durationInMinutes = 60;

        const card1 = getOneCard({
            id : 'card1',
            startDate: moment(startDate).valueOf(),
            endDate: moment(endDate).valueOf(),
            severity: 'ALARM',
            titleTranslated: 'title1',
            secondsBeforeTimeSpanForReminder: 5,
            timeSpans: [new TimeSpan(startDate.valueOf(), endDate.valueOf(), recurrence)]
        });

        circles.setCardsToDrawOnTimeLine([card1]);
        expect(circles.circles.length).toEqual(10);
    });


    it('set two circle with if one card with two timespans', () => {
        const card = getOneCard({
            startDate: moment(startDate).valueOf(),
            severity: 'ALARM',
            timeSpans: [new TimeSpan(startDate.valueOf(), endDate.valueOf(), null),
                new TimeSpan(moment(startDate).add('2','month').valueOf(), endDate.valueOf(), null)]
        });

        circles.setCardsToDrawOnTimeLine([card]);
        expect(circles.circles.length).toEqual(2);
        expect(circles.circles[0].count).toEqual(1);
        expect(circles.circles[0].circleYPosition).toEqual(4);
    });
});
