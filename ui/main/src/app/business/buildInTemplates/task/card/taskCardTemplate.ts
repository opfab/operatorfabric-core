/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {TaskCardTemplateView} from './taskCardTemplateView';

declare const opfab;

export class TaskCardTemplate extends HTMLElement {
    private taskCardTemplateView: TaskCardTemplateView;

    constructor() {
        super();
        this.taskCardTemplateView = new TaskCardTemplateView();
        this.setHTMLContent();
        this.fetchCardData();
    }

    private setHTMLContent() {
        this.innerHTML = `

        <h2> You have the following task to do  :  </h2>
        <br/>
        <br/>
        <center>
        <h3 >

        ${this.taskCardTemplateView.getTaskDescription()}

        <br/>
        Duration: ${this.taskCardTemplateView.getDurationInMinutes()} minutes<br/>
        <br/> 

        At ${this.taskCardTemplateView.getByHour()}:${this.taskCardTemplateView.getByMinute()}
        <span id="bysetpos"></span><span id="byweekday"></span><br/>
        <br/>
        <span id="bymonthday"></span>
        <span id="bymonth"></span>

        </h3>
        </center>

        `;
    }

        fetchCardData() {
              

              let fillingTexts = this.taskCardTemplateView.fillTexts();

              document.getElementById("bysetpos").innerHTML = fillingTexts?.textForBysetpos;
              document.getElementById("byweekday").innerHTML = fillingTexts?.textForByweekday;
              document.getElementById("bymonthday").innerHTML = fillingTexts?.textForBymonthday;
              document.getElementById("bymonth").innerHTML = fillingTexts?.textForBymonth;

        }
  }

