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

const connectedUsersCommands = {
    async processConnectedUsersCommand(args) {
        let action = args[0];
        if (!action) {
            action = (
                await prompts({
                    type: 'select',
                    name: 'value',
                    message: 'Connected users action',
                    choices: [
                        {title: 'Send message', value: 'sendmessage'}
                    ]
                })
            ).value;
            if (!action) {
                console.log('Connected users action is required');
                return;
            }
        }
        
        if (action === 'sendmessage') {
            await this.sendMessage(args[1]);
        } else {
            console.log(`Unknown connected users action : ${action}
            `);
            await this.printHelp();
        }
    },

    async sendMessage(message) {
        if (!message) {
            message = (
                await prompts({
                    type: 'select',
                    name: 'value',
                    message: 'Message',
                    choices: [
                        { title: 'RELOAD', value: 'RELOAD' },
                        { title: 'BUSINESS_CONFIG_CHANGE', value: 'BUSINESS_CONFIG_CHANGE' },
                        { title: 'USER_CONFIG_CHANGE', value: 'USER_CONFIG_CHANGE' }
                    ],
                })
            ).value;
            if (!message) {
                console.log('Message is required');
                return;
            }
        }

        const url = `${config.getConfig('url')}:${config.getConfig('port')}/` + 'cards-consultation/messageToSubscriptions';
        const token = config.getConfig('access_token');
        const options = {
            method: 'POST',
            body: message,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };

        let response;
        try {
            response = await fetch(url, options);
        } catch (error) {
            console.error('Failed to send message ' + message);
            console.error('Error:', error);
            return;
        }

        if (response.ok) {
            console.error('Message ' + message + ' sent successfully');
        } else {
            console.error('Failed to send message ' + message);
            console.error('Response:', response);
        }
    },

    async printHelp() {
        console.log(`Usage: opfab connectedusers sendmessage <message>

Message list :

    RELOAD
    BUSINESS_CONFIG_CHANGE
    USER_CONFIG_CHANGE

        `);
    }
};
module.exports = connectedUsersCommands;
