/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import 'jest';
import { JsonValidator, processSchema } from '../src/domain/application/configFileValidator'; // Replace 'path/to/ConfigFileValidator' with the actual path to the ConfigFileValidator file

describe('config valid', function () {
    const jsonValidator = new JsonValidator();

    it('should be invalid if config is invalid', async function () {
        const config = {
            "entities": [
                {
                    "id": "1",
                    "levels": [1, 2]
                },
                {
                    "id": "2",
                    "levels": [1, 2]
                }
            ]
        };
       
        const result = jsonValidator.validateJSON(config, processSchema);
        expect(result.valid).toBe(false);
    });
    it('should be valid if config is valid', async function () {
        const config = {
            id: "processId",
            name: "processName",
            version: "1.0.0"

        };
        const result = jsonValidator.validateJSON(config, processSchema);
        expect(result.valid).toBe(true);
    });
    it ('Should be invalid if config is missing id', async function () {
        const config = {
            name: "processName",
            version: "1.0.0"
        };
        const result = jsonValidator.validateJSON(config, processSchema);
        expect(result.valid).toBe(false);
    });
    it ('Should return config if config is valid', async function () {
        const config = {
            id: "processId",
            name: "processName",
            version: "1.0.0"
        };
        const result = jsonValidator.validateJSON(config, processSchema);
        expect(result.json).toBe(config);
    });
    it ('Should return invalid if config id contains a number instead of a string', async function () {
        const config = {
            id: 1,
            name: "processName",
            version: "1.0.0"
        };
        const result = jsonValidator.validateJSON(config, processSchema);
        expect(result.valid).toBe(false);
    });
    it ('Should return config without value test as value test is not in the config schema', async function () {    
        const config = {
            id: "processId",
            name: "processName",
            version: "1.0.0",
            test: "test"
        };
        const result = jsonValidator.validateJSON(config, processSchema);
        expect(result.json).not.toHaveProperty('test');
    });
  
});

