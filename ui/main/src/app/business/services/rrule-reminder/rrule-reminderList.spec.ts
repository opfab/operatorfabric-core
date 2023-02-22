/* Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {Card, TimeSpan} from '@ofModel/card.model';
import {RRuleReminderList as RRuleReminderList} from './rrule-reminderList';
import {getOneRandomCard} from '@tests/helpers';
import {Frequency} from '@ofModel/light-card.model';

const SIXTEEN_MINUTES = 60000 * 16;

describe('RRuleReminderList', () => {
    let rRuleRemindList: RRuleReminderList = new RRuleReminderList('testUser');

    beforeEach(() => {
        localStorage.clear();
        rRuleRemindList = new RRuleReminderList('testUser');
    });

    it('should create and delete a reminder', () => {
        const testCard: Card = getOneRandomCard();
        testCard.rRule = {
            freq: Frequency.DAILY,
            byhour: [10],
            byminute: [0]
        };

        testCard.secondsBeforeTimeSpanForReminder = 10;
        rRuleRemindList.addAReminder(testCard);
        expect(rRuleRemindList.hasAReminder(testCard.id)).toBeTruthy();
        rRuleRemindList.removeAReminder(testCard.id);
        expect(rRuleRemindList.hasAReminder(testCard.id)).toBeFalsy();
    });

    it('should not create a reminder if no timespan ', () => {
        const testCard: Card = getOneRandomCard();
        testCard.secondsBeforeTimeSpanForReminder = 10;
        rRuleRemindList.addAReminder(testCard);
        expect(rRuleRemindList.hasAReminder(testCard.id)).toBeFalsy();
    });

    it('should not create a reminder if no secondsBeforeTimeSpanForReminder value ', () => {
        const testCard: Card = getOneRandomCard();
        testCard.rRule = {
            freq: Frequency.DAILY,
            byhour: [10],
            byminute: [0]
        };
        rRuleRemindList.addAReminder(testCard);
        expect(rRuleRemindList.hasAReminder(testCard.id)).toBeFalsy();
    });

    it('should not create a reminder if secondsBeforeTimeSpanForReminder is null  ', () => {
        const testCard: Card = getOneRandomCard();
        testCard.rRule = {
            freq: Frequency.DAILY,
            byhour: [10],
            byminute: [0]
        };
        testCard.secondsBeforeTimeSpanForReminder = null;
        rRuleRemindList.addAReminder(testCard);
        expect(rRuleRemindList.hasAReminder(testCard.id)).toBeFalsy();
    });

    it('should not create a reminder if  timespan current date > startDate + 15 min', () => {
        const testCard: Card = getOneRandomCard();
        testCard.timeSpans = [new TimeSpan(new Date().valueOf() - SIXTEEN_MINUTES)];
        testCard.secondsBeforeTimeSpanForReminder = 10;
        rRuleRemindList.addAReminder(testCard);
        expect(rRuleRemindList.hasAReminder(testCard.id)).toBeFalsy();
    });

    it('should create and delete two reminder', () => {
        const testCard1: Card = getOneRandomCard();
        const testCard2: Card = getOneRandomCard();
        testCard1.rRule = {
            freq: Frequency.DAILY,
            byhour: [10],
            byminute: [0]
        };
        testCard2.rRule = {
            freq: Frequency.DAILY,
            byhour: [10],
            byminute: [0]
        };
        testCard1.secondsBeforeTimeSpanForReminder = 10;
        rRuleRemindList.addAReminder(testCard1);
        testCard2.secondsBeforeTimeSpanForReminder = 10;
        rRuleRemindList.addAReminder(testCard2);
        expect(rRuleRemindList.hasAReminder(testCard1.id)).toBeTruthy();
        expect(rRuleRemindList.hasAReminder(testCard2.id)).toBeTruthy();
        rRuleRemindList.removeAReminder(testCard1.id);
        rRuleRemindList.removeAReminder(testCard2.id);
        expect(rRuleRemindList.hasAReminder(testCard1.id)).toBeFalsy();
        expect(rRuleRemindList.hasAReminder(testCard2.id)).toBeFalsy();
    });

    it('should remind if timespan start date is now and secondsBeforeTimeSpanForReminder = 0 ', () => {
        const testCard: Card = getOneRandomCard();
        testCard.timeSpans = [new TimeSpan(new Date().valueOf())];
        testCard.secondsBeforeTimeSpanForReminder = 0;
        rRuleRemindList.addAReminder(testCard);
        expect(rRuleRemindList.hasAReminder(testCard.id)).toBeTruthy();
        const cardsToRemind: Array<string> = rRuleRemindList.getCardIdsToRemindNow();
        expect(cardsToRemind[0]).toEqual(testCard.id);
        rRuleRemindList.removeAReminder(testCard.id);
        expect(rRuleRemindList.hasAReminder(testCard.id)).toBeFalsy();
    });

    it('should remind if timespan start date - 15 min  is > current date ', () => {
        const testCard: Card = getOneRandomCard();
        testCard.timeSpans = [new TimeSpan(new Date().valueOf() + 1000 * 60 * 14)];
        testCard.secondsBeforeTimeSpanForReminder = 60 * 15;
        rRuleRemindList.addAReminder(testCard);
        expect(rRuleRemindList.hasAReminder(testCard.id)).toBeTruthy();
        const cardsToRemind: Array<string> = rRuleRemindList.getCardIdsToRemindNow();
        expect(cardsToRemind[0]).toEqual(testCard.id);
        rRuleRemindList.removeAReminder(testCard.id);
        expect(rRuleRemindList.hasAReminder(testCard.id)).toBeFalsy();
    });

    it(`should not remind if :
      - timespan start date - 15 min  is > current date 
      - card has already been remind `, () => {
        const testCard: Card = getOneRandomCard();
        testCard.timeSpans = [new TimeSpan(new Date().valueOf())];
        testCard.secondsBeforeTimeSpanForReminder = 60 * 15;
        rRuleRemindList.addAReminder(testCard);
        expect(rRuleRemindList.hasAReminder(testCard.id)).toBeTruthy();
        const cardsToRemind: Array<string> = rRuleRemindList.getCardIdsToRemindNow();
        expect(cardsToRemind[0]).toEqual(testCard.id);
        rRuleRemindList.setCardHasBeenRemind(testCard);
        expect(rRuleRemindList.getCardIdsToRemindNow().length).toEqual(0);
    });

    it(`should not remind if :
      - timespan start date - 15 min  is > current date
      - card has already been remind
      - we add again the same card to the reminder`, () => {
        const testCard: Card = getOneRandomCard();
        testCard.timeSpans = [new TimeSpan(new Date().valueOf())];
        testCard.secondsBeforeTimeSpanForReminder = 60 * 15;
        rRuleRemindList.addAReminder(testCard);
        rRuleRemindList.setCardHasBeenRemind(testCard);
        rRuleRemindList.addAReminder(testCard);
        expect(rRuleRemindList.getCardIdsToRemindNow().length).toEqual(0);
    });

    it('should not remind if timespan start date - 15 min  is < current date ', () => {
        const testCard: Card = getOneRandomCard();
        testCard.timeSpans = [new TimeSpan(new Date().valueOf() + 1000 * 60 * 16)];
        testCard.secondsBeforeTimeSpanForReminder = 60 * 15;
        rRuleRemindList.addAReminder(testCard);
        expect(rRuleRemindList.hasAReminder(testCard.id)).toBeTruthy();
        const cardsToRemind: Array<string> = rRuleRemindList.getCardIdsToRemindNow();
        expect(cardsToRemind.length).toEqual(0);
    });

    it('should not remind if timespan start date - 10 seconds   is < current date ', () => {
        const testCard: Card = getOneRandomCard();
        testCard.timeSpans = [new TimeSpan(new Date().valueOf() + 1000 * 20)];
        testCard.secondsBeforeTimeSpanForReminder = 10;
        rRuleRemindList.addAReminder(testCard);
        expect(rRuleRemindList.hasAReminder(testCard.id)).toBeTruthy();
        const cardsToRemind: Array<string> = rRuleRemindList.getCardIdsToRemindNow();
        expect(cardsToRemind.length).toEqual(0);
    });

    it('should remind two of three card  ', () => {
        const testCard1: Card = getOneRandomCard();
        const testCard2: Card = getOneRandomCard();
        const testCard3: Card = getOneRandomCard();
        testCard1.timeSpans = [new TimeSpan(new Date().valueOf() + 2000)];
        testCard2.timeSpans = [new TimeSpan(new Date().valueOf() + 1000 * 5)];
        testCard3.timeSpans = [new TimeSpan(new Date().valueOf() + 1000 * 60)];
        testCard1.secondsBeforeTimeSpanForReminder = 10;
        testCard2.secondsBeforeTimeSpanForReminder = 10;
        testCard3.secondsBeforeTimeSpanForReminder = 10;
        rRuleRemindList.addAReminder(testCard1);
        rRuleRemindList.addAReminder(testCard2);
        rRuleRemindList.addAReminder(testCard3);
        const cardsToRemind: Array<string> = rRuleRemindList.getCardIdsToRemindNow();
        expect(cardsToRemind).toContain(testCard1.id);
        expect(cardsToRemind).toContain(testCard2.id);
        expect(cardsToRemind.length).toEqual(2);
    });

    it('should persist in local storage', () => {
        const testCard1: Card = getOneRandomCard();
        const testCard2: Card = getOneRandomCard();
        testCard1.rRule = {
            freq: Frequency.DAILY,
            byhour: [10],
            byminute: [0]
        };
        testCard2.rRule = {
            freq: Frequency.DAILY,
            byhour: [10],
            byminute: [0]
        };
        testCard1.secondsBeforeTimeSpanForReminder = 10;
        testCard2.secondsBeforeTimeSpanForReminder = 10;
        rRuleRemindList.addAReminder(testCard1);
        rRuleRemindList.addAReminder(testCard2);
        const storageString = localStorage.getItem('testUser.rRuleReminderList');
        const storageValue = JSON.parse(storageString);
        expect(storageValue[1][1]).toBeDefined();
        rRuleRemindList.removeAReminder(testCard1.id);
        rRuleRemindList.removeAReminder(testCard2.id);
        const storageStringAfterRemove = localStorage.getItem('testUser.rRuleReminderList');
        const storageValueAfterRemove = JSON.parse(storageStringAfterRemove);
        expect(storageValueAfterRemove[1]).toBeUndefined();
    });

    it('should persist in local storage when hasBeenRemind', () => {
        const testCard: Card = getOneRandomCard();
        testCard.timeSpans = [new TimeSpan(new Date().valueOf())];
        testCard.secondsBeforeTimeSpanForReminder = 10;
        rRuleRemindList.addAReminder(testCard);
        rRuleRemindList.setCardHasBeenRemind(testCard);
        const storageString = localStorage.getItem('testUser.rRuleReminderList');
        const storageValue = JSON.parse(storageString);
        expect(storageValue[0][1].hasBeenRemind).toBeTruthy();
    });

    it('should load config form local storage', () => {
        const testCard1: Card = getOneRandomCard();
        const testCard2: Card = getOneRandomCard();
        testCard1.rRule = {
            freq: Frequency.DAILY,
            byhour: [10],
            byminute: [0]
        };
        testCard2.rRule = {
            freq: Frequency.DAILY,
            byhour: [10],
            byminute: [0]
        };
        testCard1.secondsBeforeTimeSpanForReminder = 10;
        testCard2.secondsBeforeTimeSpanForReminder = 10;
        rRuleRemindList.addAReminder(testCard1);
        rRuleRemindList.addAReminder(testCard2);

        const newList: RRuleReminderList = new RRuleReminderList('testUser');
        expect(newList.hasAReminder(testCard1.id)).toBeTruthy();
        expect(newList.hasAReminder(testCard2.id)).toBeTruthy();
    });
});
