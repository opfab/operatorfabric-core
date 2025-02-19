/* Copyright (c) 2024-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

const prompts = require('prompts');
const utils = require("./utils");
const fs = require('fs').promises;

const groupCommands = {
    async processGroupCommand(args) {
        let action = args[0];
        if (!action) {
            action = (
                await prompts({
                    type: 'select',
                    name: 'value',
                    message: 'group action',
                    choices: [
                        { title: 'Create or update a list of groups', value: 'load' },
                        { title: 'Delete a list of groups', value: 'delete' }
                    ]
                })
            ).value;
            if (!action) {
                console.log('group action is required');
                return;
            }
        }
        switch (action) {
            case 'load':
                await this.loadGroupsFile(args[1]);
                break;
            case 'delete':
                await this.deleteGroups(args.slice(1));
                break;
            default:
                console.log(`Unknown group action : ${action}
                `);
                await this.printHelp();
                break;
        }
    },

    async loadGroupsFile(groupsFile) {
        if (!groupsFile) {
            groupsFile = (
                await prompts({
                    type: 'text',
                    name: 'value',
                    message: 'groups file name '
                })
            ).value;
            if (!groupsFile) {
                console.log('groups file name is required');
                return;
            }
        }
        try {
            await fs.access(groupsFile, fs.constants.F_OK);
            const groupsList = JSON.parse(await fs.readFile(groupsFile, 'utf8'));
            for (const group of groupsList) {
                await utils.sendRequest(
                    'users/groups',
                    'POST',
                    JSON.stringify(group),
                    `group ${group.id} created or udpated successfully`,
                    `Failed to create or update group ${group.id}`,
                    `Failed to create or update group ${group.id} , not found error`
                );
            }
        } catch (error) {
            console.log(`Error reading groups file ${groupsFile}: ${error}`);
            return;
        }

    },

    async deleteGroups(args) {
        let groups = args;
        if (groups?.length === 0) {
            const groupIds = (
                await prompts({
                    type: 'text',
                    name: 'value',
                    message: 'group ID(s)'
                })
            ).value;
            if (!groupIds) {
                console.log('Group ID(s) is required');
                return;
            }
            groups = groupIds.split(' ');
        }
        for (const groupId of groups) {
            if (groupId.length > 0)
                await utils.sendRequest(
                    `users/groups/${groupId}`,
                    'DELETE',
                    undefined,
                    `Group ${groupId} deleted successfully`,
                    `Failed to delete group`,
                    `Group ${groupId} not found`
                );
        }
    },

    async printHelp() {
        console.log(`Usage: opfab group <command> <groupId|groupsFileName>

            Command list :
            
                load      create or update a list of groups from json file: opfab group load <groupsFileName>
                delete    delete group by id : opfab group delete <groupId>...
                    
                    `);
    }
};
module.exports = groupCommands;
