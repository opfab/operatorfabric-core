/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ProcessesService} from './processes.service';
import {getRandomAlphanumericValue} from '@tests/helpers';
import {Process} from '@ofModel/processes.model';
import {ConfigServerMock} from '@tests/mocks/configServer.mock';
import {ProcessServerMock} from '@tests/mocks/processServer.mock';
import {ServerResponse, ServerResponseStatus} from '../server/serverResponse';

describe('Processes Services', () => {
    let processesService: ProcessesService;
    let processServerMock: ProcessServerMock;
    let configServerMock: ConfigServerMock;

    beforeEach(() => {
        processServerMock = new ProcessServerMock();
        configServerMock = new ConfigServerMock();
        processesService = new ProcessesService(null, processServerMock, configServerMock);
    });

    it('should compute url with encoding special characters', () => {
        const urlFromPublishWithSpaces = processesService.computeBusinessconfigCssUrl(
            'publisher with spaces',
            getRandomAlphanumericValue(3, 12),
            getRandomAlphanumericValue(2.5)
        );
        expect(urlFromPublishWithSpaces.includes(' ')).toEqual(false);
        const dico = new Map();
        dico.set('À', '%C3%80');
        dico.set('à', '%C3%A0');
        dico.set('É', '%C3%89');
        dico.set('é', '%C3%A9');
        dico.set('È', '%C3%88');
        dico.set('è', '%C3%A8');
        dico.set('Â', '%C3%82');
        dico.set('â', '%C3%A2');
        dico.set('Ô', '%C3%94');
        dico.set('ô', '%C3%B4');
        dico.set('Ù', '%C3%99');
        dico.set('ù', '%C3%B9');
        dico.set('Ï', '%C3%8F');
        dico.set('ï', '%C3%AF');
        let stringToTest = '';
        for (const char of dico.keys()) {
            stringToTest += char;
        }
        const urlFromPublishWithAccentuatedChar = processesService.computeBusinessconfigCssUrl(
            `publisherWith${stringToTest}`,
            getRandomAlphanumericValue(3, 12),
            getRandomAlphanumericValue(3, 4)
        );
        dico.forEach((value, key) => {
            expect(urlFromPublishWithAccentuatedChar.includes(key)).toEqual(false);
            // `should normally contain '${value}'`
            expect(urlFromPublishWithAccentuatedChar.includes(value)).toEqual(true);
        });
        const urlWithSpacesInVersion = processesService.computeBusinessconfigCssUrl(
            getRandomAlphanumericValue(5, 12),
            getRandomAlphanumericValue(5.12),
            'some spaces in version'
        );
        expect(urlWithSpacesInVersion.includes(' ')).toEqual(false);

        const urlWithAccentuatedCharsInVersion = processesService.computeBusinessconfigCssUrl(
            getRandomAlphanumericValue(5, 12),
            getRandomAlphanumericValue(5.12),
            `${stringToTest}InVersion`
        );
        dico.forEach((value, key) => {
            expect(urlWithAccentuatedCharsInVersion.includes(key)).toEqual(false);
            // `should normally contain '${value}'`
            expect(urlWithAccentuatedCharsInVersion.includes(value)).toEqual(true);
        });
    });

    describe('Query a process', () => {
        it('GIVEN an existing process WHEN query the process THEN process is returned', () => {
            const processDefinition = new Process('testPublisher', '0', 'businessconfig.label');
            const serverResponse = new ServerResponse<Process>(processDefinition, null, null);
            processServerMock.setResponseForProcessDefinition(serverResponse);
            processesService
                .queryProcess('testPublisher', '0')
                .subscribe((result) => expect(result).toEqual(processDefinition));
        });

        it('GIVEN a non-existing process WHEN query the process THEN null is returned', () => {
            const serverResponse = new ServerResponse<Process>(null, ServerResponseStatus.NOT_FOUND, null);
            processServerMock.setResponseForProcessDefinition(serverResponse);
            processesService
                .queryProcess('testPublisher', '0')
                .subscribe((result) => expect(result).toEqual(null));
        });
    });
});
