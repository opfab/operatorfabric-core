/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Card} from '@ofModel/card.model';
import {InputFieldName, UserCardUIControl} from '../userCard.model';
import {ProcessesService} from 'app/business/services/businessconfig/processes.service';
import {Severity} from '@ofModel/light-card.model';
import {OpfabAPIService} from 'app/business/services/opfabAPI.service';

export class SeverityForm {
    private selectedSeverity: Severity;
    private severityVisible: boolean;

    constructor(private userCardUIControl: UserCardUIControl) {}

    public setProcessAndState(processId: string, stateId: string, card: Card = undefined) {
        const state = ProcessesService.getProcess(processId).states.get(stateId);
        if (state) {
            this.severityVisible = state.userCard?.severityVisible ?? true;
            this.userCardUIControl.setInputVisibility(InputFieldName.Severity, this.severityVisible);
        }
        this.selectedSeverity = card?.severity ?? OpfabAPIService.currentUserCard.initialSeverity ?? Severity.ALARM;
        this.userCardUIControl.setSeverity(this.selectedSeverity);
    }

    public getSelectedSeverity(): Severity {
        return this.selectedSeverity;
    }

    public isSeverityVisible(): boolean {
        return this.severityVisible;
    }

    public userSelectsSeverity(severity: Severity) {
        this.selectedSeverity = severity;
    }
}
