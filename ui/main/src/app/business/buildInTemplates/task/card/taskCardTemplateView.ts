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
    showInputField: Function;

    public getTaskDescription() {
        let taskDescription = opfab.currentCard.getCard()?.data?.taskDescription;
        if (taskDescription) taskDescription = opfab.utils.convertSpacesAndNewLinesInHTML(opfab.utils.escapeHtml(taskDescription));
        else taskDescription = '';
        return taskDescription;
    }

    public getDurationInMinutes() {
        return opfab.currentCard.getCard()?.data?.durationInMinutes;
    }

    public getByHour() {
        return opfab.currentCard.getCard()?.data?.byhour[0].padStart(2, '0');
    }

    public getByMinute() {
        return opfab.currentCard.getCard()?.data?.byminute[0].padStart(2, '0');
    }

    public fillTexts() {
        const freq = opfab.currentCard.getCard()?.data?.freq;
        const bysetpos = opfab.currentCard.getCard()?.data?.bysetpos;
        const bymonthday = opfab.currentCard.getCard()?.data?.bymonthday;
        const byweekday = opfab.currentCard.getCard()?.data?.byweekday;
        const bymonth = opfab.currentCard.getCard()?.data?.bymonth;

        let textForBysetpos = this.writeTextBySetPos(freq, bysetpos, byweekday);
        let textForByWeekDay = this.writeTextByWeekDay(freq, byweekday);
        let textForBymonthday = this.writeTextByMonthDay(bymonthday);
        let textForBymonth = this.writeTextByMonth(bymonth);
             
        return {
            textForBysetpos: textForBysetpos,
            textForByweekday: textForByWeekDay,
            textForBymonthday: textForBymonthday,
            textForBymonth: textForBymonth
          };
    }

    writeTextBySetPos(freq: any, bysetpos: any, byweekday: any) {
        let textForBysetpos = "";
        if (freq === "MONTHLY" && bysetpos !== [].valueOf() && byweekday !== [].valueOf()) {
            if (bysetpos.includes("1"))  textForBysetpos += " first,";
            if (bysetpos.includes("2"))  textForBysetpos += " second,";
            if (bysetpos.includes("3"))  textForBysetpos += " third,";
            if (bysetpos.includes("4"))  textForBysetpos += " fourth,";
            if (bysetpos.includes("-1")) textForBysetpos += " last,";

            if (textForBysetpos != "") {
                textForBysetpos = textForBysetpos.slice(0, -1); //we delete the last comma
                textForBysetpos = "The" + textForBysetpos + " ";
            }
        }
        return textForBysetpos;
    }

    writeTextByWeekDay(freq: any, byweekday: any) {
        let textForByWeekDay = "";
        if (byweekday.includes("MO"))  textForByWeekDay += " " + opfab.utils.getTranslation("buildInTemplate.taskCard.monday");
        if (byweekday.includes("TU"))  textForByWeekDay += " " + opfab.utils.getTranslation("buildInTemplate.taskCard.tuesday");
        if (byweekday.includes("WE"))  textForByWeekDay += " " + opfab.utils.getTranslation("buildInTemplate.taskCard.wednesday");
        if (byweekday.includes("TH"))  textForByWeekDay += " " + opfab.utils.getTranslation("buildInTemplate.taskCard.thursday");
        if (byweekday.includes("FR"))  textForByWeekDay += " " + opfab.utils.getTranslation("buildInTemplate.taskCard.friday");
        if (byweekday.includes("SA"))  textForByWeekDay += " " + opfab.utils.getTranslation("buildInTemplate.taskCard.saturday");
        if (byweekday.includes("SU"))  textForByWeekDay += " " + opfab.utils.getTranslation("buildInTemplate.taskCard.sunday");
        if ((freq === "DAILY") && (textForByWeekDay !== ""))   textForByWeekDay = "on" + textForByWeekDay;

        return textForByWeekDay;
    }

    writeTextByMonthDay(bymonthday: any) {
        let textForBymonthday= "";
        if (bymonthday.includes("1"))  textForBymonthday += "The first day of the month, ";
        if (bymonthday.includes("-1")) textForBymonthday += "The last day of the month, ";
        if (bymonthday.length > 0) {
            if ((bymonthday[0] !== "1") && (bymonthday[0] !== "-1")) {
                textForBymonthday += "The " + bymonthday[0] + this.cardinalToOrdinal(bymonthday[0]) + " day of the month, ";
            }
        }
        if (textForBymonthday !== "") {
            textForBymonthday = textForBymonthday.slice(0, -2);
            textForBymonthday += "<br/><br/>";
        }
        return textForBymonthday;
    }

    writeTextByMonth(bymonth: any) {
        let textForBymonth= "";
        if (bymonth.includes(1))  textForBymonth += " " + opfab.utils.getTranslation("buildInTemplate.taskCard.january");
        if (bymonth.includes(2))  textForBymonth += " " + opfab.utils.getTranslation("buildInTemplate.taskCard.february");
        if (bymonth.includes(3))  textForBymonth += " " + opfab.utils.getTranslation("buildInTemplate.taskCard.march");
        if (bymonth.includes(4))  textForBymonth += " " + opfab.utils.getTranslation("buildInTemplate.taskCard.april");
        if (bymonth.includes(5))  textForBymonth += " " + opfab.utils.getTranslation("buildInTemplate.taskCard.may");
        if (bymonth.includes(6))  textForBymonth += " " + opfab.utils.getTranslation("buildInTemplate.taskCard.june");
        if (bymonth.includes(7))  textForBymonth += " " + opfab.utils.getTranslation("buildInTemplate.taskCard.july");
        if (bymonth.includes(8))  textForBymonth += " " + opfab.utils.getTranslation("buildInTemplate.taskCard.august");
        if (bymonth.includes(9))  textForBymonth += " " + opfab.utils.getTranslation("buildInTemplate.taskCard.september");
        if (bymonth.includes(10)) textForBymonth += " " + opfab.utils.getTranslation("buildInTemplate.taskCard.october");
        if (bymonth.includes(11)) textForBymonth += " " + opfab.utils.getTranslation("buildInTemplate.taskCard.november");
        if (bymonth.includes(12)) textForBymonth += " " + opfab.utils.getTranslation("buildInTemplate.taskCard.december");
        if (textForBymonth !== "") {
            textForBymonth = "in" + textForBymonth;
        }
        return textForBymonth;
    }

    cardinalToOrdinal(cardinal: string) {
        let card = Number(cardinal)
        if (Number.isNaN(card)) {
            return null;
        }

        let ord = 'th';
        if (card % 10 == 1 && card % 100 != 11){ ord = 'st'; }
        else if (card % 10 == 2 && card % 100 != 12){ ord = 'nd'; }
        else if (card % 10 == 3 && card % 100 != 13){ ord = 'rd'; }
        return ord;
    }

    
}
