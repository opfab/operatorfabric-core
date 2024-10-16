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
                        {title: 'Delete', value: 'delete'},
                        {title: 'Delete all', value: 'delete-all'}
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
            case 'delete-all':
                await this.deleteAllBundles();
                break;
            default:
                console.log(`Unknown bundle action : ${action}
                `);
                await this.printHelp();
                break;
        }
    },

    async loadBundle(args) {
        let bundleDirectories = args;
        if (bundleDirectories.length === 0) {
            const bundleDirectory = (
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
            bundleDirectories = [bundleDirectory]
        }
        for (const bundleDirectory of bundleDirectories) {
            let gzippedBundle;
            try {
                const stat = await fs.stat(bundleDirectory);
                if (stat.isDirectory()) {
                    gzippedBundle = await this.tarGZipBundleDirectory(bundleDirectory);
                    try {
                        await utils.sendFile('businessconfig/processes', gzippedBundle, false);
                        console.log(`Bundle ${bundleDirectory} loaded`);
                    } catch (error) {
                        console.log(`Bundle ${bundleDirectory} not loaded`);
                    }
                } else {
                    console.log(`Error: ${bundleDirectory} is not a directory`);
                }
            } catch (error) {
                console.log(`Error reading directory ${bundleDirectory}: ${error}`);
                return;
            } finally {
                if (gzippedBundle) await fs.unlink(gzippedBundle);
            }
        }
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

        await utils.sendRequest(
            `businessconfig/processes/${processId}`,
            'DELETE',
            undefined,
            `Bundle ${processId} deleted successfully`,
            `Failed to delete bundle ${processId}`,
            `Bundle ${processId} not found`
        );
    },

    async deleteAllBundles() {
        await utils.sendRequest(
            `businessconfig/processes`,
            'DELETE',
            undefined,
            `Bundles deleted successfully`,
            `Failed to delete bundles`,
            `Failed to delete bundles, not found error`
        );
    },
    printHelp() {
        console.log(`usage : opfab bundle <command> <bundleDirectory | processId>

 Commands list : 

            load        Load bundle from directory: opfab bundle load <bundleDirectory>... 
            delete      Delete bundle by process : opfab bundle delete <processId>,
            delete-all  Delete all bundles : opfab bundle delete-all
        `);
    }
};

module.exports = bundleCommand;
