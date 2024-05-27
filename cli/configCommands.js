/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

const os = require('os');
const fs = require('fs');
const path = require('path');

const config = {
    configValues: {},

    loadConfig() {
        const configFilePath = path.join(os.homedir(), '/.opfab-cli');
        if (!fs.existsSync(configFilePath)) {
            fs.writeFileSync(configFilePath, JSON.stringify({}));
        }
        this.configValues = JSON.parse(fs.readFileSync(configFilePath));
    },

    saveConfig() {
        const configFilePath = path.join(os.homedir(), '/.opfab-cli');
        fs.writeFileSync(configFilePath, JSON.stringify(this.configValues));
    },

    processConfigCommand(args) {
        const action = args[0];
        const key = args[1];
        const value = args[2];
        switch (action) {
            case 'set':
                this.setConfig(key, value);
                break;
            case 'get':
                console.log(key, '=', this.getConfig(key));
                break;
            case 'list':
                this.listConfig();
                break;
            default:
                console.log('Invalid option');
        }
    },

    listConfig() {
        for (const key in this.configValues) {
            console.log(`${key}: ${this.configValues[key]}`);
        }
    },

    validKeys: ['access_token', 'login', 'url','port'],

    setConfig(key, value) {
        if (!this.validKeys.includes(key)) {
            console.log('Invalid config key', key);
            console.log('Valid config keys are: ', this.validKeys.join(', '));
            return;
        }
        this.configValues[key] = value;
        this.saveConfig(this.configValues);
    },

    getConfig(key) {
        return this.configValues[key];
    },

    printHelp() {
        console.log(`Usage: opfab config <set|get|list> [<key>] [<value>]

    set  Set a configuration value
    get  Get a configuration value
    list List all configuration values
        `);
    }   
};

module.exports = config;
