/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

const prompts = require('prompts');
const utils = require("./utils");
const fs = require('fs').promises;

const externalDevicesCommands = {
    async processExternalDevicesCommand(args) {
        let action = args[0];
        if (!action) {
            action = (
                await prompts({
                    type: 'select',
                    name: 'value',
                    message: 'external device action',
                    choices: [
                        {title: 'Set user devices', value: 'set-user-devices'},
                        {title: 'Remove user devices', value: 'remove-user-devices'}
                    ]
                })
            ).value;
            if (!action) {
                console.log('external-device action is required');
                return;
            }
        }
        switch (action) {
            case 'set-user-devices':
                await this.setUserDevices(args.slice(1));
                break;
            case 'remove-user-devices': 
                await this.removeUserDevices(args.slice(1));
                break;
            default:
                console.log(`Unknown external-device action : ${action}
                `);
                await this.printHelp();
                break;
        }
    },

    async setUserDevices(args) {
        let user = await this.getUser(args);

        if (user) {
            let devices = args.slice(1);
            if (devices?.length === 0) {
                const deviceIds = (
                    await prompts({
                        type: 'text',
                        name: 'value',
                        message: 'external device ID(s)'
                    })
                ).value;
                if (!deviceIds) {
                    console.log('external device ID(s) is required');
                    return;
                }
                devices = deviceIds.trim().split(' ');
            } 

            await utils.sendRequest(
                'externaldevices/configurations/users',
                'POST',
                this.buildJsonRequest(user, devices),
                `External devices for user ${user} configured successfully`,
                `Failed to save external devices for user ${user}`,
                `Failed to save external devices for user ${user}, not found error`
            );
        } else console.log('User is required');
    },

    async removeUserDevices(args) {
        let user = await this.getUser(args);
        
        if (user) {
            await utils.sendRequest(
                `externaldevices/configurations/users/${user}`,
                'DELETE',
                undefined,
                `External devices for user ${user} removed successfully`,
                `Failed to remove external devices for user ${user}`,
                `Failed to remove external devices for user ${user}, not found error`
            );
        } else console.log('User is required');
    },

    async getUser(args) {
        let user;
        if (args?.length === 0) {
            user = (
                await prompts({
                    type: 'text',
                    name: 'value',
                    message: 'user'
                })
            ).value;
        } else user = args[0];
        return user;
    },

    buildJsonRequest(user, devices) {
        const request = {userLogin: user, externalDeviceIds: devices};
        return JSON.stringify(request);
    },

    async printHelp() {
        console.log(`Usage: opfab external-device <command> <user> <deviceId>...

            Command list :
            
                set-user-devices      set the list of devices for a user: opfab external-device set-user-devices <user> <deviceId>...
                remove-user-devices   remove all devices for a user: opfab external-device remove-user-devices <user>
                    
                    `);
    }
};
module.exports = externalDevicesCommands;
