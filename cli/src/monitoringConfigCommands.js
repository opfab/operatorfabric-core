/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

const prompts = require('prompts');
const config = require("./configCommands");
const fs = require('fs').promises;

const monitoringConfigCommands = {

    async processMonitoringConfigCommand(args) {
        let command = args[0];
        if (!command) {
            command = (
                await prompts({
                    type: 'select',
                    name: 'value',
                    message: 'Monitoring Config command',
                    choices: [
                        {title: 'load', value: 'load'},
                        {title: 'delete', value: 'delete'}
                    ]
                })
            ).value;
            if (!command) {
                console.log('Monitoring Config command is required');
                return;
            }
        }
        switch (command) {
            case 'load':
                await this.loadMonitoringConfigFile(args[1]);
                break;
            case 'delete':
                await this.deleteMonitoringConfig(args[1]);
                break;
            default:
                console.log(`Unknown Monitoring Config command : ${command}
                `);
                await this.printHelp();
                break;
        }
    },

    async loadMonitoringConfigFile(monitoringConfigFile) {
        if (!monitoringConfigFile) {
            monitoringConfigFile = (
                await prompts({
                    type: 'text',
                    name: 'value',
                    message: 'Monitoring Config file name '
                })
            ).value;
            if (!monitoringConfigFile) {
                console.log('Monitoring Config file name is required');
                return;
            }
        }

        let fileContent;
        try {
            fileContent = await fs.readFile(monitoringConfigFile, 'utf8');
        }
        catch (error) {
            console.error('Failed to read monitoring config file', monitoringConfigFile);
            console.error('Error:', error);
            return;
        }

        const url = `${config.getConfig('url')}:${config.getConfig('port')}/businessconfig/monitoring`;
        const token = config.getConfig('access_token');
        const options = {
            method: 'POST',
            body: fileContent,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        };

        let response;
        try {
            response = await fetch(url, options);
        } catch (error) {
            console.error('Failed to send monitoring config file');
            console.error('Error:', error);
            return;
        }

        if (response.ok) {
            console.error('Monitoring config file sent successfully');
        }
        else
        {
            console.error('Failed to send monitoring config file');
            console.error('Response:', response);
        }
    },

    async deleteMonitoringConfig() {
        const url = `${config.getConfig('url')}:${config.getConfig('port')}/businessconfig/monitoring`;
        const token = config.getConfig('access_token');
        const options = {
            method: 'POST',
            body: '{}',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        };

        let response;
        try {
            response = await fetch(url, options);
        } catch (error) {
            console.error('Failed to delete monitoring config');
            console.error('Error:', error);
            return;
        }

        if (response.ok) {
            console.error('Monitoring config deleted successfully');
        }
        else
        {
            console.error('Failed to delete monitoring config');
            console.error('Response:', response);
        }
    },

    async printHelp() {
        console.log(`Usage: opfab monitoringconfig <command> [args]

Command list :

    load      load configuration for monitoring screen : opfab monitoringconfig load <fileName>
    delete    delete configuration for monitoring screen : opfab monitoringconfig delete
        
        `);
    }
};
module.exports = monitoringConfigCommands;
