/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import BundleStorage from '../application/bundleStorage';
import ConfigStorage from '../application/configStorage';
import {ResourceType} from '../application/resourceType';
import {ResponseReturnCode, ServiceResponse} from './serviceResponse';

export class BusinessConfigService {
    private bundleStorage: BundleStorage;
    private configStorage: ConfigStorage;

    constructor(private storagePath: string) {
        this.bundleStorage = new BundleStorage(storagePath);
        this.configStorage = new ConfigStorage(storagePath);
    }

    getResource(resourcePath: string, version: string | undefined, userPermissions: string[]): ServiceResponse {
        if (resourcePath === 'monitoring') {
            const monitoringConfig = this.configStorage.getConfigFile('monitoring');
            return new ServiceResponse(monitoringConfig, ResponseReturnCode.OK);
        }
        if (resourcePath.startsWith('processes')) {
            let {process, resourceType, resourceName} = this.parseProcessesResourcePath(resourcePath);
            if (!resourceType) resourceType = ResourceType.CONFIG;
            if (!this.isResourceTypeIsValid(resourceType))
                return new ServiceResponse('Invalid resource type', ResponseReturnCode.BAD_REQUEST);
            const bundle = this.bundleStorage.fetchResource(
                resourceType as ResourceType,
                process,
                version,
                resourceName
            );
            if (bundle.hasError) return new ServiceResponse({}, ResponseReturnCode.NOT_FOUND);
            if (bundle.result === undefined) return new ServiceResponse({}, ResponseReturnCode.NOT_FOUND);
            return new ServiceResponse(bundle.result, ResponseReturnCode.OK);
        }
        if (resourcePath.startsWith('processhistory')) {
            let {process} = this.parseProcessesResourcePath(resourcePath);
            const bundle = this.bundleStorage.fetchResource(
                ResourceType.PROCESS_HISTORY,
                process,
                undefined,
                undefined
            );
            if (bundle.hasError)
                return new ServiceResponse(
                    `History for process with id ${process} was not found`,
                    ResponseReturnCode.NOT_FOUND
                );
            return new ServiceResponse(bundle.result, ResponseReturnCode.OK);
        }
        return new ServiceResponse({}, ResponseReturnCode.NOT_FOUND);
    }

    private isResourceTypeIsValid(resourceType: string) {
        return Object.values(ResourceType).includes(resourceType as ResourceType);
    }

    public async postResource(
        resourceName: string,
        resource: any,
        userPermissions: string[]
    ): Promise<ServiceResponse> {
        if (
            !(
                userPermissions.some((permission) => permission === 'ADMIN') ||
                userPermissions.some((permission) => permission === 'ADMIN_BUSINESS_PROCESS')
            )
        ) {
            return new ServiceResponse('Unauthorized', ResponseReturnCode.FORBIDDEN);
        }
        switch (resourceName) {
            case 'processes':
                const result = await this.bundleStorage.saveBundle(resource);
                if (result.hasError) return new ServiceResponse(result.error?.message, ResponseReturnCode.BAD_REQUEST);
                break;
            case 'monitoring':
                const operationResult = await this.configStorage.saveConfigFile(resourceName, resource);
                if (operationResult.hasError)
                    return new ServiceResponse(operationResult.error?.message, ResponseReturnCode.BAD_REQUEST);
                break;
            default:
                return new ServiceResponse({}, ResponseReturnCode.BAD_REQUEST);
        }

        return new ServiceResponse({}, ResponseReturnCode.CREATED);
    }

    private parseProcessesResourcePath(resourcePath: string): {
        process: string;
        resourceType: string;
        resourceName: string;
    } {
        const parts = resourcePath.split('/');
        const process = parts[1];
        const resourceType = parts[2];
        const resourceName = parts[3]?.split('?')[0];
        return {
            process,
            resourceType,
            resourceName
        };
    }

    public async deleteResource(resourcePath: string): Promise<ServiceResponse> {
        if (resourcePath.startsWith('processes')) {
            const {process, version} = this.parseProcessesResourcePathForDelete(resourcePath);
            if (!process) {
                return new ServiceResponse('Invalid process', ResponseReturnCode.BAD_REQUEST);
            }
            const result = this.bundleStorage.deleteBundle(process, version);
            if (result.hasError) return new ServiceResponse(result.error?.message, ResponseReturnCode.NOT_FOUND);
            return new ServiceResponse({}, ResponseReturnCode.OK);
        }
        return new ServiceResponse({}, ResponseReturnCode.NOT_FOUND);
    }

    private parseProcessesResourcePathForDelete(resourcePath: string): {
        process: string;
        version: string;
    } {
        const parts = resourcePath.split('/');
        const process = parts[1];
        const versionString = parts[2];
        const version = parts[3];
        return {
            process,
            version
        };
    }
}
