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

const usersCommands = {
    async processUsersCommand(args) {
        let action = args[0];
        if (!action) {
            action = (
                await prompts({
                    type: 'select',
                    name: 'value',
                    message: 'Users action',
                    choices: [
                        {title: 'Set notified', value: 'set-notified'},
                        {title: 'Set not notified', value: 'set-not-notified'},
                        {title: 'Set notified by mail', value: 'set-notified-mail'},
                        {title: 'Set not notified by mail', value: 'set-not-notified-mail'}
                    ]
                })
            ).value;
            if (!action) {
                console.log('Users action is required');
                return;
            }
        }

        switch (action) {
            case 'set-notified':
                await this.configureNotification(args[1], args[2], 'POST', 'processstatenotified');
                break;
            case 'set-not-notified':
                await this.configureNotification(args[1], args[2], 'DELETE', 'processstatenotified');
                break;
            case 'set-notified-mail':
                await this.configureNotification(args[1], args[2], 'POST', 'processstatenotifiedbymail');
                break;
            case 'set-not-notified-mail':
                await this.configureNotification(args[1], args[2], 'DELETE', 'processstatenotifiedbymail');
                break;
            default:
                console.log(`Unknown users action : ${action}
                `);
                await this.printHelp();
                break;
        }
    },

    async configureNotification(process, state, method, path) {
        if (!process) {
            process = (
                await prompts({
                    type: 'text',
                    name: 'value',
                    message: 'process '
                })
            ).value;
            if (!process) {
                console.log('process is required');
                return;
            }
        }
        if (!state) {
            state = (
                await prompts({
                    type: 'text',
                    name: 'value',
                    message: 'state '
                })
            ).value;
            if (!state) {
                console.log('state is required');
                return;
            }
        }

        const url = `${config.getConfig('url')}:${config.getConfig('port')}/` + 'users/notificationconfiguration/' + path + '/' + process + '/' + state;
        const token = config.getConfig('access_token');
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };

        let response;
        try {
            response = await fetch(url, options);
        } catch (error) {
            console.error('Failed to configure process/state notification for ' + process + ' / ' +state);
            console.error('Error:', error);
            return;
        }

        if (response.ok) {
            console.error('Success');
        } else {
            console.error('Failed to configure process/state notification for ' + process + '/' +state);
            console.error('Response:', response);
        }
    },

    async printHelp() {
        console.log(`Usage: opfab users set-notif <process> <state>
        
Commands list : 

            set-notified            Configure <process>/<state> as to be notified for all users 
            set-not-notified        Configure <process>/<state> as not to be notified for all users
            set-notified-mail       Configure <process>/<state> as to be notified by email for all users 
            set-not-notified-mail   Configure <process>/<state> as not to be notified by email for all users 
        `);
    }
};
module.exports = usersCommands;