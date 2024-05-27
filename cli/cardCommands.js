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

const cardCommands = {
    url: undefined,
    port: undefined,
    login: undefined,
    password: undefined,

    async processCardCommand(args) {
        let action = args[0];
        if (!action) {
            action = (
                await prompts({
                    type: 'select',
                    name: 'value',
                    message: 'Card action',
                    choices: [
                        { title: 'Send', value: 'send' },
                        { title: 'Delete', value: 'delete' },
                    ],
                })
            ).value;
            if (!action) {
                console.log('Card action is required');
                return;
            }
        }
        switch (action) {
            case 'send':
                await this.sendCard(args.slice(1));
                break;
            case 'delete': 
                await this.deleteCard(args.slice(1));
                break;
            default:
                console.log(`Unknown card action : ${action}
                `);
                await this.printHelp();
                break;
        }
    },


    async sendCard(args) {
        let cardFile = args[0];
       
        if (!cardFile) {
            cardFile = (
                await prompts({
                    type: 'text',
                    name: 'value',
                    message: 'JSON card file name '
                })
            ).value;
            if (!cardFile) {
                console.log('JSON Card file name is required');
                return;
            }
        }

        let fileContent;
        try {
            fileContent = await fs.readFile(cardFile, 'utf8');
        }
        catch (error) {
            console.error('Failed to read card file',cardFile);
            console.error('Error:', error);
            return;
        }
        const url = `${config.getConfig('url')}:2102/cards`;
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
            console.error('Failed to send card');
            console.error('Error:', error);
            return;
        }

        if (response.ok) {
            console.error('Card sent successfully');
            const result = await response.json();
            console.error(result);
            return;
        }
        else 
        {
            console.error('Failed to send card');
            console.error('Response:', response);
            return;
        }
    },

    async deleteCard(args) {
        let cardId = args[0];
        if (!cardId) {
            cardId = (
                await prompts({
                    type: 'text',
                    name: 'value',
                    message: 'Card ID'
                })
            ).value;
            if (!cardId) {
                console.log('Card ID is required');
                return;
            }
        }

        const url = `${config.getConfig('url')}:2102/cards/${cardId}`;
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
            console.error('Failed to delete card');
            console.error('Error:', error);
            return;
        }

        switch (response.status) {
            case 200:
                console.info(`Card with id ${cardId} deleted successfully`);
                return;
            case 404:
                console.error(`Card with id ${cardId} not found`);
                return;
            default:
                console.error('Failed to delete card');
                console.error('Response:', response);
                return;
        }
    },

    async printHelp() {
        console.log(`Usage: opfab card <command> <cardId|cardFileName>

Command list :

    send      send a card : opfab card send <cardFileName>
    delete    delete a card by id : opfab card delete <cardId>
        
        `);
    }
};
module.exports = cardCommands;
