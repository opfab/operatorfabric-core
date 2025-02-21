/* Copyright (c) 2024-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {State} from '@ofServices/processes/model/Processes';
import {EditionMode, InputFieldName, UserCardUIControl} from '../UserCardModel';
import {ProcessesService} from '@ofServices/processes/ProcessesService';
import {Card} from 'app/model/Card';
import {UserCardTemplateGateway} from '@ofServices/templateGateway/UserCardTemplateGateway';

export class DatesForm {
    private static readonly ONE_MINUTE = 60000;
    private static readonly ONE_DAY = 60000 * 60 * 24;

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

    private readonly dateFields = ['startDate', 'endDate', 'lttd', 'expirationDate'];

    constructor(private readonly userCardUIControl: UserCardUIControl) {}

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
                UserCardTemplateGateway[`set${field.charAt(0).toUpperCase() + field.slice(1)}`](this[field]);
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
        switch (field) {
            case 'startDate':
                return new Date().valueOf() + DatesForm.ONE_MINUTE;
            case 'lttd':
                return new Date().valueOf() + DatesForm.ONE_DAY - DatesForm.ONE_MINUTE;
            default:
                return new Date().valueOf() + DatesForm.ONE_DAY;
        }
    }

    public initDatesAfterTemplateScriptsExecution() {
        this.dateFields.forEach((field) => {
            this[field] = UserCardTemplateGateway[`get${field.charAt(0).toUpperCase() + field.slice(1)}`]();
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
        UserCardTemplateGateway[`set${inputName.charAt(0).toUpperCase() + inputName.slice(1)}`](dateSetByUser);
    }
}
