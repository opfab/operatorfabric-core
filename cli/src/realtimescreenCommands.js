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
                    message: 'Realtime screen command',
                    choices: [
                        {title: 'load', value: 'load'}
                    ]
                })
            ).value;
            if (!command) {
                console.log('Realtime screen command is required');
                return;
            }
        }
        switch (command) {
            case 'load':
                await this.loadRealtimescreenFile(args[1]);
                break;
            default:
                console.log(`Unknown realtime screen command : ${command}
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
                    message: 'realtime screen file name '
                })
            ).value;
            if (!realtimescreenFile) {
                console.log('Realtime screen file name is required');
                return;
            }
        }
        utils.sendFile('businessconfig/realtimescreens', realtimescreenFile);
    },

    async printHelp() {
        console.log(`Usage: opfab realtime-screen <command> [args]

Command list :

    load      load realtime screen from a file : opfab realtime-screen load <realtimescreenFileName>    
        
        `);
    }
};
module.exports = realtimescreenCommands;
