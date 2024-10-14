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
                    choices: [{title: 'Send message', value: 'send-message'}]
                })
            ).value;
            if (!action) {
                console.log('Connected user action is required');
                return;
            }
        }

        if (action === 'send-message') {
            await this.sendMessage(args[1]);
        } else {
            console.log(`Unknown connected user action : ${action}
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

    async printHelp() {
        console.log(`Usage: opfab connected-user send-message <message>

Message list :

    RELOAD
    BUSINESS_CONFIG_CHANGE
    USER_CONFIG_CHANGE

        `);
    }
};
module.exports = connectedUserCommands;
