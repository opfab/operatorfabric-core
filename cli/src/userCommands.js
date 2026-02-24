/* Copyright (c) 2024-2026, RTE (http://www.rte-france.com)
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
const fs = require('node:fs').promises;
const JSON5 = require('json5');

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
                        { title: 'Get last user action', value: 'last-user-action' },
                        { title: 'Patch the settings for a user', value: 'patch-settings' },
                        { title: 'Remove from entity', value: 'remove-from-entity' },
                        { title: 'Remove from group', value: 'remove-from-group' },
                        { title: 'Set not notified', value: 'set-not-notified' },
                        { title: 'Set not notified by mail', value: 'set-not-notified-mail' },
                        { title: 'Set activity area', value: 'set-activity-area' },
                        { title: 'Set notified', value: 'set-notified' },
                        { title: 'Set notified by mail', value: 'set-notified-mail' },
                        { title: 'Get the settings for a user', value: 'settings' },
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
            case 'last-user-action':
                await this.lastUserAction(args[1], args[2]);
                break;
            case 'load':
                await this.loadUserList(args[1]);
                break;
            case 'patch-settings':
                await this.patchSettings(args[1], args[2]);
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
            case 'settings':
                await this.settings(args[1]);
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

    async lastUserAction(option, value) {
        if (!option) {
            const response = (
                await prompts({
                    type: 'select',
                    name: 'value',
                    message: 'Select last user action option',
                    choices: [
                        { title: 'Get last user action for a specific user', value: 'for-user' },
                        { title: 'Get all user last actions', value: 'all-users' },
                        { title: 'Get user last action older than x days', value: 'older-than' }
                    ]
                })
            );
            option = response.value;
            if (!option) {
                console.log('Option is required');
                return;
            }
        }

        let result;
        switch (option) {
            case 'for-user': {
                const user = await utils.missingTextPrompt('User', value);
                result = await utils.sendRequest(
                    `users/lastUserAction/${user}`,
                    'GET',
                    undefined,
                    ``,
                    `Failed to fetch last user action for user ${user}`,
                    `Last user action not found for login: ${user}`
                );
                break;
            }
            case 'all-users':
                result = await utils.sendRequest(
                    `users/lastUserAction`,
                    'GET',
                    undefined,
                    ``,
                    `Failed to fetch all last user actions`,
                    `No last user actions found`
                );
                break;

            case 'older-than': {
                const days = await utils.missingTextPrompt('Number of days', value);
                if (!days) {
                    process.exitCode = 1;
                    return;
                }
                if (Number.isNaN(days) || days <= 0 || !Number.isInteger(Number(days))) {
                    console.error('Number of days must be a positive integer');
                    process.exitCode = 1;
                    return;
                }
                result = await utils.sendRequest(
                    `users/lastUserAction/olderThan/${days}`,
                    'GET',
                    undefined,
                    ``,
                    `Failed to fetch last user actions older than ${days} days`,
                    `No last user actions found`
                );
                break;
            }
            default:
                console.log(`Unknown option: ${option}`);
                console.log('Valid options are: for-user, all-users, older-than');
                process.exitCode = 1;
                return;
        }

        if (result?.ok) {
            const lastUserAction = await result.text();
            console.info(lastUserAction);
        }
    },

    async settings(user) {
        user = await utils.missingTextPrompt('User', user);
        const result = await utils.sendRequest(
            `users/users/${user}/settings`,
            'GET',
            undefined,
            ``,
            `Failed to fetch settings for user ${user}`,
            `Settings not found for login: ${user}`
        );

        if (result?.ok) {
            const settings = await result.text();
            console.info(settings);
        }
    },

    async patchSettings(user, settingsData) {
        user = await utils.missingTextPrompt('User', user);
        settingsData = await utils.missingTextPrompt('Settings data', settingsData);

        if (typeof settingsData === 'string') {
            try {
                settingsData = JSON.parse(settingsData);
            } catch (e) {
                console.error(`Settings data must be a valid JSON string : ${e.message}`);
                return;
            }
        }

        const result = await utils.sendRequest(
            `users/users/${user}/settings`,
            'PATCH',
            JSON.stringify(settingsData),
            ``,
            `Failed to update settings for user ${user}`,
            `Settings not updated for login: ${user}`
        );

        if (result?.ok) {
            const updatedSettings = await result.text();
            console.info(updatedSettings);
        }
    },

    async loadUserList(filePath) {
        filePath = await utils.missingTextPrompt('File path', filePath);
        let userList;
        try {
            userList = JSON5.parse(await fs.readFile(filePath, 'utf8'));
        } catch (error) {
            console.error(`Failed to parse the JSON file: ${error.message}`);
            return;
        }
        for (const user of userList) {
            await utils.sendRequest(
                'users/users',
                'POST',
                JSON.stringify(user),
                `User ${user.login} created or updated successfully`,
                `Failed to create or update user ${user.login}`,
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
        if (!entitiesDisconnectedResponse?.ok) {
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
        } else if (index === -1) {
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

        try {
            const response = await fetch(url, options);

            if (response.ok) {
                console.log('Process/state notification configured successfully');
            } else {
                const errorMsg = await utils.handleApiError(response);
                console.error(`Failed to configure process/state notification for ${process}/${state}`);
                console.error(`Server response: ${errorMsg}`);
                process.exitCode = 1;
            }
        } catch (error) {
            utils.logError(`Failed to configure process/state notification for ${process}/${state}`, error, true);
        }
    },

    async printHelp() {
        console.log(`Usage: opfab user <command>
        
Commands list : 
            add-to-entity           Add a <user> to an <entity> : opfab user add-to-entity <entityId> <user>
            add-to-group            Add a <user> to a <group> : opfab user add-to-group <groupId> <user>
            delete                  Delete a <user> : opfab user delete <user>
            last-user-action        Get last user action with options : 
                                        opfab user last-user-action for-user <user>
                                        opfab user last-user-action all-users
                                        opfab user last-user-action older-than <numberOfDays>
            load                    Add or update a list of users : opfab user load <usersFilePath>
            patch-settings          Patch the settings for a <user> : opfab user patch-settings <user> <settingsData>
                                    settingsData must be a JSON string.
                                    Example:
                                        opfab user patch-settings operator1_fr '{"locale":"fr"}'
            remove-from-entity      Remove a <user> from an <entity> : opfab user remove-from-entity <entityId> <user>
            remove-from-group       Remove a <user> from a <group> : opfab user remove-from-group <groupId> <user>
            set-not-notified        Configure <process>/<state> as not to be notified for all users : opfab user set-not-notified <process> <state>
            set-not-notified-mail   Configure <process>/<state> as not to be notified by email for all users : opfab user set-not-notified-mail <process> <state>
            set-activity-area       Set an <activity area> for a <user> : opfab user set-activity-area <activityAreaId> <user> 
            set-notified            Configure <process>/<state> as to be notified for all users : opfab user set-notified <process> <state>
            set-notified-mail       Configure <process>/<state> as to be notified by email for all users : opfab user set-notified-mail <process> <state>
            settings                Get the settings for a <user> : opfab user settings <user>
            unset-activity-area     Unset an <activity area> for a <user> : opfab user unset-activity-area <activityAreaId> <user> 
        `);
    }
};
module.exports = userCommands;
