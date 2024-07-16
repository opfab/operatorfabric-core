/* Copyright (c) 2024, RTE (http://www.rte-france.com)
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

const groupsCommands = {
    async processGroupsCommand(args) {
        let action = args[0];
        if (!action) {
            action = (
                await prompts({
                    type: 'select',
                    name: 'value',
                    message: 'groups action',
                    choices: [{title: 'Load a list of groups', value: 'load'}]
                })
            ).value;
            if (!action) {
                console.log('groups action is required');
                return;
            }
        }

        if (action === 'load') {
            await this.loadGroupsFile(args[1]);
        } else {
            console.log(`Unknown groups action : ${action}
            `);
            await this.printHelp();
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
        const groupsList = JSON.parse(await fs.readFile(groupsFile, 'utf8'));
        for (const group of groupsList) {
            await utils.sendRequest(
                'users/groups',
                'POST',
                JSON.stringify(group),
                `group ${group.id} created successfully`,
                `Failed to create group ${group.id}`,
                `Failed to create group ${group.id} , not found error`
            );
        }
    },

    async printHelp() {
        console.log(`Usage: opfab groups load <groups.json>`);
    }
};
module.exports = groupsCommands;
