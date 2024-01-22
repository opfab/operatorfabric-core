/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import 'jest';
import fs from 'fs';
import {loadTestBundle} from './helper';
import {BusinessConfigService} from '../src/domain/client-side/businessConfigService';
import {ResponseReturnCode} from '../src/domain/client-side/serviceResponse';

fdescribe('delete bundle', function () {
    let tempStoragePath = '';
    beforeEach(() => {
        tempStoragePath = 'tmp/storage' + Math.random();
        if (!fs.existsSync(tempStoragePath)) {
            fs.mkdirSync(tempStoragePath);
        }
    });

    afterEach(() => {
        fs.rmSync(tempStoragePath, {recursive: true, force: true});
    });

    it('delete all versions of a process', async function () {
        const bundle = loadTestBundle(1);
        const businessConfigService = new BusinessConfigService(tempStoragePath);
        await businessConfigService.postResource('processes', bundle, ['ADMIN']);
        const bundleV2 = loadTestBundle(2);
        await businessConfigService.postResource('processes', bundleV2, ['ADMIN']);
        const result = await businessConfigService.deleteResource('processes/testProcess');
        expect(result.returnCode).toBe(ResponseReturnCode.OK);
        expect(businessConfigService.getResource('processes/testProcess', undefined, ['']).returnCode).toBe(
            ResponseReturnCode.NOT_FOUND
        );
        const reloadService = new BusinessConfigService(tempStoragePath);
        expect(reloadService.getResource('processes/testProcess', undefined, ['']).returnCode).toBe(
            ResponseReturnCode.NOT_FOUND
        );
    });

    it('delete a specific version of a process', async function () {
        const bundle = loadTestBundle(1);
        const businessConfigService = new BusinessConfigService(tempStoragePath);
        await businessConfigService.postResource('processes', bundle, ['ADMIN']);
        const bundleV2 = loadTestBundle(2);
        await businessConfigService.postResource('processes', bundleV2, ['ADMIN']);
        const result = await businessConfigService.deleteResource('processes/testProcess/versions/1');
        expect(result.returnCode).toBe(ResponseReturnCode.OK);
        expect(businessConfigService.getResource('processes/testProcess', '1', ['']).returnCode).toBe(
            ResponseReturnCode.NOT_FOUND
        );
        expect (businessConfigService.getResource('processes/testProcess', '2', ['']).returnCode).toBe(
            ResponseReturnCode.OK
        );
        expect(businessConfigService.getResource('processes/testProcess', undefined, ['']).response.version).toBe('2');
        const reloadService = new BusinessConfigService(tempStoragePath);
        expect(reloadService.getResource('processes/testProcess', '1', ['']).returnCode).toBe(
            ResponseReturnCode.NOT_FOUND
        );
        expect(reloadService.getResource('processes/testProcess', '2', ['']).returnCode).toBe(
            ResponseReturnCode.OK
        );
        expect(reloadService.getResource('processes/testProcess', undefined, ['']).response.version).toBe('2');
    });

    
    it('delete a specific version of a process with only one version', async function () {
        const bundle = loadTestBundle(1);
        const businessConfigService = new BusinessConfigService(tempStoragePath);
        await businessConfigService.postResource('processes', bundle, ['ADMIN']);
        const result = await businessConfigService.deleteResource('processes/testProcess/versions/1');
        expect(result.returnCode).toBe(ResponseReturnCode.OK);
        expect(businessConfigService.getResource('processes/testProcess', '1', ['']).returnCode).toBe(
            ResponseReturnCode.NOT_FOUND
        );
        expect (businessConfigService.getResource('processes/testProcess',undefined, ['']).returnCode).toBe(
            ResponseReturnCode.NOT_FOUND    
        );
        const reloadService = new BusinessConfigService(tempStoragePath);
        expect(reloadService.getResource('processes/testProcess', '1', ['']).returnCode).toBe(
            ResponseReturnCode.NOT_FOUND
        );
        expect(reloadService.getResource('processes/testProcess',undefined, ['']).returnCode).toBe(
            ResponseReturnCode.NOT_FOUND
        );
    });
    
    it('delete version 2 of a process , should get config.json form version 1', async function () {
        const bundle = loadTestBundle(1);
        const businessConfigService = new BusinessConfigService(tempStoragePath);
        await businessConfigService.postResource('processes', bundle, ['ADMIN']);
        const bundleV2 = loadTestBundle(2);
        await businessConfigService.postResource('processes', bundleV2, ['ADMIN']);
        const result = await businessConfigService.deleteResource('processes/testProcess/versions/2');
        expect(result.returnCode).toBe(ResponseReturnCode.OK);
        expect(businessConfigService.getResource('processes/testProcess', undefined, ['']).response.version).toBe('1');
        const reloadService = new BusinessConfigService(tempStoragePath);
        expect(reloadService.getResource('processes/testProcess', undefined, ['']).response.version).toBe('1');
    });
    

    it('delete version 3 of a process from disk, should get config.json form version 2', async function () {
        const bundle = loadTestBundle(1);
        const businessConfigService = new BusinessConfigService(tempStoragePath);
        await businessConfigService.postResource('processes', bundle, ['ADMIN']);
        const bundleV2 = loadTestBundle(2);
        await businessConfigService.postResource('processes', bundleV2, ['ADMIN']);
        const bundleV3 = loadTestBundle(3);
        await businessConfigService.postResource('processes', bundleV3, ['ADMIN']);
        const result = await businessConfigService.deleteResource('processes/testProcess/versions/3');
        expect(result.returnCode).toBe(ResponseReturnCode.OK);
        expect(businessConfigService.getResource('processes/testProcess', undefined, ['']).response.version).toBe('2');
        const reloadService = new BusinessConfigService(tempStoragePath);
        expect(reloadService.getResource('processes/testProcess', undefined, ['']).response.version).toBe('2');

    });
});
