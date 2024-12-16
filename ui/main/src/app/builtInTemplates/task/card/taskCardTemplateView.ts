/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {DateTimeFormatterService} from 'app/services/dateTimeFormatter/DateTimeFormatterService';

declare const opfab;

export class TaskCardTemplateView {
    showInputField: Function;

    public getTaskTitle(): string {
        let taskTitle = opfab.currentCard.getCard()?.data?.taskTitle;
        if (taskTitle) {
            taskTitle = opfab.utils.convertSpacesAndNewLinesInHTML(opfab.utils.escapeHtml(taskTitle));
        } else {
            taskTitle = '';
        }
        return taskTitle;
    }

    public getTaskDescription(): string {
        let description = '';
        const richTaskDescription = opfab.currentCard.getCard()?.data?.richTaskDescription;
        const taskDescription = opfab.currentCard.getCard()?.data?.taskDescription;

        if (richTaskDescription) {
            description = opfab.utils.escapeHtml(richTaskDescription);
        } else if (taskDescription) {
            description = opfab.utils.escapeHtml(opfab.richTextEditor.getDeltaFromText(taskDescription));
        }
        return description;
    }

    public getDurationInMinutes(): number {
        return (
            opfab.currentCard.getCard()?.rRule?.durationInMinutes ?? opfab.currentCard.getCard()?.data.durationInMinutes
        );
    }

    public getDateForCardWithoutRecurrence(): string {
        if (opfab.currentCard.getCard()?.rRule?.freq) {
            return '';
        }
        return (
            '<br/><br/>' +
            opfab.utils.getTranslation('builtInTemplate.taskUserCard.the') +
            ' ' +
            DateTimeFormatterService.getFormattedDate(opfab.currentCard.getCard()?.startDate, 'dd/MM/yyyy')
        );
    }

    public getHourAndMinutes(): string {
        let hour, minute;

        if (opfab.currentCard.getCard()?.rRule) {
            hour = opfab.currentCard.getCard().rRule.byhour[0]?.toString().padStart(2, '0');
            minute = opfab.currentCard.getCard().rRule.byminute[0]?.toString().padStart(2, '0');
        } else {
            hour = new Date(opfab.currentCard.getCard()?.startDate).getHours().toString().padStart(2, '0');
            minute = new Date(opfab.currentCard.getCard()?.startDate).getMinutes().toString().padStart(2, '0');
        }
        return hour + ':' + minute;
    }

    public getTexts() {
        const freq = opfab.currentCard.getCard()?.rRule?.freq;
        const bySetPos = opfab.currentCard.getCard()?.rRule?.bysetpos;
        const byMonthDay = opfab.currentCard.getCard()?.rRule?.bymonthday;
        const byWeekDay = opfab.currentCard.getCard()?.rRule?.byweekday;
        const byMonth = opfab.currentCard.getCard()?.rRule?.bymonth;

        const textForBySetPos = this.getTextBySetPos(freq, bySetPos, byWeekDay);
        const textForByWeekDay = this.getTextByWeekDay(freq, byWeekDay);
        const textForByMonthDay = this.getTextByMonthDay(byMonthDay);
        const textForByMonth = this.getTextByMonth(byMonth);

        return {
            textForBySetPos,
            textForByWeekDay,
            textForByMonthDay,
            textForByMonth
        };
    }

    private getTextBySetPos(freq: string, bySetPos: number[], byWeekDay: string[]): string {
        let textForBySetPos = '';
        if (bySetPos == null) return textForBySetPos;
        if (freq === 'MONTHLY' && bySetPos !== [].valueOf() && byWeekDay !== [].valueOf()) {
            if (bySetPos.includes(1))
                textForBySetPos += opfab.utils.getTranslation('builtInTemplate.taskCard.first') + ', ';
            if (bySetPos.includes(2))
                textForBySetPos += opfab.utils.getTranslation('builtInTemplate.taskCard.second') + ', ';
            if (bySetPos.includes(3))
                textForBySetPos += opfab.utils.getTranslation('builtInTemplate.taskCard.third') + ', ';
            if (bySetPos.includes(4))
                textForBySetPos += opfab.utils.getTranslation('builtInTemplate.taskCard.fourth') + ', ';
            if (bySetPos.includes(-1))
                textForBySetPos += opfab.utils.getTranslation('builtInTemplate.taskCard.last') + ', ';

            if (textForBySetPos !== '') {
                textForBySetPos = textForBySetPos.slice(0, -2); //we delete the last comma
                textForBySetPos =
                    opfab.utils.getTranslation('builtInTemplate.taskCard.the') + ' ' + textForBySetPos + ' ';
            }
        }
        return textForBySetPos;
    }

    private getTextByWeekDay(freq: string, byWeekDay: string[]): string {
        let textForByWeekDay = '';
        if (byWeekDay == null) return textForByWeekDay;
        if (byWeekDay.includes('MO')) textForByWeekDay += ' ' + opfab.utils.getTranslation('shared.calendar.monday');
        if (byWeekDay.includes('TU')) textForByWeekDay += ' ' + opfab.utils.getTranslation('shared.calendar.tuesday');
        if (byWeekDay.includes('WE')) textForByWeekDay += ' ' + opfab.utils.getTranslation('shared.calendar.wednesday');
        if (byWeekDay.includes('TH')) textForByWeekDay += ' ' + opfab.utils.getTranslation('shared.calendar.thursday');
        if (byWeekDay.includes('FR')) textForByWeekDay += ' ' + opfab.utils.getTranslation('shared.calendar.friday');
        if (byWeekDay.includes('SA')) textForByWeekDay += ' ' + opfab.utils.getTranslation('shared.calendar.saturday');
        if (byWeekDay.includes('SU')) textForByWeekDay += ' ' + opfab.utils.getTranslation('shared.calendar.sunday');
        if (freq === 'DAILY' && textForByWeekDay !== '')
            textForByWeekDay = opfab.utils.getTranslation('builtInTemplate.taskCard.on') + textForByWeekDay;

        return textForByWeekDay;
    }

    private getTextByMonthDay(byMonthDay: number[]): string {
        let textForByMonthDay = '';
        if (byMonthDay == null) return textForByMonthDay;
        if (byMonthDay.includes(1))
            textForByMonthDay += opfab.utils.getTranslation('builtInTemplate.taskCard.firstDayOfTheMonth') + ', ';
        if (byMonthDay.includes(-1))
            textForByMonthDay += opfab.utils.getTranslation('builtInTemplate.taskCard.lastDayOfTheMonth') + ', ';
        if (byMonthDay.length > 0) {
            if (byMonthDay[0] !== 1 && byMonthDay[0] !== -1) {
                if (byMonthDay[0] < 0) {
                    textForByMonthDay +=
                        -byMonthDay[0] +
                        ' ' +
                        opfab.utils.getTranslation('builtInTemplate.taskCard.daysBeforeEndOfTheMonth') +
                        ' , ';
                } else {
                    textForByMonthDay +=
                        opfab.utils.getTranslation('builtInTemplate.taskCard.the') +
                        ' ' +
                        byMonthDay[0] +
                        this.getOrdinalMonthDaySuffix(byMonthDay[0]) +
                        ' ' +
                        opfab.utils.getTranslation('builtInTemplate.taskCard.dayOfTheMonth') +
                        ' , ';
                }
            }
        }
        if (textForByMonthDay !== '') {
            textForByMonthDay = textForByMonthDay.slice(0, -2);
            textForByMonthDay += '<br/><br/>';
        }
        return textForByMonthDay;
    }

    private getTextByMonth(byMonth: number[]): string {
        let textForByMonth = '';
        if (byMonth == null) return textForByMonth;
        if (byMonth.includes(1)) textForByMonth += ' ' + opfab.utils.getTranslation('shared.calendar.january');
        if (byMonth.includes(2)) textForByMonth += ' ' + opfab.utils.getTranslation('shared.calendar.february');
        if (byMonth.includes(3)) textForByMonth += ' ' + opfab.utils.getTranslation('shared.calendar.march');
        if (byMonth.includes(4)) textForByMonth += ' ' + opfab.utils.getTranslation('shared.calendar.april');
        if (byMonth.includes(5)) textForByMonth += ' ' + opfab.utils.getTranslation('shared.calendar.may');
        if (byMonth.includes(6)) textForByMonth += ' ' + opfab.utils.getTranslation('shared.calendar.june');
        if (byMonth.includes(7)) textForByMonth += ' ' + opfab.utils.getTranslation('shared.calendar.july');
        if (byMonth.includes(8)) textForByMonth += ' ' + opfab.utils.getTranslation('shared.calendar.august');
        if (byMonth.includes(9)) textForByMonth += ' ' + opfab.utils.getTranslation('shared.calendar.september');
        if (byMonth.includes(10)) textForByMonth += ' ' + opfab.utils.getTranslation('shared.calendar.october');
        if (byMonth.includes(11)) textForByMonth += ' ' + opfab.utils.getTranslation('shared.calendar.november');
        if (byMonth.includes(12)) textForByMonth += ' ' + opfab.utils.getTranslation('shared.calendar.december');
        if (textForByMonth !== '') {
            textForByMonth = opfab.utils.getTranslation('builtInTemplate.taskCard.in') + textForByMonth;
        }
        return textForByMonth;
    }

    private getOrdinalMonthDaySuffix(cardinal: number): string {
        if (Number.isNaN(cardinal)) {
            return null;
        }
        const standard_suffix_day = opfab.utils.getTranslation('shared.ordinal.suffix.default');

        return cardinal > 31 ? standard_suffix_day : opfab.utils.getTranslation('shared.ordinal.suffix.' + cardinal);
    }
}
