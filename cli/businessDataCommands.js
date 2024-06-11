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

const businessDataCommands = {

    async processBusinessDataCommand(args) {
        let command = args[0];
        if (!command) {
            command = (
                await prompts({
                    type: 'select',
                    name: 'value',
                    message: 'BusinessData command',
                    choices: [
                        {title: 'load', value: 'load'}
                    ]
                })
            ).value;
            if (!command) {
                console.log('BusinessData command is required');
                return;
            }
        }

        if (command === 'load') {
            await this.loadBusinessDataFile(args[1]);
        } else {
            console.log(`Unknown businessdata command : ${command}
                `);
            await this.printHelp();
        }
    },

    async loadBusinessDataFile(businessDataFile) {
        let filename;
        if (!businessDataFile) {
            businessDataFile = (
                await prompts({
                    type: 'text',
                    name: 'value',
                    message: 'businessData file name '
                })
            ).value;
            if (!businessDataFile) {
                console.log('BusinessData file name is required');
                return;
            }
            filename = businessDataFile.replace(/^.*[\\/]/, ''); //we remove the path and keep only the filename
        }
        utils.sendFile('businessconfig/businessData/' + filename, businessDataFile);
    },

    async printHelp() {
        console.log(`Usage: opfab businessdata <command> [args]

Command list :

    load      load business data from a file  : opfab businessdata load <businessDataFileName>    
        
        `);
    }
};
module.exports = businessDataCommands;
