/* Copyright (c) 2024-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

const config = require('./configCommands.js');
const fs = require('node:fs').promises;
const prompts = require('prompts');

const utils = {
    /**
     * Handle API errors consistently
     * @param {Response} response - Fetch response object
     * @returns {Promise<string>} Error message
     */
    async handleApiError(response) {
        if (response.status === 403) {
            return 'User is not authorized';
        }
        if (response.status === 404) {
            return 'Resource not found';
        }
        try {
            const text = await response.text();
            return text || `Server error: ${response.status} ${response.statusText}`;
        } catch {
            return `Server error: ${response.status} ${response.statusText}`;
        }
    },

    /**
     * Log error and optionally set exit code
     * @param {string} message - Error message
     * @param {Error} error - Error object
     * @param {boolean} setExitCode - Whether to set process.exitCode
     */
    logError(message, error, setExitCode = false) {
        console.error(message);
        if (error) {
            console.error('Error:', error.message || error);
        }
        if (setExitCode) {
            process.exitCode = 1;
        }
    },

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
                const errorMsg = await this.handleApiError(response);
                throw new Error(errorMsg);
            }

            if (logSuccess) console.log(`${fileName} loaded successfully`);
        } catch (error) {
            this.logError(`Failed to load ${fileName}`, error, true);
            throw error;
        }
    },

    async sendStringAsFile(path, content, action) {
        try {
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

            const response = await fetch(url, options);

            if (!response.ok) {
                const errorMsg = await this.handleApiError(response);
                throw new Error(errorMsg);
            }

            console.log(`${action} successfully`);
            const result = await response.text();
            if (result) console.log(result);
        } catch (error) {
            this.logError(`Failed to ${action}`, error, true);
            throw error;
        }
    },

    async sendRequest(path, method, body, successMessage, errorMessage, notFoundMessage) {
        const url = `${config.getConfig('url')}:${config.getConfig('port')}/${path}`;
        const token = config.getConfig('access_token');

        const options = {
            method: method,
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };

        if (body) {
            options.body = body;
        }

        try {
            const response = await fetch(url, options);

            if (response.ok) {
                console.log(successMessage);
                return response;
            }

            // Handle error responses
            const errorMsg = await this.handleApiError(response);

            if (response.status === 404 && notFoundMessage) {
                console.error(notFoundMessage);
            } else if (response.status === 403) {
                console.error('User is not authorized');
            } else {
                console.error(errorMessage);
                console.error(`Server response: ${errorMsg}`);
            }

            process.exitCode = 1;
            return response;
        } catch (error) {
            this.logError(errorMessage, error, true);
            throw error;
        }
    },

    async missingTextPrompt(object, objectId) {
        if (!objectId) {
            objectId = (
                await prompts({
                    type: 'text',
                    name: 'value',
                    message: `${object} `
                })
            ).value;
            if (!objectId) {
                console.log(`${object} is required`);
                return;
            }
        }
        return objectId;
    }
};
module.exports = utils;
