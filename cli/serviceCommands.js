/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

const config = require('./configCommands.js');
const prompts = require('prompts');

const serviceCommands = {

    async processServiceCommand(args) {
        let action = args[0];
        if (!action) {
            action = (
                await prompts({
                    type: 'select',
                    name: 'value',
                    message: 'Service action',
                    choices: [
                        { title: 'Get-log-level', value: 'get-log-level' },
                        { title: 'Set-log-level', value: 'set-log-level' }
                    ],
                })
            ).value;
            if (!action) {
                console.log('Service action is required');
                return;
            }
        }

        switch (action) {
            case 'get-log-level':
                await this.getLogLevel(args.slice(1));
                break;
            case 'set-log-level':
                await this.setLogLevel(args.slice(1));
                break;
            default:
                console.log(`Unknown service action : ${action}
                `);
                await this.printHelp();
                break;
        }
    },


    async getLogLevel(args) {
        const serviceName = await this.fetchServiceName(args);
        if (serviceName === '') return;

        const url = `${config.getConfig('url')}:2002/` + serviceName + '/actuator/loggers/ROOT';
        const token = config.getConfig('access_token');
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };

        let response;
        try {
            response = await fetch(url, options);
        } catch (error) {
            console.error('Failed to get log level');
            console.error('Error:', error);
            return;
        }

        if (response.ok) {
            console.error('Log level got successfully');
            const result = await response.json();
            console.error(result);
        }
        else
        {
            console.error('Failed to get log level');
            console.error('Response:', response);
        }
    },

    async setLogLevel(args) {
        const serviceName = await this.fetchServiceName(args);
        if (serviceName === '') return;

        let logLevel = args[1];

        if (!logLevel) {
            logLevel = (
                await prompts({
                    type: 'select',
                    name: 'value',
                    message: 'Log level',
                    choices: [
                        { title: 'TRACE', value: 'trace' },
                        { title: 'DEBUG', value: 'debug' },
                        { title: 'INFO', value: 'info' },
                        { title: 'WARN', value: 'warn' },
                        { title: 'ERROR', value: 'error' },
                        { title: 'FATAL', value: 'fatal' }
                    ],
                })
            ).value;
            if (!logLevel) {
                console.log('Log level is required');
                return;
            }
        }

        const url = `${config.getConfig('url')}:2002/` + serviceName + '/actuator/loggers/ROOT';
        const token = config.getConfig('access_token');
        const body = {configuredLevel: logLevel};
        const options = {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };

        let response;
        try {
            response = await fetch(url, options);
        } catch (error) {
            console.error('Failed to set log level');
            console.error('Error:', error);
            return;
        }

        if (response.ok) {
            console.error('Log level set successfully');
        }
        else
        {
            console.error('Failed to set log level');
            console.error('Response:', response);
        }
    },

    async fetchServiceName(args) {
        let serviceName = args[0];

        if (!serviceName) {
            serviceName = (
                await prompts({
                    type: 'select',
                    name: 'value',
                    message: 'Service name',
                    choices: [
                        { title: 'Users', value: 'users' },
                        { title: 'Businessconfig', value: 'businessconfig' },
                        { title: 'Cards-consultation', value: 'cards-consultation' },
                        { title: 'Cards-publication', value: 'cards-publication' },
                        { title: 'External-devices', value: 'external-devices' }
                    ],
                })
            ).value;
            if (!serviceName) {
                console.log('Service name is required');
                return;
            }
        }
        return serviceName;
    },

    async printHelp() {
        console.log(`Usage: opfab service <command> [args]

Command list :

    get-log-level      Get log level for a java service : opfab service get-log-level <serviceName>
    set-log-level      Set log level for a java service : opfab service set-log-level <serviceName> <level>
    
Service list :

    users
    businessconfig
    cards-consultation
    cards-publication
    external-devices
    
Level list : 

    trace
    debug
    info
    warn
    error
    fatal
        
        `);
    }
};
module.exports = serviceCommands;
