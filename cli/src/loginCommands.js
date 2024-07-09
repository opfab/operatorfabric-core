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

const FIVE_MINUTES = 1000 * 60 * 5;

const loginCommands = {
    url: undefined,
    port: undefined,
    login: undefined,
    password: undefined,

    logout() {
        config.setConfig('access_token', undefined);
        console.log('Logged out');
    },

    status() {
        if (config.getConfig('access_token')) {
            const login = config.getConfig('login');
            const url = config.getConfig('url');
            const port = config.getConfig('port');
            console.log(`Logged in as ${login} to ${url}:${port}`);
        } else {
            console.log('Logged out');
        }
    },

    async processLoginCommand(args) {
        this.url = args[0];
        this.port = args[1];
        this.login = args[2];
        this.password = args[3];
        if (!this.url) {
            this.url = (
                await prompts({
                    type: 'text',
                    name: 'value',
                    message: 'URL'
                })
            ).value;

            if (!this.url) {
                console.log('URL is required');
                return;
            }
        }
        if (!this.port) {
            this.port = (
                await prompts({
                    type: 'text',
                    name: 'value',
                    message: 'Port'
                })
            ).value;

            if (!this.port) {
                console.log('Port is required');
                return;
            }
        }
        if (!this.login) {
            this.login = (
                await prompts({
                    type: 'text',
                    name: 'value',
                    message: 'Login'
                })
            ).value;

            if (!this.login) {
                console.log('Login is required');
                return;
            }
        }
        if (!this.password) {
            this.password = (
                await prompts({
                    type: 'password',
                    name: 'value',
                    message: 'Password'
                })
            ).value;

            if (!this.password) {
                console.log('Password is required');
                return;
            }
        }

        if (!this.url.startsWith('http://') && !this.url.startsWith('https://')) {
            this.url = 'http://' + this.url;
        }

        if (!this.isUserAlreadyLoggedIn()) {
            await this.loginWithUserAndPassword();
        }
    },

    isUserAlreadyLoggedIn() {
        if (config.getConfig('access_token') === undefined) return false;
        else {
            if (config.getConfig('login') !== this.login) return false;
            if (config.getConfig('url') !== this.url) return false;
            if (config.getConfig('port') !== this.port) return false;
            if (config.getConfig('token_expiration') < Date.now() + FIVE_MINUTES) {
                console.log('User logged in but token needs to be refreshed');
                return false;
            }
        }
        console.log('You are already logged in, no need to log in again');
        return true;
    },

    checkIsLogged() {
        const isLogged = config.getConfig('access_token') !== undefined;
        if (!isLogged) console.log('You need to log in first, use command opfab login <url> <port> <login> <password>');
        return isLogged;
    },

    async loginWithUserAndPassword() {
        this.logout();
        console.log('Will try to login with user', this.login);
        const url = `${this.url}:${this.port}/auth/token`;
        const body = `username=${this.login}&password=${this.password}&grant_type=password`;
        const options = {
            method: 'POST',
            body: body,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
            }
        };

        let response;
        try {
            response = await fetch(url, options);
        } catch (error) {
            console.error('Failed to log in');
            console.error('Error:', error);
            return;
        }

        if (!response.ok) {
            if (response.status === 401) {
                console.error('Invalid username or password');
                return;
            }
            console.error('Failed to log in');
            console.error('Response:', response);
            return;
        }
        const responseData = await response.json(); // Parse the response body as JSON

        if (!responseData.access_token) {
            console.error('Failed to log in');
            console.error('Response data:', responseData);
            return;
        }
        config.setConfig('access_token', responseData.access_token);
        config.setConfig('token_expiration', this.getExpirationDate(responseData.access_token));
        config.setConfig('login', this.login);
        config.setConfig('url', this.url);
        config.setConfig('port', this.port);
        console.log(`Logged in with user ${this.login} on ${this.url}:${this.port}`);
    },

    getExpirationDate(token) {
        const payload = token.split('.')[1];
        const decodedPayload = Buffer.from(payload, 'base64').toString('utf8');
        const {exp} = JSON.parse(decodedPayload);
        return exp * 1000; // to have it in ms since epoch
    },

    async printHelp() {
        console.log(`Usage: opfab login <url> <port> <login> <password>`);
    }
};
module.exports = loginCommands;
