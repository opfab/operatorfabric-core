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
const config = require('./configCommands');

const businessDataCommands = {

    async processBusinessDataCommand(args) {
        let command = args[0];
        if (!command) {
            command = (
                await prompts({
                    type: 'select',
                    name: 'value',
                    message: 'BusinessData command',
                    choices: [
                        {title: 'load', value: 'load'},
                        {title: 'delete', value: 'delete'}
                    ]
                })
            ).value;
            if (!command) {
                console.log('BusinessData command is required');
                return;
            }
        }

        switch (command) {
            case 'load':
                await this.loadBusinessDataFile(args[1]);
                break;
            case 'delete':
                await this.deleteBusinessData(args[1]);
                break;
            default:
                console.log(`Unknown businessdata command : ${command}
                `);
                await this.printHelp();
                break;
        }
    },

    async loadBusinessDataFile(businessDataFile) {
        if (!businessDataFile) {
            businessDataFile = (
                await prompts({
                    type: 'text',
                    name: 'value',
                    message: 'businessData file name '
                })
            ).value;
            if (!businessDataFile) {
                console.log('BusinessData file name is required');
                return;
            }
            }
        const filename = businessDataFile.replace(/^.*[\\/]/, ''); //we remove the path and keep only the filename
        utils.sendFile('businessconfig/businessData/' + filename, businessDataFile);
    },

    async deleteBusinessData(businessDataName) {
        if (!businessDataName) {
            businessDataName = (
                await prompts({
                    type: 'text',
                    name: 'value',
                    message: 'Business Data Name '
                })
            ).value;
            if (!businessDataName) {
                console.log('Business Data Name is required');
                return;
            }
        }

        const url = `${config.getConfig('url')}:${config.getConfig('port')}/businessconfig/businessData/${businessDataName}`;
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
            console.error('Failed to delete business data');
            console.error('Error:', error);
            return;
        }

        switch (response.status) {
            case 204:
                console.info(`Business data with name ${businessDataName} deleted successfully`);
                return;
            case 404:
                console.error(`Business data with name ${businessDataName} not found`);
                return;
            default:
                console.error('Failed to delete business data');
                console.error('Response:', response);
                return;
        }
    },

    async printHelp() {
        console.log(`Usage: opfab businessdata <command> [args]

Command list :

    delete    delete business data : opfab businessdata delete <businessDataName>
    load      load business data from a file : opfab businessdata load <businessDataFileName>    
        
        `);
    }
};
module.exports = businessDataCommands;
