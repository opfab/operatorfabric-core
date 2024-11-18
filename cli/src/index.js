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
        bundle: {
            load: [],
            delete: ['#EMPTY_COMPLETION']
        },
        'business-data': {
            load: [],
            delete: ['#EMPTY_COMPLETION']
        },
        card: {
            send: [],
            delete: ['#EMPTY_COMPLETION'],
            'reset-ratelimiter': ['#EMPTY_COMPLETION']
        },
        commands: [],
        config: {
            set: ['#EMPTY_COMPLETION'],
            get: ['#EMPTY_COMPLETION'],
            list: ['#EMPTY_COMPLETION']
        },
        'connected-user': {
            'send-message': ['RELOAD', 'BUSINESS_CONFIG_CHANGE', 'USER_CONFIG_CHANGE'],
            list: ['#EMPTY_COMPLETION']
        },
        entity: {
            load: [],
            delete: ['#EMPTY_COMPLETION']
        },
        'external-device': {
            add: ['#EMPTY_COMPLETION'],
            remove: ['#EMPTY_COMPLETION'],
            'set-user-devices': ['#EMPTY_COMPLETION'],
            'remove-user-devices': ['#EMPTY_COMPLETION'],
            enable: ['#EMPTY_COMPLETION'],
            disable: ['#EMPTY_COMPLETION']
        },
        group: {
            load: [],
            delete: ['#EMPTY_COMPLETION']
        },
        help: {
            bundle: ['#EMPTY_COMPLETION'],
            'business-data': ['#EMPTY_COMPLETION'],
            card: ['#EMPTY_COMPLETION'],
            config: ['#EMPTY_COMPLETION'],
            commands: ['#EMPTY_COMPLETION'],
            'connected-user': ['#EMPTY_COMPLETION'],
            entity: ['#EMPTY_COMPLETION'],
            'external-device': ['#EMPTY_COMPLETION'],
            group: ['#EMPTY_COMPLETION'],
            log: ['#EMPTY_COMPLETION'],
            login: ['#EMPTY_COMPLETION'],
            logout: ['#EMPTY_COMPLETION'],
            'monitoring-config': ['#EMPTY_COMPLETION'],
            perimeter: ['#EMPTY_COMPLETION'],
            'process-group': ['#EMPTY_COMPLETION'],
            'process-monitoring': ['#EMPTY_COMPLETION'],
            'realtime-screen': ['#EMPTY_COMPLETION'],
            reminder: ['#EMPTY_COMPLETION'],
            status: ['#EMPTY_COMPLETION'],
            supervisor: ['#EMPTY_COMPLETION'],
            user: ['#EMPTY_COMPLETION'],
            version: ['#EMPTY_COMPLETION']
        },
        log: {
            'get-level': {
                users: ['#EMPTY_COMPLETION'],
                businessconfig: ['#EMPTY_COMPLETION'],
                'cards-consultation': ['#EMPTY_COMPLETION'],
                'cards-publication': ['#EMPTY_COMPLETION'],
                'external-devices': ['#EMPTY_COMPLETION'],
                supervisor: ['#EMPTY_COMPLETION'],
                'cards-external-diffusion': ['#EMPTY_COMPLETION'],
                'cards-reminder': ['#EMPTY_COMPLETION']
            },
            'set-level': {
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
        login: ['#EMPTY_COMPLETION'],
        logout: ['#EMPTY_COMPLETION'],
        'monitoring-config': {
            load: [],
            delete: ['#EMPTY_COMPLETION']
        },
        perimeter: {
            create: [],
            'add-to-group': ['#EMPTY_COMPLETION'],
            delete: ['#EMPTY_COMPLETION']
        },
        'process-group': {
            load: [],
            clear: ['#EMPTY_COMPLETION']
        },
        'process-monitoring': ['load'],
        'realtime-screen': ['load'],
        reminder: {
            status: ['#EMPTY_COMPLETION'],
            start: ['#EMPTY_COMPLETION'],
            stop: ['#EMPTY_COMPLETION'],
            reset: ['#EMPTY_COMPLETION']
        },
        status: ['#EMPTY_COMPLETION'],
        supervisor: {
            'add-entity': ['#EMPTY_COMPLETION'],
            'delete-entity': ['#EMPTY_COMPLETION'],
            'start': ['#EMPTY_COMPLETION'],
            'stop': ['#EMPTY_COMPLETION']
        },
        user: {
            'add-to-entity': ['#EMPTY_COMPLETION'],
            'add-to-group': ['#EMPTY_COMPLETION'],
            delete: ['#EMPTY_COMPLETION'],
            load: [],
            'remove-from-entity': ['#EMPTY_COMPLETION'],
            'remove-from-group': ['#EMPTY_COMPLETION'],
            'set-not-notified': ['#EMPTY_COMPLETION'],
            'set-not-notified-mail': ['#EMPTY_COMPLETION'],
            'set-activity-area': ['#EMPTY_COMPLETION'],
            'set-notified': ['#EMPTY_COMPLETION'],
            'set-notified-mail': ['#EMPTY_COMPLETION'],
            'unset-activity-area': ['#EMPTY_COMPLETION']
        },
        version: ['#EMPTY_COMPLETION']
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
