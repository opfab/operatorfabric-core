/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

declare const opfab;

export class TaskUserCardTemplateView {
    public getSpecificCardInformation(
        taskTitle: string,
        quillTaskDescriptionEditor: any,
        freq: string,
        durationInMinutes: number,
        minutesForReminder: number,
        byweekday: string[],
        bymonth: number[],
        bysetpos: number[],
        bymonthday: number[],
        time: string
    ) {
        let byhour, byminute;
        if (time) {
            byhour = [parseInt(time.slice(0, 2))]; // the hours are the 2 first characters
            byminute = [parseInt(time.slice(-2))]; // the minutes are the 2 last characters
        }

        let rRule;
        if (freq) {
            rRule = {
                freq: freq,
                byweekday: byweekday,
                byhour: byhour,
                byminute: byminute,
                durationInMinutes: durationInMinutes,
                bymonth: bymonth,
                bysetpos: bysetpos,
                bymonthday: bymonthday
            };
        }

        const card = {
            summary: {key: 'taskAdvanced.summary'},
            title: {key: 'taskAdvanced.title', parameters: {taskTitle: taskTitle}},
            secondsBeforeTimeSpanForReminder: minutesForReminder * 60,
            data: {
                taskTitle: taskTitle,
                richTaskDescription: quillTaskDescriptionEditor.getContents(),
                minutesForReminder: minutesForReminder,
                durationInMinutes: durationInMinutes
            },
            rRule: rRule
        };

        return {
            valid: true,
            card: card,
            viewCardInCalendar: freq ? undefined : true
        };
    }

    public getFrequency(): string {
        return opfab.currentUserCard.getEditionMode() !== 'CREATE'
            ? opfab.currentCard.getCard()?.rRule?.freq
            : undefined;
    }

    public getWeekDay(): string[] {
        return opfab.currentUserCard.getEditionMode() !== 'CREATE'
            ? opfab.currentCard.getCard()?.rRule?.byweekday
            : undefined;
    }

    public getMonth(): number[] {
        return opfab.currentUserCard.getEditionMode() !== 'CREATE'
            ? opfab.currentCard.getCard()?.rRule?.bymonth
            : undefined;
    }

    public getMonthDay(): number[] {
        return opfab.currentUserCard.getEditionMode() !== 'CREATE'
            ? opfab.currentCard.getCard()?.rRule?.bymonthday
            : undefined;
    }

    public getSetPos(): number[] {
        return opfab.currentUserCard.getEditionMode() !== 'CREATE'
            ? opfab.currentCard.getCard()?.rRule?.bysetpos
            : undefined;
    }

    public getTaskTitle(): string {
        let taskTitle = '';
        if (opfab.currentUserCard.getEditionMode() !== 'CREATE') {
            const taskTitleField = opfab.currentCard.getCard()?.data?.taskTitle;
            if (taskTitleField) {
                taskTitle = opfab.utils.convertSpacesAndNewLinesInHTML(opfab.utils.escapeHtml(taskTitleField));
            }
        }
        return taskTitle;
    }

    public getTaskDescription(): string {
        let description = '';
        if (opfab.currentUserCard.getEditionMode() !== 'CREATE') {
            const richTaskDescription = opfab.currentCard.getCard()?.data?.richTaskDescription;
            const taskDescription = opfab.currentCard.getCard()?.data?.taskDescription;

            if (richTaskDescription) {
                description = opfab.utils.escapeHtml(richTaskDescription);
            } else if (taskDescription) {
                description = opfab.utils.escapeHtml(opfab.richTextEditor.getDeltaFromText(taskDescription));
            }
        }
        return description;
    }

    public getDurationInMinutes(default_value): number {
        return opfab.currentUserCard.getEditionMode() !== 'CREATE'
            ? (opfab.currentCard.getCard()?.rRule?.durationInMinutes ?? default_value)
            : default_value;
    }

    public getMinutesForReminder(default_value): number {
        return opfab.currentUserCard.getEditionMode() !== 'CREATE'
            ? (opfab.currentCard.getCard()?.data?.minutesForReminder ?? default_value)
            : default_value;
    }

    public getByHourAndMinutes(): string {
        const currentDate = new Date();
        let hour = currentDate.getHours().toString().padStart(2, '0');
        let minute = currentDate.getMinutes().toString().padStart(2, '0');
        if (opfab.currentUserCard.getEditionMode() !== 'CREATE') {
            hour =
                opfab.currentCard.getCard()?.rRule?.byhour[0]?.toString().padStart(2, '0') ??
                currentDate.getHours().toString().padStart(2, '0');
            minute =
                opfab.currentCard.getCard()?.rRule?.byminute[0]?.toString().padStart(2, '0') ??
                currentDate.getMinutes().toString().padStart(2, '0');
        }
        return hour + ':' + minute;
    }
}
