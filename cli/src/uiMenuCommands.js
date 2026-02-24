/* Copyright (c) 2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

const prompts = require('prompts');
const utils = require('./utils.js');

const uiMenuCommands = {

    async processUIMenuCommand(args) {
        let command = args[0];
        if (!command) {
            command = (
                await prompts({
                    type: 'select',
                    name: 'value',
                    message: 'UI Menu command',
                    choices: [
                        {title: 'load', value: 'load'}
                    ]
                })
            ).value;
            if (!command) {
                console.log('UI Menu command is required');
                return;
            }
        }

        if (command === 'load') {
            await this.loadUIMenuFile(args[1]);
        } else {
            console.log(`Unknown UI Menu command: ${command}`);
            await this.printHelp();
        }
    },

    async loadUIMenuFile(uiMenuFile) {
        
        if (!uiMenuFile) {
            uiMenuFile = (
                await prompts({
                    type: 'text',
                    name: 'value',
                    message: 'UI Menu file name'
                })
            ).value;
            if (!uiMenuFile) {
                console.log('UI Menu file name is required');
                return;
            }
        }
        utils.sendFile('businessconfig/uimenu', uiMenuFile);
    },

    async printHelp() {
        console.log(`Usage: opfab ui-menu <command> [args]

Command list:

    load      load the UI menu from a file: opfab ui-menu load <uiMenuFileName>
        `);
    }
};

module.exports = uiMenuCommands;