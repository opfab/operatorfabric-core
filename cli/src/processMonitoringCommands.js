/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

const prompts = require('prompts');
const config = require('./configCommands');
const utils = require('./utils');
const fs = require('fs').promises;

const processMonitoringCommands = {
    async processProcessMonitoringCommand(args) {
        let command = args[0];
        if (!command) {
            command = (
                await prompts({
                    type: 'select',
                    name: 'value',
                    message: 'Process Monitoring Config command',
                    choices: [
                        {title: 'load', value: 'load'}
                    ]
                })
            ).value;
            if (!command) {
                console.log('Proceess Monitoring Config command is required');
                return;
            }
        }
        if (command === 'load') {
            await this.loadProcessMonitoringConfigFile(args[1]);
        } else {
            console.log(`Unknown Process Monitoring Config command : ${command}
                `);
            await this.printHelp();
        }
    },

    async loadProcessMonitoringConfigFile(monitoringConfigFile) {
        if (!monitoringConfigFile) {
            monitoringConfigFile = (
                await prompts({
                    type: 'text',
                    name: 'value',
                    message: 'Process Monitoring Config file name '
                })
            ).value;
            if (!monitoringConfigFile) {
                console.log('Process Monitoring Config file name is required');
                return;
            }
        }
        utils.sendFile('businessconfig/processmonitoring', monitoringConfigFile);
    },

    async printHelp() {
        console.log(`Usage: opfab processmonitoring <command> [args]

Command list :

    load      load configuration for monitoring processus screen : opfab processmonitoring load <fileName>        
        `);
    }
};
module.exports = processMonitoringCommands;
