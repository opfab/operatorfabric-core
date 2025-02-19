/* Copyright (c) 2024-2025, RTE (http://www.rte-france.com)
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
const fs = require('fs').promises;

const userCommands = {
    async processUserCommand(args) {
        let action = args[0];
        if (!action) {
            action = (
                await prompts({
                    type: 'select',
                    name: 'value',
                    message: 'User action',
                    choices: [
                        { title: 'Add to entity', value: 'add-to-entity' },
                        { title: 'Add to group', value: 'add-to-group' },
                        { title: 'Load a list of users', value: 'load' },
                        { title: 'Delete a user', value: 'delete' },
                        { title: 'Remove from entity', value: 'remove-from-entity' },
                        { title: 'Remove from group', value: 'remove-from-group' },
                        { title: 'Set not notified', value: 'set-not-notified' },
                        { title: 'Set not notified by mail', value: 'set-not-notified-mail' },
                        { title: 'Set activity area', value: 'set-activity-area' },
                        { title: 'Set notified', value: 'set-notified' },
                        { title: 'Set notified by mail', value: 'set-notified-mail' },
                        { title: 'Unset activity area', value: 'unset-activity-area' }
                    ]
                })
            ).value;
            if (!action) {
                console.log('User action is required');
                return;
            }
        }

        switch (action) {
            case 'add-to-entity':
                await this.addUserTo('Entity', 'entities', args[1], args[2]);
                break;
            case 'add-to-group':
                await this.addUserTo('Group', 'groups', args[1], args[2]);
                break;
            case 'delete':
                await this.deleteUser(args[1]);
                break;
            case 'load':
                await this.loadUserList(args[1]);
                break;
            case 'remove-from-entity':
                await this.removeUserFrom('Entity', 'entities', args[1], args[2]);
                break;
            case 'remove-from-group':
                await this.removeUserFrom('Group', 'groups', args[1], args[2]);
                break;
            case 'set-not-notified':
                await this.configureNotification(args[1], args[2], 'DELETE', 'processstatenotified');
                break;
            case 'set-not-notified-mail':
                await this.configureNotification(args[1], args[2], 'DELETE', 'processstatenotifiedbymail');
                break;
            case 'set-activity-area':
                await this.activityAreaSetter(args[1], args[2], true);
                break;
            case 'set-notified':
                await this.configureNotification(args[1], args[2], 'POST', 'processstatenotified');
                break;
            case 'set-notified-mail':
                await this.configureNotification(args[1], args[2], 'POST', 'processstatenotifiedbymail');
                break;
            case 'unset-activity-area':
                await this.activityAreaSetter(args[1], args[2], false);
                break;

            default:
                console.log(`Unknown user action : ${action}
                `);
                await this.printHelp();
                break;
        }
    },

    async addUserTo(object, objectUrl, objectId, user) {
        objectId = await utils.missingTextPrompt(object, objectId);
        user = await utils.missingTextPrompt('User', user);
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
        objectId = await utils.missingTextPrompt(object, objectId);
        user = await utils.missingTextPrompt('User', user);
        await utils.sendRequest(
            `users/${objectUrl}/${objectId}/users/${user}`,
            'DELETE',
            undefined,
            `User ${user} has been removed from ${objectId}`,
            `Error removing user ${user} from ${objectId}`,
            `${object} or user not found`
        );
    },

    async deleteUser(user) {
        user = await utils.missingTextPrompt('User', user);
        await utils.sendRequest(
            `users/users/${user}`,
            'DELETE',
            undefined,
            `User ${user} has been deleted`,
            ``,
            `User ${user} not found`
        );
    },

    async loadUserList(filePath) {
        filePath = await utils.missingTextPrompt('File path', filePath);
        let userList;
        try {
            userList = JSON.parse(await fs.readFile(filePath, 'utf8'));
        } catch (error) {
            console.error(`Failed to parse the JSON file: ${error.message}`);
            return;
        }
        for (const user of userList) {
            await utils.sendRequest(
                'users/users',
                'POST',
                JSON.stringify(user),
                `User ${user.login} created or udpated successfully`,
                `Failed to create or udpate user ${user.login}`,
                `Failed to create or update user ${user.login} , not found error`
            );
        }
    },

    async activityAreaSetter(entity, user, setting) {
        entity = await utils.missingTextPrompt('Activity area', entity);
        user = await utils.missingTextPrompt('User', user);

        const entitiesDisconnectedResponse = await utils.sendRequest(
            `users/users/${user}/settings`,
            'GET',
            undefined,
            '',
            `Failed to fetch settings for user ${user}`,
            `Failed to find user ${user}`
        );
        if (!entitiesDisconnectedResponse.ok) {
            return;
        }
        let { entitiesDisconnected } = await entitiesDisconnectedResponse.json();
        if (!entitiesDisconnected) {
            entitiesDisconnected = [];
        }
        const index = entitiesDisconnected?.indexOf(entity);
        if (setting) {
            if (index !== -1) {
                entitiesDisconnected.splice(index, 1);
            }
        } else if (index == -1) {
            entitiesDisconnected.push(entity);
        }
        await utils.sendRequest(
            `users/users/${user}/settings`,
            'PATCH',
            JSON.stringify({ login: user, entitiesDisconnected: entitiesDisconnected }),
            `Activity area ${entity} has been ${setting ? 'set' : 'unset'} for user ${user}`,
            `Failed to change activity area ${entity} for user ${user}`,
            `Activity area ${entity} or user ${user} could not be found`
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
        console.log(`Usage: opfab user <command>
        
Commands list : 
            add-to-entity           Add a <user> to an <entity> : opfab user add-to-entity <entityId> <user>
            add-to-group            Add a <user> to a <group> : opfab user add-to-group <groupId> <user>
            delete                  Delete a <user> : opfab user delete <user>
            load                    Add or update a list of users : opfab user load <usersFilePath>
            remove-from-entity      Remove a <user> from an <entity> : opfab user remove-from-entity <entityId> <user>
            remove-from-group       Remove a <user> from a <group> : opfab user remove-from-group <groupId> <user>
            set-not-notified        Configure <process>/<state> as not to be notified for all users : opfab user set-not-notified <process> <state>
            set-not-notified-mail   Configure <process>/<state> as not to be notified by email for all users : opfab user set-not-notified-mail <process> <state>
            set-activity-area       Set an <activity area> for a <user> : opfab user set-activity-area <activityAreaId> <user> 
            set-notified            Configure <process>/<state> as to be notified for all users : opfab user set-notified <process> <state>
            set-notified-mail       Configure <process>/<state> as to be notified by email for all users : opfab user set-notified-mail <process> <state>
            unset-activity-area     Unset an <activity area> for a <user> : opfab user unset-activity-area <activityAreaId> <user> 
        `);
    }
};
module.exports = userCommands;
