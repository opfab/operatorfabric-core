/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {BaseUserCardTemplate} from '../../baseUserCardTemplate';
import {TaskCardTemplateView} from './taskUserCardTemplateView';

declare const opfab;

export class TaskUserCardTemplate extends BaseUserCardTemplate {
    view: TaskCardTemplateView;
    occurrenceNumberSelect;
    weekdaySelect;

    daysArray = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    monthsArrayDaily = ["JanuaryDaily", "FebruaryDaily", "MarchDaily", "AprilDaily", "MayDaily", "JuneDaily", "JulyDaily", "AugustDaily", "SeptemberDaily", "OctoberDaily", "NovemberDaily", "DecemberDaily"];
    monthsArrayMonthly = ["JanuaryMonthly", "FebruaryMonthly", "MarchMonthly", "AprilMonthly", "MayMonthly", "JuneMonthly", "JulyMonthly", "AugustMonthly", "SeptemberMonthly", "OctoberMonthly", "NovemberMonthly", "DecemberMonthly"];

    hasMonthlyFreqAlreadyBeenDisplayedInCreateMode = false;

    constructor() {
        super();
        this.view = new TaskCardTemplateView();
        this.innerHTML = `
        <br/>
        <div class="opfab-input">
            <label for="taskTitle"> ${opfab.utils.getTranslation('buildInTemplate.taskUserCard.taskTitleLabel')}</label>
            <input size="50" type="text" id="taskTitle" value='${this.view.getTaskTitle()}'> 
        </div>
        <br/>
        <div class="opfab-input">
            <label for="taskDescription"> ${opfab.utils.getTranslation('buildInTemplate.taskUserCard.taskDescriptionLabel')}</label>
            <input size="50" type="text" id="taskDescription" value='${this.view.getTaskDescription()}'> 
        </div>
        <br/>
        
        <div>
            <table style="width: 30%;margin-bottom: -5px;">
                <tr>
                    <td>
                        <label class="opfab-radio-button"> <span> ${opfab.utils.getTranslation("buildInTemplate.taskUserCard.dailyFreq")} </span>
                            <input type="radio" id="radioButtonDailyFreq" checked>
                            <span class="opfab-radio-button-checkmark"></span>
                        </label>
                    </td>
                    <td>
                        <label class="opfab-radio-button"> <span> ${opfab.utils.getTranslation("buildInTemplate.taskUserCard.monthlyFreq")} </span>
                            <input type="radio" id="radioButtonMonthlyFreq">
                            <span class="opfab-radio-button-checkmark"></span>
                        </label>
                    </td>
                </tr>
            </table>
        </div>
        <br/>
        
        
        <div id="daysOfWeek">
            <div class="opfab-border-box">
                <label> ${opfab.utils.getTranslation("buildInTemplate.taskUserCard.Repeat")} </label>
                <table width="100%" style="margin-bottom: -5px;">
                    <tr>
                        <td><label class="opfab-checkbox" style="padding-left:25px"> ${opfab.utils.getTranslation("buildInTemplate.taskUserCard.selectAll")} <input type="checkbox" id="selectAllDays">   <span class="opfab-checkbox-checkmark"> </span>   </label> </td>
                    </tr>
                </table>
                <table width="100%" style="margin-bottom: -5px;" id="weekdaysCheckboxes">
                    <tr>
                        <td><label class="opfab-checkbox" style="padding-left:25px"> ${opfab.utils.getTranslation("shared.calendar.monday")} <input type="checkbox" id="Monday">   <span class="opfab-checkbox-checkmark"> </span>   </label> </td>
                        <td><label class="opfab-checkbox" style="padding-left:25px"> ${opfab.utils.getTranslation("shared.calendar.tuesday")} <input type="checkbox" id="Tuesday">   <span class="opfab-checkbox-checkmark"> </span>   </label> </td>
                        <td><label class="opfab-checkbox" style="padding-left:25px"> ${opfab.utils.getTranslation("shared.calendar.wednesday")} <input type="checkbox" id="Wednesday">   <span class="opfab-checkbox-checkmark"> </span>   </label> </td>
                        <td><label class="opfab-checkbox" style="padding-left:25px"> ${opfab.utils.getTranslation("shared.calendar.thursday")} <input type="checkbox" id="Thursday">   <span class="opfab-checkbox-checkmark"> </span>   </label> </td>
                        <td><label class="opfab-checkbox" style="padding-left:25px"> ${opfab.utils.getTranslation("shared.calendar.friday")} <input type="checkbox" id="Friday">   <span class="opfab-checkbox-checkmark"> </span>   </label> </td>
                        <td><label class="opfab-checkbox" style="padding-left:25px"> ${opfab.utils.getTranslation("shared.calendar.saturday")} <input type="checkbox" id="Saturday">   <span class="opfab-checkbox-checkmark"> </span>   </label> </td>
                        <td><label class="opfab-checkbox" style="padding-left:25px"> ${opfab.utils.getTranslation("shared.calendar.sunday")} <input type="checkbox" id="Sunday">   <span class="opfab-checkbox-checkmark"> </span>   </label> </td>
                    </tr>
                </table>
            </div>
            <br/>
        </div>
        
        <div class="opfab-border-box">
            <table width="100%" style="margin-bottom: -5px;">
                <tr>
                    <td><label class="opfab-checkbox" style="padding-left:25px">${opfab.utils.getTranslation("buildInTemplate.taskUserCard.selectAll")} <input type="checkbox" id="selectAllMonths">   <span class="opfab-checkbox-checkmark"> </span>   </label> </td>
                </tr>
            </table>
            <table width="100%" style="margin-bottom: -5px;" id="monthsCheckboxes">
                <tr id="monthsCheckboxesForDailyFreq">
                    <td><label class="opfab-checkbox" style="padding-left:25px"> ${opfab.utils.getTranslation("shared.calendar.january")} <input type="checkbox" id="JanuaryDaily">   <span class="opfab-checkbox-checkmark"> </span>   </label> </td>
                    <td><label class="opfab-checkbox" style="padding-left:25px"> ${opfab.utils.getTranslation("shared.calendar.february")} <input type="checkbox" id="FebruaryDaily">   <span class="opfab-checkbox-checkmark"> </span>   </label> </td>
                    <td><label class="opfab-checkbox" style="padding-left:25px"> ${opfab.utils.getTranslation("shared.calendar.march")} <input type="checkbox" id="MarchDaily">   <span class="opfab-checkbox-checkmark"> </span>   </label> </td>
                    <td><label class="opfab-checkbox" style="padding-left:25px"> ${opfab.utils.getTranslation("shared.calendar.april")} <input type="checkbox" id="AprilDaily">   <span class="opfab-checkbox-checkmark"> </span>   </label> </td>
                    <td><label class="opfab-checkbox" style="padding-left:25px"> ${opfab.utils.getTranslation("shared.calendar.may")} <input type="checkbox" id="MayDaily">   <span class="opfab-checkbox-checkmark"> </span>   </label> </td>
                    <td><label class="opfab-checkbox" style="padding-left:25px"> ${opfab.utils.getTranslation("shared.calendar.june")} <input type="checkbox" id="JuneDaily" >   <span class="opfab-checkbox-checkmark"> </span>   </label> </td>
                    <td><label class="opfab-checkbox" style="padding-left:25px"> ${opfab.utils.getTranslation("shared.calendar.july")} <input type="checkbox" id="JulyDaily" >   <span class="opfab-checkbox-checkmark"> </span>   </label> </td>
                    <td><label class="opfab-checkbox" style="padding-left:25px"> ${opfab.utils.getTranslation("shared.calendar.august")} <input type="checkbox" id="AugustDaily" >   <span class="opfab-checkbox-checkmark"> </span>   </label> </td>
                    <td><label class="opfab-checkbox" style="padding-left:25px"> ${opfab.utils.getTranslation("shared.calendar.september")} <input type="checkbox" id="SeptemberDaily" >   <span class="opfab-checkbox-checkmark"> </span>   </label> </td>
                    <td><label class="opfab-checkbox" style="padding-left:25px"> ${opfab.utils.getTranslation("shared.calendar.october")} <input type="checkbox" id="OctoberDaily" >   <span class="opfab-checkbox-checkmark"> </span>   </label> </td>
                    <td><label class="opfab-checkbox" style="padding-left:25px"> ${opfab.utils.getTranslation("shared.calendar.november")} <input type="checkbox" id="NovemberDaily" >   <span class="opfab-checkbox-checkmark"> </span>   </label> </td>
                    <td><label class="opfab-checkbox" style="padding-left:25px"> ${opfab.utils.getTranslation("shared.calendar.december")} <input type="checkbox" id="DecemberDaily" >   <span class="opfab-checkbox-checkmark"> </span>   </label> </td>
                </tr>
                <tr id="monthsCheckboxesForMonthlyFreq" hidden>
                    <td><label class="opfab-checkbox" style="padding-left:25px"> ${opfab.utils.getTranslation("shared.calendar.january")} <input type="checkbox" id="JanuaryMonthly" >   <span class="opfab-checkbox-checkmark"> </span>   </label> </td>
                    <td><label class="opfab-checkbox" style="padding-left:25px"> ${opfab.utils.getTranslation("shared.calendar.february")} <input type="checkbox" id="FebruaryMonthly" >   <span class="opfab-checkbox-checkmark"> </span>   </label> </td>
                    <td><label class="opfab-checkbox" style="padding-left:25px"> ${opfab.utils.getTranslation("shared.calendar.march")} <input type="checkbox" id="MarchMonthly" >   <span class="opfab-checkbox-checkmark"> </span>   </label> </td>
                    <td><label class="opfab-checkbox" style="padding-left:25px"> ${opfab.utils.getTranslation("shared.calendar.april")} <input type="checkbox" id="AprilMonthly" >   <span class="opfab-checkbox-checkmark"> </span>   </label> </td>
                    <td><label class="opfab-checkbox" style="padding-left:25px"> ${opfab.utils.getTranslation("shared.calendar.may")} <input type="checkbox" id="MayMonthly" >   <span class="opfab-checkbox-checkmark"> </span>   </label> </td>
                    <td><label class="opfab-checkbox" style="padding-left:25px"> ${opfab.utils.getTranslation("shared.calendar.june")} <input type="checkbox" id="JuneMonthly" >   <span class="opfab-checkbox-checkmark"> </span>   </label> </td>
                    <td><label class="opfab-checkbox" style="padding-left:25px"> ${opfab.utils.getTranslation("shared.calendar.july")} <input type="checkbox" id="JulyMonthly" >   <span class="opfab-checkbox-checkmark"> </span>   </label> </td>
                    <td><label class="opfab-checkbox" style="padding-left:25px"> ${opfab.utils.getTranslation("shared.calendar.august")} <input type="checkbox" id="AugustMonthly" >   <span class="opfab-checkbox-checkmark"> </span>   </label> </td>
                    <td><label class="opfab-checkbox" style="padding-left:25px"> ${opfab.utils.getTranslation("shared.calendar.september")} <input type="checkbox" id="SeptemberMonthly" >   <span class="opfab-checkbox-checkmark"> </span>   </label> </td>
                    <td><label class="opfab-checkbox" style="padding-left:25px"> ${opfab.utils.getTranslation("shared.calendar.october")} <input type="checkbox" id="OctoberMonthly" >   <span class="opfab-checkbox-checkmark"> </span>   </label> </td>
                    <td><label class="opfab-checkbox" style="padding-left:25px"> ${opfab.utils.getTranslation("shared.calendar.november")} <input type="checkbox" id="NovemberMonthly" >   <span class="opfab-checkbox-checkmark"> </span>   </label> </td>
                    <td><label class="opfab-checkbox" style="padding-left:25px"> ${opfab.utils.getTranslation("shared.calendar.december")} <input type="checkbox" id="DecemberMonthly" >   <span class="opfab-checkbox-checkmark"> </span>   </label> </td>
                </tr>
            </table>
        </div>
        
        <div id="dayPositionInTheMonth" hidden>
            <br/>
            <div>
                <table style="width: 30%;margin-bottom: -5px;">
                    <tr>
                        <td>
                            <label class="opfab-radio-button"> <span>${opfab.utils.getTranslation("buildInTemplate.taskUserCard.ordinalDay")} </span>
                                <input type="radio" id="radioButtonNthDay" checked>
                                <span class="opfab-radio-button-checkmark"></span>
                            </label>
                        </td>
                        <td>
                            <label class="opfab-radio-button"> <span>${opfab.utils.getTranslation("buildInTemplate.taskUserCard.ordinalWeekDay")} </span>
                                <input type="radio" id="radioButtonNthWeekday">
                                <span class="opfab-radio-button-checkmark"></span>
                            </label>
                        </td>
                    </tr>
                </table>
            </div>
        
            <br/>
            <div class="opfab-border-box" id="nthDayTable">
                <table width="100%" style="margin-bottom: -5px;">
                    <tr>
                        <td><label class="opfab-checkbox" style="padding-left:25px"> ${opfab.utils.getTranslation("buildInTemplate.taskUserCard.firstDayOfTheMonth")} <input type="checkbox" id="firstDay">   <span class="opfab-checkbox-checkmark"> </span>   </label> </td>
                        <td><label class="opfab-checkbox" style="padding-left:25px"> ${opfab.utils.getTranslation("buildInTemplate.taskUserCard.lastDayOfTheMonth")} <input type="checkbox" id="lastDay">   <span class="opfab-checkbox-checkmark"> </span>   </label> </td>
                        <td style="width: 35px;font-size: 13px"> ${opfab.utils.getTranslation("buildInTemplate.taskUserCard.the")} </td>
                        <td style="width: 90px">
                            <div class="opfab-input">
                                <label> ${opfab.utils.getTranslation("buildInTemplate.taskUserCard.dayNumber")} </label>
                                <input size="1" maxlength="2" type="number" id="nthDay" min="1" max="31" oninput="if (this.value > 31) this.value = '';">
                            </div>
                        </td>
                        <td style="font-size:13px"> &nbsp; ${opfab.utils.getTranslation("buildInTemplate.taskUserCard.dayOfTheMonth")} </td>
                    </tr>
                </table>
            </div>
            <table style="width: 50%;margin-bottom: -5px;" id="nthWeekdayTable" hidden>
                <tr>
                    <td style="width: 40%">
                        <div class="opfab-multiselect" style="width: 80%">
                            <label> ${opfab.utils.getTranslation("buildInTemplate.taskUserCard.occurrenceNumber")} </label>
                            <div id="occurrence-number-select"></div>
                        </div>
                    </td>
                    <td style="width: 40%">
                        <div class="opfab-multiselect" style="width: 80%">
                            <label>  ${opfab.utils.getTranslation("buildInTemplate.taskUserCard.weekDay")} </label>
                            <div id="weekday-select"></div>
                        </div>
                    </td>
                </tr>
            </table>
            <br/>
        </div>
        
        <br/>
        <br/>
        <div>
        
            <table style="width:65%">
                <tr>
                    <td style="width:6%">
                    ${opfab.utils.getTranslation("buildInTemplate.taskUserCard.at")} :
                    </td> 
                    <td style="width:15%">
                        <div class="opfab-input">
                            <label> ${opfab.utils.getTranslation("buildInTemplate.taskUserCard.time")} </label>
                            <input type="time" id="time" style="text-align:center" value=${this.view.getByHourAndMinutes()} >
                        </div>
                    </td>
        
                    <td style="width:6%">
            
                    </td>
                    <td style="width:22%">
                        <div class="opfab-input">
                            <label> ${opfab.utils.getTranslation("buildInTemplate.taskUserCard.taskDuration")} </label>
                            <input maxlength="3" type="text" oninput="this.value = this.value.replace(/[^0-9]/g, '')" 
                            id="durationInMinutes" value=${this.view.getDurationInMinutes(15)}>
                        </div>
                    </td>
                    <td style="width:6%">
            
                    </td>
                    <td style="width:30%">
                        <div class="opfab-input">
                            <label> ${opfab.utils.getTranslation("buildInTemplate.taskUserCard.minutesForReminder")} </label>
                            <input type="text" maxlength="3" oninput="this.value = this.value.replace(/[^0-9]/g, '')"
                             id="minutesForReminder" value=${this.view.getMinutesForReminder(5)}>
                        </div>
                    </td>
                </tr>
            </table>
        
        </div>
        <br/>
        `;

        this.initMultiSelects();
        this.initSeverity();
        this.initEventListeners();
        this.initInitialDates();
        this.initTimeForRecurrence();
        this.doWeHaveToDisplayMonthlyFreqInEditMode();
        this.checkIsAllDaysSelected();
        this.checkIsAllMonthsSelected();
        this.selectAllDaysIfInCreateMode();
        this.selectAllMonthsIfInCreateMode();
    }

    displayDailyFrequency() {
        (<HTMLInputElement>document.getElementById("radioButtonMonthlyFreq")).checked = false;
        document.getElementById("daysOfWeek").hidden = false;
        document.getElementById("dayPositionInTheMonth").hidden = true;
        document.getElementById("monthsCheckboxesForMonthlyFreq").hidden = true;
        document.getElementById("monthsCheckboxesForDailyFreq").hidden = false;
        this.checkIsAllMonthsSelected();
    }

    displayMonthlyFrequency() {
        (<HTMLInputElement>document.getElementById("radioButtonDailyFreq")).checked = false;
        (<HTMLInputElement>document.getElementById("radioButtonMonthlyFreq")).checked = true;
        document.getElementById("daysOfWeek").hidden = true;
        document.getElementById("monthsCheckboxesForDailyFreq").hidden = true;
        document.getElementById("monthsCheckboxesForMonthlyFreq").hidden = false;
        document.getElementById("dayPositionInTheMonth").hidden = false;
        this.checkIsAllMonthsSelected();

        if ((opfab.currentUserCard.getEditionMode() === 'CREATE') && (this.hasMonthlyFreqAlreadyBeenDisplayedInCreateMode === false)) {
            this.hasMonthlyFreqAlreadyBeenDisplayedInCreateMode = true;
            this.selectAllMonthsIfInCreateMode();
        }
    }

    displayNthDayTable() {
        (<HTMLInputElement>document.getElementById("radioButtonNthWeekday")).checked = false;
        (<HTMLInputElement>document.getElementById("radioButtonNthDay")).checked = true;
        document.getElementById("nthWeekdayTable").hidden = true;
        document.getElementById("nthDayTable").hidden = false;
    }

    displayNthWeekdayTable() {
        (<HTMLInputElement>document.getElementById("radioButtonNthDay")).checked = false;
        (<HTMLInputElement>document.getElementById("radioButtonNthWeekday")).checked = true;
        document.getElementById("nthDayTable").hidden = true;
        document.getElementById("nthWeekdayTable").hidden = false;
    }



    initMultiSelects() {
        this.occurrenceNumberSelect = opfab.multiSelect.init({
            id: "occurrence-number-select",
            options : [
                { label: opfab.utils.getTranslation('buildInTemplate.taskCard.first'), value: 1 },
                { label: opfab.utils.getTranslation('buildInTemplate.taskCard.second'), value: 2 },
                { label: opfab.utils.getTranslation('buildInTemplate.taskCard.third'), value: 3 },
                { label: opfab.utils.getTranslation('buildInTemplate.taskCard.fourth'), value: 4},
                { label: opfab.utils.getTranslation('buildInTemplate.taskCard.last'), value: -1 }
            ],
            multiple: true,
            search: true
        });

        this.weekdaySelect = opfab.multiSelect.init({
            id: "weekday-select",
            options : [
                { label: '', value: ''},    //to clear the selection
                { label: opfab.utils.getTranslation('shared.calendar.monday'), value: 'MO' },
                { label: opfab.utils.getTranslation('shared.calendar.tuesday'), value: 'TU' },
                { label: opfab.utils.getTranslation('shared.calendar.wednesday'), value: 'WE' },
                { label: opfab.utils.getTranslation('shared.calendar.thursday'), value: 'TH'},
                { label: opfab.utils.getTranslation('shared.calendar.friday'), value: 'FR' },
                { label: opfab.utils.getTranslation('shared.calendar.saturday'), value: 'SA'},
                { label: opfab.utils.getTranslation('shared.calendar.sunday'), value: 'SU' }
            ],
            multiple: false,
            search: true
        });
    }

    doWeHaveToDisplayMonthlyFreqInEditMode() {
        const freq = this.view.getFrequency();

        if (freq === 'MONTHLY') {
            this.displayMonthlyFrequency();
            if (opfab.currentUserCard.getEditionMode() !== 'CREATE') {
                this.selectValuesInEditModeForMonthlyFreq();
            }
        } else if (opfab.currentUserCard.getEditionMode() !== 'CREATE') {
            this.selectValuesInEditModeForDailyFreq();
        }
    }

    selectAllDaysIfInCreateMode() {
        if (opfab.currentUserCard.getEditionMode() === 'CREATE') {
            (<HTMLInputElement>document.getElementById("selectAllDays")).click();
        }
    }

    selectAllMonthsIfInCreateMode() {
        if (opfab.currentUserCard.getEditionMode() === 'CREATE') {
            (<HTMLInputElement>document.getElementById("selectAllMonths")).click();
        }
    }

    selectValuesInEditModeForDailyFreq() {
        const byweekday = this.view.getWeekDay();
        const bymonth = this.view.getMonth();

        if (byweekday) {
            this.checkWeekDay(byweekday);
        }

        if (bymonth) {
            this.checkMonthDaily(bymonth);
        }
    }

    checkWeekDay(byweekday) {
        if (byweekday.includes('MO')) (<HTMLInputElement>document.getElementById("Monday")).checked = true;
        if (byweekday.includes('TU')) (<HTMLInputElement>document.getElementById("Tuesday")).checked = true;
        if (byweekday.includes('WE')) (<HTMLInputElement>document.getElementById("Wednesday")).checked = true;
        if (byweekday.includes('TH')) (<HTMLInputElement>document.getElementById("Thursday")).checked = true;
        if (byweekday.includes('FR')) (<HTMLInputElement>document.getElementById("Friday")).checked = true;
        if (byweekday.includes('SA')) (<HTMLInputElement>document.getElementById("Saturday")).checked = true;
        if (byweekday.includes('SU')) (<HTMLInputElement>document.getElementById("Sunday")).checked = true;
    }

    checkMonthDaily(bymonth) {
        if (bymonth.includes(1))  (<HTMLInputElement>document.getElementById("JanuaryDaily")).checked = true;
        if (bymonth.includes(2))  (<HTMLInputElement>document.getElementById("FebruaryDaily")).checked = true;
        if (bymonth.includes(3))  (<HTMLInputElement>document.getElementById("MarchDaily")).checked = true;
        if (bymonth.includes(4))  (<HTMLInputElement>document.getElementById("AprilDaily")).checked = true;
        if (bymonth.includes(5))  (<HTMLInputElement>document.getElementById("MayDaily")).checked = true;
        if (bymonth.includes(6))  (<HTMLInputElement>document.getElementById("JuneDaily")).checked = true;
        if (bymonth.includes(7))  (<HTMLInputElement>document.getElementById("JulyDaily")).checked = true;
        if (bymonth.includes(8))  (<HTMLInputElement>document.getElementById("AugustDaily")).checked = true;
        if (bymonth.includes(9))  (<HTMLInputElement>document.getElementById("SeptemberDaily")).checked = true;
        if (bymonth.includes(10)) (<HTMLInputElement>document.getElementById("OctoberDaily")).checked = true;
        if (bymonth.includes(11)) (<HTMLInputElement>document.getElementById("NovemberDaily")).checked = true;
        if (bymonth.includes(12)) (<HTMLInputElement>document.getElementById("DecemberDaily")).checked = true;
    }

    selectValuesInEditModeForMonthlyFreq() {
        const bysetpos = this.view.getSetPos();
        const byweekday = this.view.getWeekDay();
        const bymonthday = this.view.getMonthDay();
        const bymonth = this.view.getMonth();

        if (!!bysetpos && bysetpos.length > 0 && !!byweekday && byweekday.length > 0) {
            this.occurrenceNumberSelect.setSelectedValues(bysetpos);
            this.weekdaySelect.setSelectedValues(byweekday);
            this.displayNthWeekdayTable();
        } else {
            if (bymonthday) {
                for (const monthday of bymonthday) {
                    switch (monthday) {
                        case "1" :
                            (<HTMLInputElement>document.getElementById("firstDay")).checked = true;
                            break;
                        case "-1" :
                            (<HTMLInputElement>document.getElementById("lastDay")).checked = true;
                            break;
                        default :
                            (<HTMLInputElement>document.getElementById("nthDay")).value = monthday;
                    }
                }
            }
            this.displayNthDayTable();
        }
        this.checkMonths(bymonth);

    }
    checkMonths(bymonth) {
        if (bymonth.includes(1))  (<HTMLInputElement>document.getElementById("JanuaryMonthly")).checked = true;
        if (bymonth.includes(2))  (<HTMLInputElement>document.getElementById("FebruaryMonthly")).checked = true;
        if (bymonth.includes(3))  (<HTMLInputElement>document.getElementById("MarchMonthly")).checked = true;
        if (bymonth.includes(4))  (<HTMLInputElement>document.getElementById("AprilMonthly")).checked = true;
        if (bymonth.includes(5))  (<HTMLInputElement>document.getElementById("MayMonthly")).checked = true;
        if (bymonth.includes(6))  (<HTMLInputElement>document.getElementById("JuneMonthly")).checked = true;
        if (bymonth.includes(7))  (<HTMLInputElement>document.getElementById("JulyMonthly")).checked = true;
        if (bymonth.includes(8))  (<HTMLInputElement>document.getElementById("AugustMonthly")).checked = true;
        if (bymonth.includes(9))  (<HTMLInputElement>document.getElementById("SeptemberMonthly")).checked = true;
        if (bymonth.includes(10)) (<HTMLInputElement>document.getElementById("OctoberMonthly")).checked = true;
        if (bymonth.includes(11)) (<HTMLInputElement>document.getElementById("NovemberMonthly")).checked = true;
        if (bymonth.includes(12)) (<HTMLInputElement>document.getElementById("DecemberMonthly")).checked = true;
    }

    initSeverity() {
        opfab.currentUserCard.setInitialSeverity('ACTION');
    }

    initEventListeners() {
        const that = this;
        document.querySelector('#radioButtonDailyFreq').addEventListener("click", function() {that.displayDailyFrequency();});
        document.querySelector('#radioButtonMonthlyFreq').addEventListener("click", function() {that.displayMonthlyFrequency();});

        document.querySelector('#selectAllDays').addEventListener("click", function() {that.toggleSelectAllDays();});
        document.querySelector('#weekdaysCheckboxes').addEventListener("click", function() {that.checkIsAllDaysSelected();});

        document.querySelector('#selectAllMonths').addEventListener("click", function() {that.toggleSelectAllMonths();});
        document.querySelector('#monthsCheckboxes').addEventListener("click", function() {that.checkIsAllMonthsSelected();});

        document.querySelector('#radioButtonNthDay').addEventListener("click", function() {that.displayNthDayTable();});
        document.querySelector('#radioButtonNthWeekday').addEventListener("click", function() {that.displayNthWeekdayTable();});
    }

    initInitialDates() {
        const mystartDate = new Date();
        opfab.currentUserCard.setInitialStartDate(mystartDate.getTime());
        opfab.currentUserCard.setInitialEndDate(mystartDate.getTime() + 7 * 24 * 3600000);
    }

    initTimeForRecurrence() {
        const defaultTimeForRecurrence = new Date();
        defaultTimeForRecurrence.setTime(defaultTimeForRecurrence.getTime() + 3600000);

        const timeControl = <HTMLInputElement>document.getElementById('time');
        if (! timeControl.value) {
            timeControl.value = defaultTimeForRecurrence.getHours() + ':' + defaultTimeForRecurrence.getMinutes();
        }
    }

    getSpecificCardInformation() {
        const time = (<HTMLInputElement>document.getElementById('time')).value;
        const durationInMinutes =  (<HTMLInputElement>document.getElementById('durationInMinutes')).value;
        const minutesForReminder =  (<HTMLInputElement>document.getElementById('minutesForReminder')).value;
        const taskTitle = (<HTMLInputElement>document.getElementById('taskTitle')).value;
        const taskDescription = (<HTMLInputElement>document.getElementById('taskDescription')).value;

        const that = this;

        let freq = '';
        let byweekday = [];
        let bymonth = [];
        const bymonthday = [];
        let bysetpos = [];

        if ((<HTMLInputElement>document.getElementById("radioButtonMonthlyFreq")).checked === true) {
            freq = 'MONTHLY';
            bymonth = this.fetchMonths();

            if ((<HTMLInputElement>document.getElementById("radioButtonNthDay")).checked === true) {
                if ((<HTMLInputElement>document.getElementById("nthDay")).value) {
                    bymonthday.push((<HTMLInputElement>document.getElementById("nthDay")).value);
                }
                if ((<HTMLInputElement>document.getElementById("firstDay")).checked === true) {
                    bymonthday.push("1");
                }
                if ((<HTMLInputElement>document.getElementById("lastDay")).checked === true) {
                    bymonthday.push("-1");
                }

                if (bymonthday.length === 0) {
                    return {valid: false , errorMsg: opfab.utils.getTranslation('buildInTemplate.taskUserCard.youMustProvideAtLeastOneNthDay')};
                }
            }

            if ((<HTMLInputElement>document.getElementById("radioButtonNthWeekday")).checked === true) {
                bysetpos = that.occurrenceNumberSelect.getSelectedValues();
                if (that.weekdaySelect.getSelectedValues().length > 0) {
                    byweekday = [that.weekdaySelect.getSelectedValues()];
                }

                if ((bysetpos.length === 0) || (byweekday.length === 0)) {
                    return {valid: false , errorMsg: opfab.utils.getTranslation('buildInTemplate.taskUserCard.youMustProvideAnOccurrenceNumberAndAWeekday')};
                }
            }

            if (bymonth.length === 0) {
                return {valid: false , errorMsg: opfab.utils.getTranslation('buildInTemplate.taskUserCard.youMustProvideAtLeastOneMonth')};
            }
        } else {
            freq = 'DAILY';
            byweekday = this.fetchWeekDay();
            bymonth = this.fetchMonthDaily();

            if (byweekday.length === 0) {
                return {valid: false , errorMsg: opfab.utils.getTranslation('buildInTemplate.taskUserCard.youMustProvideAtLeastOneWeekday')};
            }

            if (bymonth.length === 0) {
                return {valid: false , errorMsg: opfab.utils.getTranslation('buildInTemplate.taskUserCard.youMustProvideAtLeastOneMonth')};
            }
        }

        return this.view.getSpecificCardInformation(taskTitle, taskDescription, freq, durationInMinutes, minutesForReminder, byweekday, bymonth, bysetpos, bymonthday, time);
    }

    fetchMonths() {
        const bymonth = [];
        if ((<HTMLInputElement>document.getElementById("JanuaryMonthly")).checked)   bymonth.push(1);
        if ((<HTMLInputElement>document.getElementById("FebruaryMonthly")).checked)  bymonth.push(2);
        if ((<HTMLInputElement>document.getElementById("MarchMonthly")).checked)     bymonth.push(3);
        if ((<HTMLInputElement>document.getElementById("AprilMonthly")).checked)     bymonth.push(4);
        if ((<HTMLInputElement>document.getElementById("MayMonthly")).checked)       bymonth.push(5);
        if ((<HTMLInputElement>document.getElementById("JuneMonthly")).checked)      bymonth.push(6);
        if ((<HTMLInputElement>document.getElementById("JulyMonthly")).checked)      bymonth.push(7);
        if ((<HTMLInputElement>document.getElementById("AugustMonthly")).checked)    bymonth.push(8);
        if ((<HTMLInputElement>document.getElementById("SeptemberMonthly")).checked) bymonth.push(9);
        if ((<HTMLInputElement>document.getElementById("OctoberMonthly")).checked)   bymonth.push(10);
        if ((<HTMLInputElement>document.getElementById("NovemberMonthly")).checked)  bymonth.push(11);
        if ((<HTMLInputElement>document.getElementById("DecemberMonthly")).checked)  bymonth.push(12);

        return bymonth;
    }
    fetchWeekDay() {
        const byweekday = [];
        if ((<HTMLInputElement>document.getElementById("Monday")).checked)    byweekday.push('MO');
        if ((<HTMLInputElement>document.getElementById("Tuesday")).checked)   byweekday.push('TU');
        if ((<HTMLInputElement>document.getElementById("Wednesday")).checked) byweekday.push('WE');
        if ((<HTMLInputElement>document.getElementById("Thursday")).checked)  byweekday.push('TH');
        if ((<HTMLInputElement>document.getElementById("Friday")).checked)    byweekday.push('FR');
        if ((<HTMLInputElement>document.getElementById("Saturday")).checked)  byweekday.push('SA');
        if ((<HTMLInputElement>document.getElementById("Sunday")).checked)    byweekday.push('SU');

        return byweekday;
    }
    fetchMonthDaily() {
        const bymonth = [];
        if ((<HTMLInputElement>document.getElementById("JanuaryDaily")).checked)   bymonth.push(1);
        if ((<HTMLInputElement>document.getElementById("FebruaryDaily")).checked)  bymonth.push(2);
        if ((<HTMLInputElement>document.getElementById("MarchDaily")).checked)     bymonth.push(3);
        if ((<HTMLInputElement>document.getElementById("AprilDaily")).checked)     bymonth.push(4);
        if ((<HTMLInputElement>document.getElementById("MayDaily")).checked)       bymonth.push(5);
        if ((<HTMLInputElement>document.getElementById("JuneDaily")).checked)      bymonth.push(6);
        if ((<HTMLInputElement>document.getElementById("JulyDaily")).checked)      bymonth.push(7);
        if ((<HTMLInputElement>document.getElementById("AugustDaily")).checked)    bymonth.push(8);
        if ((<HTMLInputElement>document.getElementById("SeptemberDaily")).checked) bymonth.push(9);
        if ((<HTMLInputElement>document.getElementById("OctoberDaily")).checked)   bymonth.push(10);
        if ((<HTMLInputElement>document.getElementById("NovemberDaily")).checked)  bymonth.push(11);
        if ((<HTMLInputElement>document.getElementById("DecemberDaily")).checked)  bymonth.push(12);

        return bymonth;
    }


    checkIsAllDaysSelected() {
        (<HTMLInputElement>document.getElementById("selectAllDays")).checked = this.isAllDaysSelected();
    }

    isAllDaysSelected() {
        for (const day of this.daysArray) {
            if (!(<HTMLInputElement>document.getElementById(day)).checked)
                return false;
        }
        return true;
    }

    toggleSelectAllDays() {
        if (this.isAllDaysSelected()) { // we unselect all
            for (const day of this.daysArray) {
                document.getElementById(day).click();
            }
        } else { // we select all
            for (const day of this.daysArray) {
                if (!(<HTMLInputElement>document.getElementById(day)).checked) document.getElementById(day).click();
            }
        }
    }

    checkIsAllMonthsSelected() {
        (<HTMLInputElement>document.getElementById("selectAllMonths")).checked = this.isAllMonthsSelected();
    }

    isAllMonthsSelected() {
        if (document.getElementById("monthsCheckboxesForMonthlyFreq").hidden === true) { // Daily frequency
            for (const month of this.monthsArrayDaily) {
                if (!(<HTMLInputElement>document.getElementById(month)).checked)
                    return false;
            }
        } else { // Monthly frequency
            for (const month of this.monthsArrayMonthly) {
                if (!(<HTMLInputElement>document.getElementById(month)).checked)
                    return false;
            }
        }
        return true;
    }

    toggleSelectAllMonths() {
        if (this.isAllMonthsSelected()) { // unselect all
            if (document.getElementById("monthsCheckboxesForMonthlyFreq").hidden === true) { // Daily frequency
                for (const month of this.monthsArrayDaily) {
                    document.getElementById(month).click();
                }
            } else { // Monthly frequency
                for (const month of this.monthsArrayMonthly) {
                    document.getElementById(month).click();
                }
            }
        } else if (document.getElementById("monthsCheckboxesForMonthlyFreq").hidden === true) { // select all
               // Daily frequency
                for (const month of this.monthsArrayDaily) {
                    if (!(<HTMLInputElement>document.getElementById(month)).checked) document.getElementById(month).click();
                }
        }  else { // Monthly frequency
            for (const month of this.monthsArrayMonthly) {
                if (!(<HTMLInputElement>document.getElementById(month)).checked) document.getElementById(month).click();
            }
        }
    }

}
