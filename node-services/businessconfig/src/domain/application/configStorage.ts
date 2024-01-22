/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {JsonValidator, monitoringSchema} from './configFileValidator';
import OperationResult from './operationResult';
import fs from 'fs';

export default class ConfigStorage {
    configFiles: Map<string, any> = new Map<string, any>();
    storagePath: string;
    private jsonValidator = new JsonValidator();

    constructor(storagePath: string) {
        this.storagePath = storagePath;
    }

    saveConfigFile(configFileName: string, config: any): OperationResult<void> {
        const validConfig = this.jsonValidator.validateJSON(config, monitoringSchema);
        if (!validConfig.valid) {
            return OperationResult.error(new Error(validConfig.errors));
        }
        const configAsString = JSON.stringify(validConfig.json);
        try {
            const filePath = `${this.storagePath}/${configFileName}.json`;
            fs.writeFileSync(filePath,configAsString);
        } catch (error) {
            console.log(error);
            return OperationResult.error(new Error('Cannot write file' + error));
        }

        this.configFiles.set(configFileName, configAsString);
        return OperationResult.success(undefined);
    }

    getConfigFile(configFileName: string): string | undefined {
        const configFile = this.configFiles.get(configFileName);
        if (configFile === undefined) {
            return '{}';
        }
        return configFile;
    }
}
