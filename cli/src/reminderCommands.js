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

const reminder = {

    async processReminderCommand(args) {
        const action = await this.getAction(args);
        
        if (!action) {
            console.log('Reminder action is required');
            return;
        }

        switch (action) {
            case 'status':
                await this.getStatus();
                break;
            case 'start':
                await this.start();
                break;
            case 'stop':
                await this.stop();
                break;
            case 'reset':
                await this.reset();
                break;
            default:
                console.log(`Unknown reminder action : ${action}`);
                this.printHelp();
                break;
        }
    },

    async getAction(args) {
        let action = args[0];
        if (!action) {
            action = (
                await prompts({
                    type: 'select',
                    name: 'value',
                    message: 'Reminder action',
                    choices: [
                        {title: 'Get status', value: 'status'},
                        {title: 'Start', value: 'start'},
                        {title: 'Stop', value: 'stop'},
                        {title: 'Reset', value: 'reset'}
                    ]
                })
            ).value;
        }
        return action;

    },

    async getStatus() {
        
        const response = await utils.sendRequest(
            'cards-reminder/status',
            'GET',
            undefined,
            `Get reminder status executed successfully`,
            `Failed to get reminder status`,
            `Failed to get reminder status, not found error`
        );
        if (response.ok) {
            const status = await response.text();
            console.log(`Started: ${status}`);
        }
    },

    async start() {
        
        await utils.sendRequest(
            'cards-reminder/start',
            'GET',
            undefined,
            'Reminder service started successfully',
            'Failed to start reminder service',
            'Failed to start reminder service, not found error'
        );
    },

    async stop() {
        
        await utils.sendRequest(
            'cards-reminder/stop',
            'GET',
            undefined,
            `Reminder service stopped successfully`,
            `Failed to stop reminder service`,
            `Failed to stop reminder service, not found error`
        );
    },

    async reset() {
        
        await utils.sendRequest(
            'cards-reminder/reset',
            'GET',
            undefined,
            `Reminder service reset successfully`,
            `Failed to reset reminder service`,
            `Failed to reset reminder service, not found error`
        );
    },
    printHelp() {
        console.log(`Usage: opfab reminder <status|start|stop|reset> 

    status  Get reminder service status
    start   Start reminder service
    stop    Stop reminder service
    reset   Reset reminder service
        `);
    }
};

module.exports = reminder;
