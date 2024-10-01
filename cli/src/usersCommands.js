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
const utils = require('./utils.js');

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
                        {title: 'Add to group', value: 'addtogroup'},
                        {title: 'Remove from group', value: 'removefromgroup'},
                        {title: 'Add to entity', value: 'addtoentity'},
                        {title: 'Remove from entity', value: 'removefromentity'},
                        {title: 'Set notified', value: 'set-notified'},
                        {title: 'Set not notified', value: 'set-not-notified'},
                        {title: 'Set notified by mail', value: 'set-notified-mail'},
                        {title: 'Set not notified by mail', value: 'set-not-notified-mail'},
                        {title: 'Delete a user', value: 'delete'}
                    ]
                })
            ).value;
            if (!action) {
                console.log('Users action is required');
                return;
            }
        }

        switch (action) {
            case 'addtoentity':
                await this.addUserTo('Entity', 'entities', args[1], args[2]);
                break;
            case 'removefromentity':
                await this.removeUserFrom('Entity', 'entities', args[1], args[2]);
                break;
            case 'addtogroup':
                await this.addUserTo('Group', 'groups', args[1], args[2]);
                break;
            case 'removefromgroup':
                await this.removeUserFrom('Group', 'groups', args[1], args[2]);
                break;
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
            case 'delete':
                await this.deleteUser(args[1]);
                break;
            default:
                console.log(`Unknown users action : ${action}
                `);
                await this.printHelp();
                break;
        }
    },

    async missingPrompt(object, objectId) {
        if (!objectId) {
            objectId = (
                await prompts({
                    type: 'text',
                    name: 'value',
                    message: `${object} `
                })
            ).value;
            if (!objectId) {
                console.log(`${object} is required`);
                return;
            }
        }
        return objectId;
    },

    async addUserTo(object, objectUrl, objectId, user) {
        objectId = await this.missingPrompt(object, objectId);
        user = await this.missingPrompt('User', user);
        await utils.sendRequest(
            `users/${objectUrl}/${objectId}/users`,
            'PATCH',
            `["${user}"]`,
            `User ${user} has been added to ${objectId}`,
            ``,
            `${object} or user not found`
        );
    },

    async removeUserFrom(object, objectUrl, objectId, user) {
        objectId = await this.missingPrompt(object, objectId);
        user = await this.missingPrompt('User', user);
        await utils.sendRequest(
            `users/${objectUrl}/${objectId}/users/${user}`,
            'DELETE',
            undefined,
            `User ${user} has been removed from ${objectId}`,
            `${object} or user not found`
        );
    },

    async deleteUser(user) {
        user = await this.missingPrompt('User', user);
        await utils.sendRequest(
            `users/users/${user}`,
            'DELETE',
            undefined,
            `User ${user} has been deleted`,
            ``,
            `User ${user} not found`
        );
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

        const url =
            `${config.getConfig('url')}:${config.getConfig('port')}/` +
            'users/notificationconfiguration/' +
            path +
            '/' +
            process +
            '/' +
            state;
        const token = config.getConfig('access_token');
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        };

        let response;
        try {
            response = await fetch(url, options);
        } catch (error) {
            console.error('Failed to configure process/state notification for ' + process + ' / ' + state);
            console.error('Error:', error);
            return;
        }

        if (response.ok) {
            console.error('Success');
        } else {
            console.error('Failed to configure process/state notification for ' + process + '/' + state);
            console.error('Response:', response);
        }
    },

    async printHelp() {
        console.log(`Usage: opfab users <command>
        
Commands list : 
            addtogroup              Add a <user> to a <group> : opfab users <groupId> <user>
            removefromgroup         Remove a <user> from a <group> : opfab users <groupId> <user>
            addtoentity             Add a <user> to an <entity> : opfab users <entityId> <user>
            removefromentity        Remove a <user> from an <entity> : opfab users <entityId> <user>
            set-notified            Configure <process>/<state> as to be notified for all users 
            set-not-notified        Configure <process>/<state> as not to be notified for all users
            set-notified-mail       Configure <process>/<state> as to be notified by email for all users 
            set-not-notified-mail   Configure <process>/<state> as not to be notified by email for all users 
            delete                  Delete a <user>
        `);
    }
};
module.exports = usersCommands;
