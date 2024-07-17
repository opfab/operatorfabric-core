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
const fs = require('fs').promises;

const perimetersCommands = {
    async processPerimetersCommand(args) {
        let action = args[0];
        if (!action) {
            action = (
                await prompts({
                    type: 'select',
                    name: 'value',
                    message: 'Perimeters action',
                    choices: [
                        {title: 'Create', value: 'create'},
                        {title: 'Add to group', value: 'addtogroup'},
                        {title: 'Delete', value: 'delete'}
                    ]
                })
            ).value;
            if (!action) {
                console.log('Perimeters action is required');
                return;
            }
        }
        switch (action) {
            case 'create':
                await this.createPerimeters(args.slice(1));
                break;
            case 'addtogroup':
                await this.addPerimeterToGroup(args.slice(1));
                break;
            case 'delete':
                await this.deletePerimeter(args.slice(1));
                break;
            default:
                console.log(`Unknown perimeters action : ${action}
                `);
                await this.printHelp();
                break;
        }
    },

    async createPerimeters(args) {
        let perimetersFiles = args;

        if (perimetersFiles.length === 0) {
            const fileName = (
                await prompts({
                    type: 'text',
                    name: 'value',
                    message: 'JSON perimeters file name '
                })
            ).value;
            if (!fileName) {
                console.log('JSON perimeters file name is required');
                return;
            }
            perimetersFiles = [fileName];
        }
        for (const perimetersFile of perimetersFiles) {
            let fileContent;
            try {
                fileContent = await fs.readFile(perimetersFile, 'utf8');
            } catch (error) {
                console.error('Failed to read perimeters file', perimetersFile);
                console.error('Error:', error);
            }
            if (fileContent) {
                await this.createPerimetersInFileContent(fileContent);
            }
        }
    },

    async createPerimetersInFileContent(fileContent) {
        const perimetersList = JSON.parse(fileContent);
        for (const perimeter of perimetersList) {
            await utils.sendRequest(
                'users/perimeters',
                'POST',
                JSON.stringify(perimeter),
                `Perimeter ${perimeter.id} created successfully`,
                `Failed to create perimeter ${perimeter.id}`,
                `Failed to create perimeter ${perimeter.id} , not found error`
            );
        }
    },

    async fetchPerimeterId(args) {
        let perimeterId = args[0];

        if (!perimeterId) {
            perimeterId = (
                await prompts({
                    type: 'text',
                    name: 'value',
                    message: 'Perimeter ID'
                })
            ).value;
            if (!perimeterId) {
                console.log('Perimeter ID is required');
                return;
            }
        }
        return perimeterId;
    },

    async addPerimeterToGroup(args) {
        const perimeterId = await this.fetchPerimeterId(args);
        if (perimeterId === '') return;

        let groupId = args[1];

        if (!groupId) {
            groupId = (
                await prompts({
                    type: 'text',
                    name: 'value',
                    message: 'Group ID'
                })
            ).value;
            if (!groupId) {
                console.log('Group ID is required');
                return;
            }
        }

        await utils.sendRequest(
            `users/groups/${groupId}/perimeters`,
            'PATCH',
            `["${perimeterId}"]`,
            `Perimeter ${perimeterId} added to group ${groupId} successfully`,
            `Failed to add perimeter to group`,
            `Perimeter ${perimeterId} or group ${groupId} not found`
        );
    },

    async deletePerimeter(args) {
        let perimeterId = args[0];
        if (!perimeterId) {
            perimeterId = (
                await prompts({
                    type: 'text',
                    name: 'value',
                    message: 'Perimeter ID'
                })
            ).value;
            if (!perimeterId) {
                console.log('Perimeter ID is required');
                return;
            }
        }

        await utils.sendRequest(
            `users/perimeters/${perimeterId}`,
            'DELETE',
            undefined,
            `Perimeter ${perimeterId} deleted successfully`,
            `Failed to delete perimeter`,
            `Perimeter ${perimeterId} not found`
        );
    },

    async printHelp() {
        console.log(`Usage: opfab perimeter <command> <perimeterId|perimeterFileName>

Command list :

    create      create a perimeter : opfab perimeter create <perimeterFileName>...
    addtogroup  add a perimeter to a group : opfab perimeter addtogroup <perimeterId> <groupId>
    delete      delete a perimeter by id : opfab perimeter delete <perimeterId>
        
        `);
    }
};
module.exports = perimetersCommands;
