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

const entityCommands = {
    async processEntityCommand(args) {
        let action = args[0];
        if (!action) {
            action = (
                await prompts({
                    type: 'select',
                    name: 'value',
                    message: 'Entity action',
                    choices: [
                        { title: 'Create or update a list of entities', value: 'load' },
                        { title: 'Delete a list of entities', value: 'delete' }
                    ]
                })
            ).value;
            if (!action) {
                console.log('Entity action is required');
                return;
            }
        }

        switch (action) {
            case 'load':
                await this.loadEntitiesFile(args[1]);
                break;
            case 'delete':
                await this.deleteEntities(args.slice(1));
                break;
            default:
                console.log(`Unknown entity action : ${action}
                `);
                await this.printHelp();
                break;
        }
    },

    async loadEntitiesFile(entitiesFile) {
        if (!entitiesFile) {
            entitiesFile = (
                await prompts({
                    type: 'text',
                    name: 'value',
                    message: 'Entities file name '
                })
            ).value;
            if (!entitiesFile) {
                console.log('Entities file name is required');
                return;
            }
        }
        const entitiesList = JSON.parse(await fs.readFile(entitiesFile, 'utf8'));
        for (const entity of entitiesList) {
            await utils.sendRequest(
                'users/entities',
                'POST',
                JSON.stringify(entity),
                `Entity ${entity.id} created successfully`,
                `Failed to create or udpate entity ${entity.id}`,
                `Failed to create or update entity ${entity.id} , not found error`
            );
        }
    },

    async deleteEntities(args) {
        let entityIds = args;
        if (entityIds.length === 0) {
            entityIds = (
                await prompts({
                    type: 'text',
                    name: 'value',
                    message: 'Entity ID(s)'
                })
            ).value;
            if (!entityIds) {
                console.log('Entity ID(s) is required');
                return;
            }
            entityIds = entityIds.split(' ');
        }

        for (const entityId of entityIds) {
            if (entityId.length > 0) {
                await utils.sendRequest(
                    `users/entities/${entityId}`,
                    'DELETE',
                    undefined,
                    `Entity ${entityId} deleted successfully`,
                    `Failed to delete entity`,
                    `Entity ${entityId} not found`
                );
            }
        }
    },

    async printHelp() {
        console.log(`Usage: opfab entity <command> <entityId...|entitiesFileName>

Command list :

    load      create or update entities : opfab entity load <entitiesFileName>
    delete    delete entities : opfab entity delete <entityId>...
        
        `);
    }
};
module.exports = entityCommands;
