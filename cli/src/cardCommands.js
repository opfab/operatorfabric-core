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
                        { title: 'Reset Rate Limiter', value: 'resetratelimiter' }
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
            case 'resetratelimiter':
                await this.resetRateLimiter();
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
        let cardCustomization = args[1];
       
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
        let card = this.prepareCard(fileContent, cardCustomization);

        const url = `${config.getConfig('url')}:2102/cards`;
        const token = config.getConfig('access_token');
        const options = {
            method: 'POST',
            body: card, 
            headers: {
                'Content-Type': 'application/json', 
                Authorization: `Bearer ${token}`
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
        }
        else 
        {
            console.error('Failed to send card');
            console.error('Response:', response);
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
                Authorization: `Bearer ${token}`
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

    async resetRateLimiter() {
        const url = `${config.getConfig('url')}:${config.getConfig('port')}/cards-publication/cards/rateLimiter`;
        const token = config.getConfig('access_token');
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        };

        let response;
        try {
            response = await fetch(url, options);
        } catch (error) {
            console.error('Failed to reset rate limiter');
            console.error('Error:', error);
            return;
        }

        if (response.ok) {
            console.error('Rate limiter reset');
        }
        else
        {
            console.error('Failed to reset rate limiter');
            console.error('Response:', response);
        }
    },

    prepareCard(card, cardCustomization) {
        const now = new Date().getTime();
        let jsonCard = JSON.parse(card);
        if (cardCustomization) {
            const jsonUpdate = JSON.parse(cardCustomization);
            this.patchCard(jsonCard, jsonUpdate);
        }

        if (jsonCard.startDate != undefined) jsonCard.startDate = now + jsonCard.startDate;
        if (jsonCard.endDate != undefined) jsonCard.endDate = now + jsonCard.endDate;
        if (jsonCard.lttd != undefined) jsonCard.lttd = now + jsonCard.lttd;
        if (jsonCard.expirationDate != undefined) jsonCard.expirationDate = now + jsonCard.expirationDate;

        jsonCard.timeSpans?.forEach(timespan => {
            if (timespan.start != undefined) timespan.start = now + timespan.start;
            if (timespan.end != undefined) timespan.end = now + timespan.end;
        });
        return JSON.stringify(jsonCard);
    },

    patchCard(card, cardCustomization) {
        try {
            for (const [key, value] of Object.entries(cardCustomization)) {
                if (
                    Object.hasOwn(card, key) &&
                    value != null
                ) {
                    card[key] = value;
                }
            }
        } catch (error) {
            this.logger.error(error);
        }

        return card;
    },

    async printHelp() {
        console.log(`Usage: opfab card <command> <cardId|cardFileName> [<cardCustomization>]

Command list :

    send               send a card : opfab card send <cardFileName> [<cardCustomization>]
                       (date values in card must be set as relative to current time.
                       <cardCustomization> is a JSON-serialized string containing card fields to be overridden)
    delete             delete a card by id : opfab card delete <cardId>
    resetratelimiter   reset the rate limiter for sending cards : opfab card resetratelimiter
        
        `);
    }
};
module.exports = cardCommands;
