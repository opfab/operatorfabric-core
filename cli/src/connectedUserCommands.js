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

const connectedUserCommands = {
    async processConnectedUserCommand(args) {
        let action = args[0];
        if (!action) {
            action = (
                await prompts({
                    type: 'select',
                    name: 'value',
                    message: 'Connected user action',
                    choices: [
                        {title: 'Send message', value: 'send-message'},
                        {title: 'List all connected users', value: 'list'}
                    ]
                })
            ).value;
            if (!action) {
                console.log('Connected user action is required');
                return;
            }
        }

        switch (action) {
            case 'send-message':
                await this.sendMessage(args[1]);
                break;
            case 'list':
                await this.listConnectedUsers();
                break;
            default:
                console.log(`Unknown connected user action : ${action}`);
                await this.printHelp();
                break;
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
                        {title: 'RELOAD', value: 'RELOAD'},
                        {title: 'BUSINESS_CONFIG_CHANGE', value: 'BUSINESS_CONFIG_CHANGE'},
                        {title: 'USER_CONFIG_CHANGE', value: 'USER_CONFIG_CHANGE'}
                    ]
                })
            ).value;
            if (!message) {
                console.log('Message is required');
                return;
            }
        }

        await utils.sendRequest(
            'cards-consultation/messageToSubscriptions',
            'POST',
            message,
            `Message ${message} sent successfully`,
            `Failed to send message ${message}`,
            `Failed to send message ${message} , not found error`
        );
    },

    async listConnectedUsers() {
        const result = await utils.sendRequest(
            'cards-consultation/connections',
            'GET',
            undefined,
            'All connected users got successfully',
            'Failed to get all connected users',
            'Failed to get all connected users, not found error'
        );

        if (result.ok) {
            const connectedUsers = await result.json();

            console.info('Number of connected users : ' + connectedUsers.length);

            if (connectedUsers.length > 0) {
                console.info('login | entitiesConnected | groups');
            }
            connectedUsers.forEach(connectedUser => {
                console.info(connectedUser.login +
                    ' | ' + connectedUser.entitiesConnected +
                    ' | ' + connectedUser.groups);
            });
        }
    },

    async printHelp() {
        console.log(`Usage: opfab connected-user <command> [message]

Command list :

    list               list all connected users : opfab connected-user list
    send-message       send a message to subscriptions : opfab connected-user send-message <message>

Message list :

    RELOAD
    BUSINESS_CONFIG_CHANGE
    USER_CONFIG_CHANGE

        `);
    }
};
module.exports = connectedUserCommands;
