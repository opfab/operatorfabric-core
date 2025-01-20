/* Copyright (c) 2024-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {UserCardUIControlMock} from '@tests/userCardView/userCardUIControlMock';
import {SeverityForm} from './severityForm';
import {getOneCard, initOpfabAPI, setProcessConfiguration} from '@tests/helpers';
import {State} from '@ofServices/processes/model/Processes';
import {Severity} from 'app/model/Severity';

declare const opfab: any;

async function setProcessConfigWithUserCardConfig(userCardConfig) {
    await setProcessConfiguration([
        {
            id: 'process1',
            version: 'v1',
            name: 'process name 1',
            states: new Map<string, State>([['state1_1', {name: 'State 1_1', userCard: userCardConfig}]])
        }
    ]);
}

describe('UserCard SeverityForm', () => {
    let userCardSeverity: SeverityForm;
    let userCardUIControl: UserCardUIControlMock;
    beforeEach(() => {
        userCardUIControl = new UserCardUIControlMock();
        userCardSeverity = new SeverityForm(userCardUIControl);
        initOpfabAPI();
    });

    it(`Severity visibility should be set to true if severity visibility set visible in state configuration`, async () => {
        await setProcessConfigWithUserCardConfig({severityVisible: true});
        userCardSeverity.init('process1', 'state1_1');
        expect(userCardSeverity.isSeverityVisible()).toEqual(true);
        expect(userCardUIControl.inputVisibility_FctCalls['severity']).toEqual(true);
    });
    it(`Severity visibility should be set to false if severity visibility set invisible in state configuration`, async () => {
        await setProcessConfigWithUserCardConfig({severityVisible: false});
        userCardSeverity.init('process1', 'state1_1');
        expect(userCardSeverity.isSeverityVisible()).toEqual(false);
        expect(userCardUIControl.inputVisibility_FctCalls['severity']).toEqual(false);
    });
    it(`Severity visibility should be set to true if severity visibility is not defined in state configuration`, async () => {
        await setProcessConfigWithUserCardConfig({});
        userCardSeverity.init('process1', 'state1_1');
        expect(userCardUIControl.inputVisibility_FctCalls['severity']).toEqual(true);
    });
    it('Severity should be set to ALARM by default', async () => {
        await setProcessConfigWithUserCardConfig({});
        userCardSeverity.init('process1', 'state1_1');
        expect(userCardUIControl.severity).toEqual(Severity.ALARM);
        expect(userCardSeverity.getSelectedSeverity()).toEqual(Severity.ALARM);
    });
    it('Severity should be set to Card severity if edition or copy mode', async () => {
        await setProcessConfigWithUserCardConfig({});
        const card = getOneCard({severity: 'INFORMATION'});
        userCardSeverity.init('process1', 'state1_1', card);
        expect(userCardUIControl.severity).toEqual(Severity.INFORMATION);
        expect(userCardSeverity.getSelectedSeverity()).toEqual(Severity.INFORMATION);
    });
    it('Should set severity to value set by template via opfab.currentUserCard.setInitialSeverity ', async () => {
        await setProcessConfigWithUserCardConfig({});
        opfab.currentUserCard.setInitialSeverity('COMPLIANT');
        userCardSeverity.init('process1', 'state1_1');
        expect(userCardUIControl.severity).toEqual(Severity.COMPLIANT);
        expect(userCardSeverity.getSelectedSeverity()).toEqual(Severity.COMPLIANT);
    });
    it('Should set selected severity when user selects severity', async () => {
        await setProcessConfigWithUserCardConfig({});
        userCardSeverity.init('process1', 'state1_1');
        userCardSeverity.userSelectsSeverity(Severity.INFORMATION);
        expect(userCardSeverity.getSelectedSeverity()).toEqual(Severity.INFORMATION);
    });
});
