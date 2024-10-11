#!/usr/bin/env node

/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

const omelette = require('omelette');

const commands = require('./commands.js');
const config = require('./configCommands.js');
const args = process.argv.slice(2);

const levels = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];

// Configuration of autocompletion in the CLI
omelette('opfab')
    .tree({
        bundle: ['load', 'delete'],
        businessdata: ['load', 'delete'],
        card: ['send', 'delete', 'resetratelimiter'],
        commands: [],
        config: ['set', 'get', 'list'],
        connectedusers: {
            sendmessage: ['RELOAD', 'BUSINESS_CONFIG_CHANGE', 'USER_CONFIG_CHANGE']
        },
        entities: ['load', 'delete'],
        groups: ['load', 'delete'],
        help: [
            'bundle',
            'businessdata',
            'card',
            'config',
            'commands',
            'connectedusers',
            'entities',
            'groups',
            'login',
            'logout',
            'monitoringconfig',
            'perimeters',
            'processgroups',
            'processmonitoring',
            'realtimescreen',
            'service',
            'status',
            'users'
        ],
        login: [],
        logout: [],
        monitoringconfig: ['load', 'delete'],
        perimeters: ['create', 'addtogroup', 'delete'],
        processgroups: ['load', 'clear'],
        processmonitoring: ['load'],
        realtimescreen: ['load'],
        reminder: ['status', 'start', 'stop', 'reset'],
        service: {
            'get-log-level': [
                'users',
                'businessconfig',
                'cards-consultation',
                'cards-publication',
                'external-devices',
                'supervisor',
                'cards-external-diffusion',
                'cards-reminder'
            ],
            'set-log-level': {
                users: levels,
                businessconfig: levels,
                'cards-consultation': levels,
                'cards-publication': levels,
                'external-devices': levels,
                supervisor: levels,
                'cards-external-diffusion': levels,
                'cards-reminder': levels
            }
        },
        status: [],
        users: [
            'addtoentity',
            'addtogroup',
            'delete',
            'load',
            'removefromentity',
            'removefromgroup',
            'set-not-notified',
            'set-not-notified-mail',
            'setactivityarea',
            'set-notified',
            'set-notified-mail',
            'unsetactivityarea'
        ],
        version: []
    })
    .init();

(async () => {
    if (args[0] === undefined) {
        commands.printHelp();
    } else {
        config.loadConfig();
        commands.processCommand(args);
    }
})();
