/* Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {TaskCardTemplateView} from './TaskCardTemplateView';

declare const opfab;

export class TaskCardTemplate extends HTMLElement {
    private readonly taskCardTemplateView: TaskCardTemplateView;

    constructor() {
        super();
        this.taskCardTemplateView = new TaskCardTemplateView();
        this.setHTMLContent();
        this.fetchCardData();
    }

    private setHTMLContent() {
        this.innerHTML = `

        <h2> ${opfab.utils.getTranslation('builtInTemplate.taskCard.taskToDo')} :  </h2>
        <br/>
        <br/>
        <center>
        <h3 >
        <div id="taskRichTextDescription" style="text-align: justify;font-size: 24px">
        ${this.taskCardTemplateView.getTaskDescription()}
        </div>

        <br/>
        ${opfab.utils.getTranslation('builtInTemplate.taskCard.duration')}: ${this.taskCardTemplateView.getDurationInMinutes()} ${opfab.utils.getTranslation('builtInTemplate.taskCard.minutes')} <br/>
        <br/> 
        ${opfab.utils.getTranslation('builtInTemplate.taskCard.at')} ${this.taskCardTemplateView.getHourAndMinutes()}
        ${this.taskCardTemplateView.getDateForCardWithoutRecurrence()}
        <span id="bysetpos"></span><span id="byweekday"></span><br/>
        <br/>
        <span id="bymonthday"></span>
        <span id="bymonth"></span>

        </h3>
        </center>

        `;
    }

    fetchCardData() {
        opfab.richTextEditor.showRichMessage(document.getElementById('taskRichTextDescription'));

        const fillingTexts = this.taskCardTemplateView.getTexts();

        document.getElementById('bysetpos').innerHTML = fillingTexts?.textForBySetPos;
        document.getElementById('byweekday').innerHTML = fillingTexts?.textForByWeekDay;
        document.getElementById('bymonthday').innerHTML = fillingTexts?.textForByMonthDay;
        document.getElementById('bymonth').innerHTML = fillingTexts?.textForByMonth;
    }
}
