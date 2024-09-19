#!/usr/bin/env node

/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

const omelette = require('omelette'); // For completion
const fs = require('fs');

const commands = require('./commands.js');
const config = require('./configCommands.js');
const args = process.argv.slice(2);

const levels = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];

function listFiles() {
    return fs.readdirSync('./');
}

omelette('opfab').tree({
    bundle: {
        load: listFiles,
        delete: []
    },
    businessdata: {
        load: listFiles,
        delete: []
    },
    card: {
        send: listFiles,
        delete: [],
        resetratelimiter: []
    },
    commands: listFiles,
    config: ['set', 'get', 'list'],
    connectedusers: {
        sendmessage: ['RELOAD', 'BUSINESS_CONFIG_CHANGE', 'USER_CONFIG_CHANGE']
    },
    entities: {
        load: listFiles
    },
    groups: {
        load: listFiles
    },
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
    monitoringconfig: {
        load: listFiles,
        delete: []
    },
    perimeters: {
        create: listFiles,
        addtogroup: [],
        delete: []
    },
    processgroups: {
        load: listFiles,
        clear: []
    },
    processmonitoring: {
        load: listFiles
    },
    realtimescreen: {
        load: listFiles
    },
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
        'set-notified',
        'set-not-notified',
        'set-notified-mail',
        'set-not-notified-mail'
    ]
}).init();

(async () => {
    if (args[0] === undefined) {
        commands.printHelp();
    } else {
        config.loadConfig();
        commands.processCommand(args);
    }
})();

