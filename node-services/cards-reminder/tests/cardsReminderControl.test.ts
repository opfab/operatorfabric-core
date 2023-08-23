/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import 'jest'

import GetResponse from '../src/common/server-side/getResponse';
import logger from '../src/common/server-side/logger';
import CardsReminderOpfabServicesInterface from '../src/domain/server-side/cardsReminderOpfabServicesInterface';
import RemindDatabaseService from '../src/domain/server-side/remindDatabaseService';
import ReminderService from '../src/domain/application/reminderService';
import {RRuleReminderService} from '../src/domain/application/rruleReminderService';
import {Day, Frequency} from '../src/domain/model/light-card.model';
import {HourAndMinutes, RRule, Recurrence, TimeSpan} from '../src/domain/model/card.model';
import CardsReminderControl from '../src/domain/application/cardsReminderControl';


let cards: Array<any> = new Array();

class OpfabServicesInterfaceStub extends CardsReminderOpfabServicesInterface {

    sentReminders: Array<any> = new Array();
  
    public async sendCardReminder(cardId: string) {
        this.sentReminders.push(cardId);
        return new GetResponse(null, true);
    }

}

class RemindDatabaseServiceStub extends RemindDatabaseService {

    reminders: Array<any> = new Array();


    public async getItemsToRemindNow(): Promise<any[]> {
        let toRemind = this.reminders.filter( reminder => !reminder.hasBeenRemind && reminder.timeForReminding <= new Date().valueOf() );
        return Promise.resolve(toRemind);
    }

    public async getAllCardsToRemind(): Promise<any[]> {
        let toRemind = cards.filter( card => card.secondsBeforeTimeSpanForReminder && (!card.endDate || card.endDate >= new Date().valueOf()));
        return Promise.resolve(toRemind);
    }    

    public getReminder(id: string) {
        const res = this.reminders.find( reminder => reminder.cardId === id);
        return Promise.resolve(res);
    }

    public persistReminder(reminder: any) {
        this.reminders.push(reminder);
    }

    public removeReminder(id: string) {
        const toRemove = this.reminders.findIndex( reminder => reminder.cardId === id);
        this.reminders.splice(toRemove, 1);
    }

    public getCardByUid(uid: string) {
        let card =  cards.find(card => card.uid === uid);
        card._id = card.id;
        return Promise.resolve(card);
    }

    public clearReminders() {
        this.reminders = new Array();
    }
    
} 

describe('Cards reminder', function () {


    let opfabServicesInterfaceStub = new OpfabServicesInterfaceStub();
    let rruleRemindDatabaseServiceStub = new RemindDatabaseServiceStub();
    let remindDatabaseServiceStub = new RemindDatabaseServiceStub();

    let reminderService = new ReminderService()
        .setLogger(logger)
        .setDatabaseService(remindDatabaseServiceStub);

    let rruleReminderService = new RRuleReminderService()
        .setLogger(logger)
        .setDatabaseService(rruleRemindDatabaseServiceStub);

    let cardsReminderControl = new CardsReminderControl()
    .setOpfabServicesInterface(opfabServicesInterfaceStub)
    .setRruleReminderService(rruleReminderService)
    .setReminderService(reminderService);

    let rRule = new RRule(
        Frequency.DAILY,
        1,
        1,
        Day.MO,
        [Day.MO, Day.TU, Day.WE, Day.TH, Day.FR, Day.SA, Day.SU],
        [1,2,3,4,5,6,7,8,9,10,11,12],
        [12],
        [23],
        [],
        [],
        "Europe/Paris",
        15
    );

    let recurrence =  new Recurrence ( new HourAndMinutes(12, 23), 
        [1,2,3,4,5,6,7],
        "Europe/Paris",
        15,
        [0,1,2,3,4,5,6,7,8,9,10,11]
    );

    
    beforeEach(() => {
        opfabServicesInterfaceStub.sentReminders = new Array();
        cards = new Array();
        
        const now = new Date();
        rRule.byhour = [now.getHours()]
        rRule.byminute = [now.getMinutes()+1]
        
        recurrence.hoursAndMinutes = new HourAndMinutes(now.getHours(), now.getMinutes()+1);
    });


    it('Should send reminder once when card has secondsBeforeTimeSpanForReminder set and no endDate', async function() {
        const startDate = Date.now() - 300 * 1000;

        const card_with_rrule = {uid: "0001", id:"defaultProcess.process1" , secondsBeforeTimeSpanForReminder: 300, rRule: rRule, startDate: startDate, process: "defaultProcess", state: "processState", entityRecipients:["ENTITY1"]};
        
        let timespans = [new TimeSpan(startDate, null, recurrence)];

        const card_with_recurrence = {uid: "0002", id:"defaultProcess.process2" , secondsBeforeTimeSpanForReminder: 300, timeSpans: timespans, startDate: startDate, process: "defaultProcess", state: "processState", entityRecipients:["ENTITY1"]};

        cards = [card_with_rrule, card_with_recurrence];

        cardsReminderControl.resetReminderDatabase();
        await new Promise(resolve => setTimeout(resolve, 1));

        cardsReminderControl.checkCardsReminder();
        await new Promise(resolve => setTimeout(resolve, 1));

        expect(opfabServicesInterfaceStub.sentReminders.length).toEqual(2);
        expect(opfabServicesInterfaceStub.sentReminders).toEqual(["0002","0001"]);
        
        cardsReminderControl.checkCardsReminder();
        await new Promise(resolve => setTimeout(resolve, 1));
        expect(opfabServicesInterfaceStub.sentReminders.length).toEqual(2);

    })

    it('Should send reminder once when card has secondsBeforeTimeSpanForReminder set and endDate after current time', async function() {
        const startDate = Date.now() - 300 * 1000;
        const endDate = Date.now() + 300 * 1000;
        
        const card_with_rrule = {uid: "0003", id:"defaultProcess.process3" , secondsBeforeTimeSpanForReminder: 300, rRule: rRule, startDate: startDate, endDate: endDate, process: "defaultProcess", state: "processState", entityRecipients:["ENTITY1"]};

        let timespans = [new TimeSpan(startDate, endDate, recurrence)];

        const card_with_recurrence = {uid: "0004", id:"defaultProcess.process4" , secondsBeforeTimeSpanForReminder: 300, timeSpans: timespans, startDate: startDate, endDate: endDate, process: "defaultProcess", state: "processState", entityRecipients:["ENTITY1"]};

        cards = [card_with_rrule, card_with_recurrence];
        
        cardsReminderControl.resetReminderDatabase();
        await new Promise(resolve => setTimeout(resolve, 1));

        cardsReminderControl.checkCardsReminder();
        await new Promise(resolve => setTimeout(resolve, 1));

        expect(opfabServicesInterfaceStub.sentReminders.length).toEqual(2);
        expect(opfabServicesInterfaceStub.sentReminders).toEqual(["0004","0003"]);
        
        cardsReminderControl.checkCardsReminder();
        await new Promise(resolve => setTimeout(resolve, 1));
        expect(opfabServicesInterfaceStub.sentReminders.length).toEqual(2);

    })

    
    it('Should not send reminder when card has secondsBeforeTimeSpanForReminder set and endDate before current time', async function() {
        const startDate = Date.now() - 300 * 1000;
        const endDate = Date.now() - 60 * 1000;

        const card_with_rrule  = {uid: "0001", id:"defaultProcess.process1" , secondsBeforeTimeSpanForReminder: 300, rRule: rRule, startDate: startDate, endDate: endDate, process: "defaultProcess", state: "processState", entityRecipients:["ENTITY1"]};

        let timespans = [new TimeSpan(startDate, endDate, recurrence)];

        const card_with_recurrence = {uid: "0001", id:"defaultProcess.process1" , secondsBeforeTimeSpanForReminder: 300, timeSpans: timespans, startDate: startDate, endDate: endDate, process: "defaultProcess", state: "processState", entityRecipients:["ENTITY1"]};

        cards = [card_with_rrule, card_with_recurrence];
        cardsReminderControl.resetReminderDatabase();
        await new Promise(resolve => setTimeout(resolve, 1));

        cardsReminderControl.checkCardsReminder();
        await new Promise(resolve => setTimeout(resolve, 1));

        expect(opfabServicesInterfaceStub.sentReminders.length).toEqual(0);

    })


    it('Should not send reminder when secondsBeforeTimeSpanForReminder is not set', async function() {
        const startDate = Date.now() - 300 * 1000;
        const endDate = Date.now() + 300 * 1000;

        const card_with_rrule = {uid: "0001", id:"defaultProcess.process1" , rRule: rRule, startDate: startDate, endDate: endDate, process: "defaultProcess", state: "processState", entityRecipients:["ENTITY1"]};

        let timespans = [new TimeSpan(startDate, endDate, recurrence)];

        const card_with_recurrence = {uid: "0001", id:"defaultProcess.process1" , timeSpans: timespans, startDate: startDate, endDate: endDate, process: "defaultProcess", state: "processState", entityRecipients:["ENTITY1"]};

        cards = [card_with_rrule, card_with_recurrence];
        cardsReminderControl.resetReminderDatabase();
        await new Promise(resolve => setTimeout(resolve, 1));

        cardsReminderControl.checkCardsReminder();
        await new Promise(resolve => setTimeout(resolve, 1));

        expect(opfabServicesInterfaceStub.sentReminders.length).toEqual(0);
    })

})
