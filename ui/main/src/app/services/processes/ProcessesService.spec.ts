/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ProcessesService} from './ProcessesService';
import {Process} from '@ofServices/processes/model/Processes';
import {ProcessesServerMock} from '@tests/mocks/processesServer.mock';
import {ServerResponse, ServerResponseStatus} from '../../business/server/serverResponse';

describe('Processes Services', () => {
    let processesServerMock: ProcessesServerMock;

    beforeEach(() => {
        processesServerMock = new ProcessesServerMock();
        ProcessesService.setProcessServer(processesServerMock);
    });

    describe('Query a process', () => {
        it('GIVEN an existing process WHEN query the process THEN process is returned', () => {
            const processDefinition = new Process('testPublisher', '0', 'businessconfig.label');
            const serverResponse = new ServerResponse<Process>(processDefinition, null, null);
            processesServerMock.setResponseForProcessDefinition(serverResponse);
            ProcessesService.queryProcess('testPublisher', '0').subscribe((result) =>
                expect(result).toEqual(processDefinition)
            );
        });

        it('GIVEN a non-existing process WHEN query the process THEN null is returned', () => {
            const serverResponse = new ServerResponse<Process>(null, ServerResponseStatus.NOT_FOUND, null);
            processesServerMock.setResponseForProcessDefinition(serverResponse);
            ProcessesService.queryProcess('testPublisher', '0').subscribe((result) => expect(result).toEqual(null));
        });
    });
});
