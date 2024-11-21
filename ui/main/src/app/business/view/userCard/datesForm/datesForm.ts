/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {State} from '@ofModel/processes.model';
import {EditionMode, InputFieldName, UserCardUIControl} from '../userCard.model';
import {ProcessesService} from 'app/business/services/businessconfig/processes.service';
import {Card} from '@ofModel/card.model';
import {CurrentUserCardAPI} from 'app/api/currentusercard.api';

export class DatesForm {
    private static ONE_MINUTE = 60000;
    private static ONE_DAY = 60000 * 60 * 24;

    private endDate: number;
    private endDateVisible: boolean;
    private expirationDate: number;
    private expirationDateVisible: boolean;
    private lttd: number;
    private lttdVisible: boolean;
    private processId: string;
    private startDate: number;
    private startDateVisible: boolean;
    private stateId: string;

    private dateFields = ['startDate', 'endDate', 'lttd', 'expirationDate'];

    constructor(private userCardUIControl: UserCardUIControl) {}

    public initDatesBeforeTemplateScriptsExecution(
        processId: string,
        stateId: string,
        card: Card = undefined,
        editionMode?: EditionMode
    ) {
        this.processId = processId;
        this.stateId = stateId;
        this.setAllDatesVisibility();

        this.dateFields.forEach((field) => {
            const isDateFieldVisible = this[`${field}Visible`];
            if (isDateFieldVisible) {
                if (editionMode === EditionMode.EDITION)
                    this[field] = card?.[field] ?? this.getDefaultValueForDate(field);
                else this[field] = this.getDefaultValueForDate(field);
                CurrentUserCardAPI.currentUserCard[field] = this[field];
            }
        });
    }
    private setAllDatesVisibility() {
        if (this.processId) {
            const state = ProcessesService.getProcess(this.processId).states.get(this.stateId);
            if (state) {
                this.setFieldVisibility(state, [InputFieldName.StartDate, InputFieldName.EndDate], true);
                this.setFieldVisibility(state, [InputFieldName.Lttd, InputFieldName.ExpirationDate], false);
            }
        }
    }

    private setFieldVisibility(state: State, fields: InputFieldName[], defaultVisibility: boolean) {
        fields.forEach((field) => {
            const visibilityInConfiguration = state.userCard?.[`${field}Visible`];
            this[`${field}Visible`] = visibilityInConfiguration ?? defaultVisibility;
            this.userCardUIControl.setInputVisibility(field, this[`${field}Visible`]);
        });
    }

    private getDefaultValueForDate(field: string): number {
        if (field === 'startDate') return new Date().valueOf() + DatesForm.ONE_MINUTE;
        else return new Date().valueOf() + DatesForm.ONE_DAY;
    }

    public initDatesAfterTemplateScriptsExecution() {
        this.dateFields.forEach((field) => {
            this[field] = CurrentUserCardAPI.currentUserCard[field];
            this.userCardUIControl.setDate(field as InputFieldName, this[field]);
        });
    }

    public getDateValue(inputName: InputFieldName): number {
        return this[inputName];
    }

    public isDateVisible(inputName: InputFieldName): boolean {
        return this[`${inputName}Visible`];
    }

    public userSetsDate(inputName: InputFieldName, dateSetByUser: number) {
        this[inputName] = dateSetByUser;
        CurrentUserCardAPI.currentUserCard[inputName] = dateSetByUser;
    }
}
