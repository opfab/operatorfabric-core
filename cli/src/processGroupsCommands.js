/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

const prompts = require('prompts');
const utils = require('./utils.js');

const processGroupsCommands = {

    async processProcessGroupsCommand(args) {
        let command = args[0];
        if (!command) {
            command = (
                await prompts({
                    type: 'select',
                    name: 'value',
                    message: 'ProcessGroups command',
                    choices: [
                        {title: 'load', value: 'load'},
                        {title: 'clear', value: 'clear'}
                    ]
                })
            ).value;
            if (!command) {
                console.log('ProcessGroups command is required');
                return;
            }
        }
        switch (command) {
            case 'load':
                await this.loadProcessGroupsFile(args[1]);
                break;
            case 'clear':
                await this.clearProcessGroups();
                break;
            default:
                console.log(`Unknown processgroups command : ${command}
                `);
                await this.printHelp();
                break;
        }
    },

    async loadProcessGroupsFile(processGroupsFile) {
        if (!processGroupsFile) {
            processGroupsFile = (
                await prompts({
                    type: 'text',
                    name: 'value',
                    message: 'processGroups file name '
                })
            ).value;
            if (!processGroupsFile) {
                console.log('ProcessGroups file name is required');
                return;
            }
        }
        utils.sendFile('businessconfig/processgroups', processGroupsFile);
    },

    async clearProcessGroups() {
        utils.sendStringAsFile('businessconfig/processgroups', '{"groups":[]}', 'clear processGroups');
    },

    async printHelp() {
        console.log(`Usage: opfab processgroups <command> [args]

Command list :

    clear     clear processGroups (load an empty list of processGroups)
    load      load processGroups from a file  : opfab processgroups load <processGroupsFileName>    
        
        `);
    }
};
module.exports = processGroupsCommands;
