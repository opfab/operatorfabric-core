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

const supervisorCommands = {
    async processSupervisorCommand(args) {
        let command = args[0];
        if (!command) {
            command = (
                await prompts({
                    type: 'select',
                    name: 'value',
                    message: 'Supervisor command',
                    choices: [
                        {title: 'add supervising entity', value: 'add-entity'},
                        {title: 'delete supervising entities', value: 'delete-entity'}
                    ]
                })
            ).value;
            if (!command) {
                console.log('Supervisor command is required');
                return;
            }
        }

        switch (command) {
            case 'add-entity':
                await this.addSupervisorEntity(args[1], args[2]);
                break;
            case 'delete-entity':
                await this.deleteSupervisedEntity(args[1]);
                break;
            default:
                console.log(`Unknown supervisor command : ${command}
                `);
                await this.printHelp();
                break;
        }
    },

    async addSupervisorEntity(supervisedEntity, supervisingEntity) {
        supervisedEntity = await utils.missingTextPrompt('Supervised entity name', supervisedEntity);
        if (!supervisedEntity) {
            return;
        }
        supervisingEntity = await utils.missingTextPrompt('Supervising entity name', supervisingEntity);
        if (!supervisingEntity) {
            return;
        }

        const entityToSuperviseResponse = await utils.sendRequest(
            `supervisor/supervisedEntities`,
            'GET',
            undefined,
            '',
            `Failed to fetch entities to supervise`,
            ``
        );
        if (!entityToSuperviseResponse.ok) {
            return;
        }
        let entitiesToSupervise = await entityToSuperviseResponse.json();
        if (!entitiesToSupervise) {
            entitiesToSupervise = [];
        }
        let entityToSupervise = entitiesToSupervise.find((item) => item.entityId === supervisedEntity);

        if (entityToSupervise) {
            const index = entityToSupervise.supervisors?.indexOf(supervisingEntity);
            if (index == -1) {
                entityToSupervise.supervisors.push(supervisingEntity);
            }
        } else {
            entityToSupervise = {entityId: supervisedEntity, supervisors: [supervisingEntity]};
        }

        await utils.sendRequest(
            `supervisor/supervisedEntities`,
            'POST',
            JSON.stringify(entityToSupervise),
            `Entity ${supervisedEntity} is supervised by entity ${supervisingEntity}`,
            `Failed to set supervising entity`,
            `Supervised entity ${supervisedEntity} or supervising entity ${supervisingEntity} not found`
        );
    },

    async deleteSupervisedEntity(supervisedEntity) {
        supervisedEntity = await utils.missingTextPrompt('Supervised entity name', supervisedEntity);
        if (!supervisedEntity) {
            return;
        }
        await utils.sendRequest(
            `supervisor/supervisedEntities/${supervisedEntity}`,
            'DELETE',
            undefined,
            `Entity ${supervisedEntity} is no longer supervised`,
            `Failed to delete supervisors of entity ${supervisedEntity}`,
            `Supervised entity ${supervisedEntity} not found`
        );
    },

    async printHelp() {
        console.log(`Usage: opfab supervisor <command> [args]

Command list :

    add-entity       add supervisor : opfab add-entity <supervisedEntity> <supervisorEntity>
    delete-entity    delete supervisor : opfab delete-entity <supervisedEntity>

        `);
    }
};
module.exports = supervisorCommands;