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
                        {title: 'Remove user devices', value: 'remove-user-devices'},
                        {title: 'Enable device', value: 'enable'},
                        {title: 'Disable device', value: 'disable'}
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
            case 'enable': 
                await this.enableDevice(args.slice(1));
                break;
            case 'disable': 
                await this.disableDevice(args.slice(1));
                break;
            default:
                console.log(`Unknown external-device action : ${action}
                `);
                await this.printHelp();
                break;
        }
    },

    async setUserDevices(args) {
        let user =  await utils.missingTextPrompt('User', args[0]);
        if (!user) {
            return;
        }
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
    },

    async removeUserDevices(args) {
        let user =  await utils.missingTextPrompt('User', args[0]);
        if (!user) {
            return;
        }
        await utils.sendRequest(
            `externaldevices/configurations/users/${user}`,
            'DELETE',
            undefined,
            `External devices for user ${user} removed successfully`,
            `Failed to remove external devices for user ${user}`,
            `Failed to remove external devices for user ${user}, not found error`
        );
    },

    async enableDevice(args) {
        let deviceId =  await utils.missingTextPrompt('Device ID', args[0]);
        if (!deviceId) {
            return;
        }
        await utils.sendRequest(
            `externaldevices/devices/${deviceId}/enable`,
            'POST',
            undefined,
            `External device ${deviceId} enabled successfully`,
            `Failed to enable external device ${deviceId}`,
            `Failed to enable external device ${deviceId}, not found error`
        );
    },

    async disableDevice(args) {
        let deviceId =  await utils.missingTextPrompt('Device ID', args[0]);
        if (!deviceId) {
            return;
        }
        await utils.sendRequest(
            `externaldevices/devices/${deviceId}/disable`,
            'POST',
            undefined,
            `External device ${deviceId} disabled successfully`,
            `Failed to disable external device ${deviceId}`,
            `Failed to disable external device ${deviceId}, not found error`
        );
    },

    buildJsonRequest(user, devices) {
        const request = {userLogin: user, externalDeviceIds: devices};
        return JSON.stringify(request);
    },

    async printHelp() {
        console.log(`Usage: opfab external-device <command> [user] <deviceId>...

            Command list :
            
                set-user-devices      set the list of devices for a user: opfab external-device set-user-devices <user> <deviceId>...
                remove-user-devices   remove all devices for a user: opfab external-device remove-user-devices <user>
                enable                enable an external device: opfab external-device enable <deviceId>
                disable               enable an external device: opfab external-device disable <deviceId> 
                    `);
    }
};
module.exports = externalDevicesCommands;
