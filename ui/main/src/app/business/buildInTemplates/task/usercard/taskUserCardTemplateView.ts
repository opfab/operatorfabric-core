/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

declare const opfab;

export class TaskCardTemplateView {

    public getSpecificCardInformation(taskDescription, freq, durationInMinutes, minutesForReminder, byweekday, bymonth, bysetpos, bymonthday, time) {

        const byhour =  [time.slice(0, 2)]; // the hours are the 2 first characters
        const byminute =  [time.slice(-2)]; // the minutes are the 2 last characters
        
        const rRule = {
            freq: freq,
            byweekday : byweekday,
            byhour: byhour,
            byminute: byminute,
            durationInMinutes: durationInMinutes,
            bymonth: bymonth,
            bysetpos: bysetpos,
            bymonthday: bymonthday
        }

        const card = {
            summary: { key: "taskAdvanced.summary" },
            title: { key: "taskAdvanced.title" },
            secondsBeforeTimeSpanForReminder: minutesForReminder * 60,
            data: {
                taskDescription: taskDescription,
                freq: freq,
                byhour: byhour,
                byminute: byminute,
                durationInMinutes: durationInMinutes,
                minutesForReminder: minutesForReminder,
                byweekday: byweekday,
                bymonth: bymonth,
                bysetpos: bysetpos,
                bymonthday: bymonthday
            },
            rRule: rRule
        };

        return {
            valid: true,
            card: card
        };
    }

    public getFrequency() {
        return opfab.currentCard.getCard()?.data?.freq
    }

    public getWeekDay() {
        return opfab.currentCard.getCard()?.data?.byweekday
    }

    public getMonth() {
        return opfab.currentCard.getCard()?.data?.bymonth
    }

    public getMonthDay() {
        return opfab.currentCard.getCard()?.data?.bymonthday
    }

    public getSetPos() {
        return opfab.currentCard.getCard()?.data?.bysetpos
    }

    public getTaskDescription() {
        let taskDescription = '';
        if (opfab.currentUserCard.getEditionMode() !== 'CREATE') {
            const taskDescriptionField = opfab.currentCard.getCard()?.data?.taskDescription;
            if (taskDescriptionField) taskDescription = opfab.utils.convertSpacesAndNewLinesInHTML(opfab.utils.escapeHtml(taskDescriptionField));
        }
        return taskDescription;
    }

    public getDurationInMinutes(default_value) {
        return opfab.currentCard.getCard()?.data?.durationInMinutes ?? default_value
    }

    public getMinutesForReminder(default_value) {
        return opfab.currentCard.getCard()?.data?.minutesForReminder ?? default_value
    }

    public getByHourAndMinutes() {
        let currentDate = new Date();
        let hour = opfab.currentCard.getCard()?.data?.byhour[0].padStart(2,'0') ?? currentDate.getHours().toString().padStart(2,'0');
        let minute = opfab.currentCard.getCard()?.data?.byminute[0].padStart(2,'0') ?? currentDate.getMinutes().toString().padStart(2,'0');
        return hour + ":" + minute
    }
}
