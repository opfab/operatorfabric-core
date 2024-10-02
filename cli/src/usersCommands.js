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
const fs = require('fs').promises;

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
                        {title: 'Add to entity', value: 'addtoentity'},
                        {title: 'Add to group', value: 'addtogroup'},
                        {title: 'Load a list of users', value: 'load'},
                        {title: 'Delete a user', value: 'delete'},
                        {title: 'Remove from entity', value: 'removefromentity'},
                        {title: 'Remove from group', value: 'removefromgroup'},
                        {title: 'Set not notified', value: 'set-not-notified'},
                        {title: 'Set not notified by mail', value: 'set-not-notified-mail'},
                        {title: 'Set activity area', value: 'setactivityarea'},
                        {title: 'Set notified', value: 'set-notified'},
                        {title: 'Set notified by mail', value: 'set-notified-mail'},
                        {title: 'Unset activity area', value: 'unsetactivityarea'}
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
            case 'addtogroup':
                await this.addUserTo('Group', 'groups', args[1], args[2]);
                break;
            case 'delete':
                await this.deleteUser(args[1]);
                break;
            case 'load':
                await this.loadUserList(args[1]);
                break;
            case 'removefromentity':
                await this.removeUserFrom('Entity', 'entities', args[1], args[2]);
                break;
            case 'removefromgroup':
                await this.removeUserFrom('Group', 'groups', args[1], args[2]);
                break;
            case 'set-not-notified':
                await this.configureNotification(args[1], args[2], 'DELETE', 'processstatenotified');
                break;
            case 'set-not-notified-mail':
                await this.configureNotification(args[1], args[2], 'DELETE', 'processstatenotifiedbymail');
                break;
            case 'setactivityarea':
                await this.activityAreaSetter(args[1], args[2], true);
                break;
            case 'set-notified':
                await this.configureNotification(args[1], args[2], 'POST', 'processstatenotified');
                break;
            case 'set-notified-mail':
                await this.configureNotification(args[1], args[2], 'POST', 'processstatenotifiedbymail');
                break;
            case 'unsetactivityarea':
                await this.activityAreaSetter(args[1], args[2], false);
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

    async loadUserList(filePath) {
        filePath = await this.missingPrompt('File path', filePath);
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
                `User ${user.login} created successfully`,
                `Failed to create user ${user.login}`,
                `Failed to create user ${user.login} , not found error`
            );
        }
    },

    async activityAreaSetter(entity, user, setting) {
        entity = await this.missingPrompt('Activity area', entity);
        user = await this.missingPrompt('User', user);

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
        let {entitiesDisconnected} = await entitiesDisconnectedResponse.json();
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
            JSON.stringify({login: user, entitiesDisconnected: entitiesDisconnected}),
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
        console.log(`Usage: opfab users <command>
        
Commands list : 
            addtoentity             Add a <user> to an <entity> : opfab users addtoentity <entityId> <user>
            addtogroup              Add a <user> to a <group> : opfab users addtogroup <groupId> <user>
            delete                  Delete a <user>
            load                    Add or update a list of users : opfab users load <usersFilePath>
            removefromentity        Remove a <user> from an <entity> : opfab users removefromentity <entityId> <user>
            removefromgroup         Remove a <user> from a <group> : opfab users removefromgroup <groupId> <user>
            set-not-notified        Configure <process>/<state> as not to be notified for all users
            set-not-notified-mail   Configure <process>/<state> as not to be notified by email for all users 
            setactivityarea         Set an <activity area> for a <user> : opfab users setactivityarea <activityAreaId> <user> 
            set-notified            Configure <process>/<state> as to be notified for all users 
            set-notified-mail       Configure <process>/<state> as to be notified by email for all users 
            unsetactivityarea       Unset an <activity area> for a <user> : opfab users unsetactivityarea <activityAreaId> <user> 
        `);
    }
};
module.exports = usersCommands;
