/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

const config = require('./configCommands.js');
const fs = require('fs').promises;

const utils = {
    async sendFile(path, fileName, logSuccess = true) {
        try {
            const formData = new FormData();
            const fileContent = await fs.readFile(fileName);
            const blob = new Blob([fileContent]);
            formData.set('file', blob, 'file.json');

            const url = `${config.getConfig('url')}:${config.getConfig('port')}/${path}`;
            const token = config.getConfig('access_token');

            const options = {
                method: 'POST',
                body: formData,
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            const response = await fetch(url, options);

            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error(`User is not authorized`);
                }
                throw new Error(`\n Server response : ${await response.text()} \n`);
            }

            if (logSuccess) console.log(`${fileName} loaded successfully`);
        } catch (error) {
            console.error(`Failed to load ${fileName} : ${error.message}`);
        }
    },
    async sendStringAsFile(path, content, action) {
        const formData = new FormData();
        const blob = new Blob([content]);
        formData.set('file', blob, 'file.json');

        const url = `${config.getConfig('url')}:${config.getConfig('port')}/${path}`;
        const token = config.getConfig('access_token');

        const options = {
            method: 'POST',
            body: formData,
            headers: {
                Authorization: `Bearer ${token}`
            }
        };

        let response;
        try {
            response = await fetch(url, options);
            if (response.ok) {
                console.log(`${action} successfully`);
                console.log(await response.text());
                return;
            } else {
                if (response.status === 403) {
                    throw new Error(`User is not authorized`);
                }
                throw new Error(`\n Server response : ${await response.text()} \n`);
            }
        } catch (error) {
            console.error(`Failed to ${action} : ${error.message}`);
            return;
        }
    },
    async sendRequest(path, method, body,successMessage,errorMessage,notFoundMessage) {
        const url = `${config.getConfig('url')}:${config.getConfig('port')}/${path}`;
        const token = config.getConfig('access_token');

        const options = {
            method: method,
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        };

        if (body) {
            options.body = body;
        }

        let response;
        try {
            response = await fetch(url, options);
        }
        catch (error) {
            console.error(errorMessage);
            console.error(`Error`,error);
            return;
        }
        if (response.ok) {
            console.log(successMessage);
        }
        else {
            switch (response.status) {
                case 404:
                    console.error(notFoundMessage);
                    break;
                case 403:
                    console.error('User is not authorized');
                    break;
                default:
                    console.error(errorMessage);
                    console.error(`Server response : ${await response.text()} \n`);
                    break;
            }
        }
        return response;
    }
};
module.exports = utils;
