/* Copyright (c) 2024-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

const prompts = require('prompts');
const utils = require('./utils.js');

const NODE_SERVICES = ['supervisor', 'cards-external-diffusion', 'cards-reminder'];

const logCommands = {
    async processLogCommand(args) {
        let action = args[0];
        if (!action) {
            action = (
                await prompts({
                    type: 'select',
                    name: 'value',
                    message: 'Log action',
                    choices: [
                        {title: 'Get-level', value: 'get-level'},
                        {title: 'Set-level', value: 'set-level'}
                    ]
                })
            ).value;
            if (!action) {
                console.log('Log action is required');
                return;
            }
        }

        switch (action) {
            case 'get-level':
                await this.getLogLevel(args.slice(1));
                break;
            case 'set-level':
                await this.setLogLevel(args.slice(1));
                break;
            default:
                console.log(`Unknown log action : ${action}
                `);
                await this.printHelp();
                break;
        }
    },

    async getLogLevel(args) {
        const serviceName = await this.fetchServiceName(args);
        if (serviceName === '') return;

        const result = await utils.sendRequest(
            this.getServicePath(serviceName),
            'GET',
            undefined,
            'Log level got successfully',
            'Failed to get log level',
            'Failed to get log level not found error'
        );

        if (result.ok) {
            if (this.isNodeService(serviceName)) console.log(this.fromNodeToStandardLevel(await result.json()));
            else console.info(await result.json());
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
                        {title: 'TRACE', value: 'trace'},
                        {title: 'DEBUG', value: 'debug'},
                        {title: 'INFO', value: 'info'},
                        {title: 'WARN', value: 'warn'},
                        {title: 'ERROR', value: 'error'},
                        {title: 'FATAL', value: 'fatal'}
                    ]
                })
            ).value;
            if (!logLevel) {
                console.log('Log level is required');
                return;
            }
        }
        if (this.isNodeService(serviceName)) logLevel = this.fromStandardToNodeLevel(logLevel);

        await utils.sendRequest(
            this.getServicePath(serviceName),
            'POST',
            JSON.stringify({configuredLevel: logLevel}),
            'Log level set successfully',
            'Failed to set log level',
            'Failed to set log level not found error'
        );
    },

    getServicePath(serviceName) {
        let path = serviceName + '/actuator/loggers/ROOT';
        switch (serviceName) {
            case 'external-devices':
                path = 'externaldevices/actuator/loggers/ROOT';
                break;
            case 'supervisor':
            case 'cards-reminder':
            case 'cards-external-diffusion':
                path = serviceName + '/logLevel';
                break;
            default:
                break;
        }
        return path;
    },

    isNodeService(serviceName) {
        return NODE_SERVICES.includes(serviceName);
    },

    fromStandardToNodeLevel(level) {
        return level === 'trace' ? 'silly' : level;
    },

    fromNodeToStandardLevel(logLevel) {
        const level = logLevel.effectiveLevel;
        let standardLevel = level;
        switch (level) {
            case 'SILLY':
                standardLevel = 'TRACE';
                break;
            case 'VERBOSE':
            case 'HTTP':
            case 'DEBUG':
                standardLevel = 'DEBUG';
                break;
            case 'INFO':
                standardLevel = 'INFO';
                break;
            case 'WARN':
                standardLevel = 'WARN';
                break;
            case 'ERROR':
            case 'FATAL':
                standardLevel = 'ERROR';
                break;
            default:
                break;
        }
        logLevel.effectiveLevel = standardLevel;
        logLevel.configuredLevel = standardLevel;
        return logLevel;
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
                        {title: 'Users', value: 'users'},
                        {title: 'Businessconfig', value: 'businessconfig'},
                        {title: 'Cards-consultation', value: 'cards-consultation'},
                        {title: 'Cards-publication', value: 'cards-publication'},
                        {title: 'External-devices', value: 'external-devices'},
                        {title: 'Supervisor', value: 'supervisor'},
                        {title: 'Cards-external-diffusion', value: 'cards-external-diffusion'},
                        {title: 'Cards-reminder', value: 'cards-reminder'}
                    ]
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
        console.log(`Usage: opfab log <command> [args]

Command list :

    get-level      Get log level for a java service : opfab log get-level <serviceName>
    set-level      Set log level for a java service : opfab log set-level <serviceName> <level>
    
Service list :

    users
    businessconfig
    cards-consultation
    cards-publication
    external-devices
    supervisor
    cards-external-diffusion
    cards-reminder
    
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
module.exports = logCommands;
