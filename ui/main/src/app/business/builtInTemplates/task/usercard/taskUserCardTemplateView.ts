/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

declare const opfab;

export class TaskCardTemplateView {
    public getSpecificCardInformation(
        taskTitle,
        quillTaskDescriptionEditor,
        freq,
        durationInMinutes,
        minutesForReminder,
        byweekday,
        bymonth,
        bysetpos,
        bymonthday,
        time
    ) {
        const byhour = [time.slice(0, 2)]; // the hours are the 2 first characters
        const byminute = [time.slice(-2)]; // the minutes are the 2 last characters

        const rRule = {
            freq: freq,
            byweekday: byweekday,
            byhour: byhour,
            byminute: byminute,
            durationInMinutes: durationInMinutes,
            bymonth: bymonth,
            bysetpos: bysetpos,
            bymonthday: bymonthday
        };

        const card = {
            summary: {key: 'taskAdvanced.summary'},
            title: {key: 'taskAdvanced.title', parameters: {taskTitle: taskTitle}},
            secondsBeforeTimeSpanForReminder: minutesForReminder * 60,
            data: {
                taskTitle: taskTitle,
                richTaskDescription: quillTaskDescriptionEditor.getContents(),
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
        return opfab.currentUserCard.getEditionMode() !== 'CREATE'
            ? opfab.currentCard.getCard()?.data?.freq
            : undefined;
    }

    public getWeekDay() {
        return opfab.currentUserCard.getEditionMode() !== 'CREATE'
            ? opfab.currentCard.getCard()?.data?.byweekday
            : undefined;
    }

    public getMonth() {
        return opfab.currentUserCard.getEditionMode() !== 'CREATE'
            ? opfab.currentCard.getCard()?.data?.bymonth
            : undefined;
    }

    public getMonthDay() {
        return opfab.currentUserCard.getEditionMode() !== 'CREATE'
            ? opfab.currentCard.getCard()?.data?.bymonthday
            : undefined;
    }

    public getSetPos() {
        return opfab.currentUserCard.getEditionMode() !== 'CREATE'
            ? opfab.currentCard.getCard()?.data?.bysetpos
            : undefined;
    }

    public getTaskTitle() {
        let taskTitle = '';
        if (opfab.currentUserCard.getEditionMode() !== 'CREATE') {
            const taskTitleField = opfab.currentCard.getCard()?.data?.taskTitle;
            if (taskTitleField) {
                taskTitle = opfab.utils.convertSpacesAndNewLinesInHTML(opfab.utils.escapeHtml(taskTitleField));
            }
        }
        return taskTitle;
    }

    public getTaskDescription() {
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

    public getDurationInMinutes(default_value) {
        return opfab.currentUserCard.getEditionMode() !== 'CREATE'
            ? (opfab.currentCard.getCard()?.data?.durationInMinutes ?? default_value)
            : default_value;
    }

    public getMinutesForReminder(default_value) {
        return opfab.currentUserCard.getEditionMode() !== 'CREATE'
            ? (opfab.currentCard.getCard()?.data?.minutesForReminder ?? default_value)
            : default_value;
    }

    public getByHourAndMinutes() {
        const currentDate = new Date();
        let hour = currentDate.getHours().toString().padStart(2, '0');
        let minute = currentDate.getMinutes().toString().padStart(2, '0');
        if (opfab.currentUserCard.getEditionMode() !== 'CREATE') {
            hour =
                opfab.currentCard.getCard()?.data?.byhour[0].padStart(2, '0') ??
                currentDate.getHours().toString().padStart(2, '0');
            minute =
                opfab.currentCard.getCard()?.data?.byminute[0].padStart(2, '0') ??
                currentDate.getMinutes().toString().padStart(2, '0');
        }
        return hour + ':' + minute;
    }
}
