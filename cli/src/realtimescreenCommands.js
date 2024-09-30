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

const realtimescreenCommands = {

    async processRealtimescreenCommand(args) {
        let command = args[0];
        if (!command) {
            command = (
                await prompts({
                    type: 'select',
                    name: 'value',
                    message: 'Realtimescreen command',
                    choices: [
                        {title: 'load', value: 'load'}
                    ]
                })
            ).value;
            if (!command) {
                console.log('Realtimescreen command is required');
                return;
            }
        }
        switch (command) {
            case 'load':
                await this.loadRealtimescreenFile(args[1]);
                break;
            default:
                console.log(`Unknown realtimescreen command : ${command}
                `);
                await this.printHelp();
                break;
        }
    },

    async loadRealtimescreenFile(realtimescreenFile) {
        if (!realtimescreenFile) {
            realtimescreenFile = (
                await prompts({
                    type: 'text',
                    name: 'value',
                    message: 'realtimescreen file name '
                })
            ).value;
            if (!realtimescreenFile) {
                console.log('Realtimescreen file name is required');
                return;
            }
        }
        utils.sendFile('businessconfig/realtimescreens', realtimescreenFile);
    },

    async printHelp() {
        console.log(`Usage: opfab realtimescreen <command> [args]

Command list :

    load      load realtimescreen from a file : opfab realtimescreen load <realtimescreenFileName>    
        
        `);
    }
};
module.exports = realtimescreenCommands;
