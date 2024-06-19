/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
const prompts = require('prompts');
const fs = require('fs').promises;
const utils = require('./utils.js');
const config = require('./configCommands.js');

const bundleCommand = {
    async processBundleCommand(args) {
        let action = args[0];
        if (!action) {
            action = (
                await prompts({
                    type: 'select',
                    name: 'value',
                    message: 'Bundle action',
                    choices: [
                        {title: 'Load', value: 'load'},
                        {title: 'Delete', value: 'delete'}
                    ]
                })
            ).value;
            if (!action) {
                console.log('Bundle action is required');
                return;
            }
        }
        switch (action) {
            case 'load':
                await this.loadBundle(args.slice(1));
                break;
            case 'delete':
                await this.deleteBundle(args.slice(1));
                break;
            default:
                console.log(`Unknown bundle action : ${action}
                `);
                await this.printHelp();
                break;
        }
    },

    async loadBundle(args) {
        let bundleDirectory = args[0];
        if (!bundleDirectory) {
            bundleDirectory = (
                await prompts({
                    type: 'text',
                    name: 'value',
                    message: 'Bundle directory '
                })
            ).value;
            if (!bundleDirectory) {
                console.log('Bundle directory is required');
                return;
            }
        }
        let gzippedBundle;
        try {
            gzippedBundle = await this.tarGZipBundleDirectory(bundleDirectory);
            await utils.sendFile('businessconfig/processes', gzippedBundle,false);
        } catch (error) {
            console.log(`Error reading directory ${bundleDirectory}: ${error}`);
            return;
        } finally {
            await fs.unlink(gzippedBundle);
        }

        console.log(`Bundle ${bundleDirectory} loaded`);
    },

    async tarGZipBundleDirectory(bundleDirectory) {
        const tar = require('tar');
        const tarball = `${bundleDirectory}.tar.gz`;
        await tar.c(
            {
                gzip: true,
                file: tarball,
                cwd: bundleDirectory
            },
            ['./']
        );
        return tarball;
    },

    async deleteBundle(args) {
        let processId = args[0];
        if (!processId) {
            processId = (
                await prompts({
                    type: 'text',
                    name: 'value',
                    message: 'ProcessId'
                })
            ).value;
            if (!processId) {
                console.log('ProcessId is required');
                return;
            }
        }
        const url = `${config.getConfig('url')}:${config.getConfig('port')}/businessconfig/processes/${processId}`;
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
            console.error('Failed to delete bundle');
            console.error('Error:', error);
            return;
        }

        switch (response.status) {
            case 200:
            case 204:
                console.info(`Bundle ${processId} deleted successfully`);
                return;
            case 404:
                console.error(`Bundle ${processId} not found`);
                return;
            default:
                console.error('Failed to delete bundle');
                console.error('Response:', response);
                return;
        }
    },

    printHelp() {
        console.log(`usage : opfab bundle <command> <bundleDirectory | processId>

 Commands list : 

            load     Load bundle from directory: opfab bundle load <bundleDirectory>  
            delete   Delete bundle by process : opfab bundle delete <processId>
        `);
    }
};

module.exports = bundleCommand;
