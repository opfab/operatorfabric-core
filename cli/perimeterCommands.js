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
const fs = require('fs').promises;

const perimeterCommands = {

    async processPerimeterCommand(args) {
        let action = args[0];
        if (!action) {
            action = (
                await prompts({
                    type: 'select',
                    name: 'value',
                    message: 'Perimeter action',
                    choices: [
                        { title: 'Create', value: 'create' },
                        { title: 'Delete', value: 'delete' },
                    ],
                })
            ).value;
            if (!action) {
                console.log('Perimeter action is required');
                return;
            }
        }
        switch (action) {
            case 'create':
                await this.createPerimeter(args.slice(1));
                break;
            case 'delete':
                await this.deletePerimeter(args.slice(1));
                break;
            default:
                console.log(`Unknown perimeter action : ${action}
                `);
                await this.printHelp();
                break;
        }
    },


    async createPerimeter(args) {
        let perimeterFile = args[0];

        if (!perimeterFile) {
            perimeterFile = (
                await prompts({
                    type: 'text',
                    name: 'value',
                    message: 'JSON perimeter file name '
                })
            ).value;
            if (!perimeterFile) {
                console.log('JSON perimeter file name is required');
                return;
            }
        }

        let fileContent;
        try {
            fileContent = await fs.readFile(perimeterFile, 'utf8');
        }
        catch (error) {
            console.error('Failed to read perimeter file', perimeterFile);
            console.error('Error:', error);
            return;
        }
        const url = `${config.getConfig('url')}:2002/users/perimeters`;
        const token = config.getConfig('access_token');
        const options = {
            method: 'POST',
            body: fileContent,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };

        let response;
        try {
            response = await fetch(url, options);
        } catch (error) {
            console.error('Failed to create perimeter');
            console.error('Error:', error);
            return;
        }

        if (response.ok) {
            console.error('Perimeter created successfully');
            await response.json();
        }
        else
        {
            console.error('Failed to create perimeter');
            console.error('Response:', response);
        }
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

        const url = `${config.getConfig('url')}:2002/users/perimeters/${perimeterId}`;
        const token = config.getConfig('access_token');
        const options = {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };

        let response;
        try {
            response = await fetch(url, options);
        } catch (error) {
            console.error('Failed to delete perimeter');
            console.error('Error:', error);
            return;
        }

        switch (response.status) {
            case 200:
                console.info(`Perimeter with id ${perimeterId} deleted successfully`);
                return;
            case 404:
                console.error(`Perimeter with id ${perimeterId} not found`);
                return;
            default:
                console.error('Failed to delete perimeter');
                console.error('Response:', response);
                return;
        }
    },

    async printHelp() {
        console.log(`Usage: opfab perimeter <command> <perimeterId|perimeterFileName>

Command list :

    create      create a perimeter : opfab perimeter create <perimeterFileName>
    delete      delete a perimeter by id : opfab perimeter delete <perimeterId>
        
        `);
    }
};
module.exports = perimeterCommands;
