#!/usr/bin/env node

/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

const login = require('./loginCommands.js');
const config = require('./configCommands.js');
const card = require('./cardCommands.js');
const perimeter = require('./perimeterCommands.js');
const processGroups = require('./processGroupsCommands.js');
const realtimescreen = require('./realtimescreenCommands.js');
const businessData = require('./businessDataCommands.js');
const service = require('./serviceCommands.js');
const bundleCommand = require('./bundleCommands.js');
const monitoringConfig = require('./monitoringConfigCommands.js');
const connectedUsers = require('./connectedUsersCommands.js');
const users = require('./usersCommands.js');
const entities = require('./entitiesCommands');
const args = process.argv.slice(2);

(async () => {
    if (args[0] === undefined) {
        printHelp();
    } else {
        config.loadConfig();
        switch (args[0]) {
            case 'bundle':
                exitIfNotLoggedIn();
                await bundleCommand.processBundleCommand(args.slice(1));
                break;
            case 'businessdata':
                exitIfNotLoggedIn();
                await businessData.processBusinessDataCommand(args.slice(1));
                break;
            case 'config':
                config.processConfigCommand(args.slice(1));
                break;
            case 'connectedusers':
                exitIfNotLoggedIn();
                await connectedUsers.processConnectedUsersCommand(args.slice(1));
                break;
            case 'entities':
                exitIfNotLoggedIn();
                await entities.processEntitiesCommand(args.slice(1));
                break;
            case 'users':
                exitIfNotLoggedIn();
                await users.processUsersCommand(args.slice(1));
                break;
            case 'login':
                await login.processLoginCommand(args.slice(1));
                break;
            case 'logout':
                login.logout();
                break;
            case 'monitoringconfig':
                exitIfNotLoggedIn();
                await monitoringConfig.processMonitoringConfigCommand(args.slice(1));
                break;
            case 'processgroups':
                exitIfNotLoggedIn();
                await processGroups.processProcessGroupsCommand(args.slice(1));
                break;
            case 'realtimescreen':
                exitIfNotLoggedIn();
                await realtimescreen.processRealtimescreenCommand(args.slice(1));
                break;
            case 'status':
                login.status();
                break;
            case 'card':
                exitIfNotLoggedIn();
                await card.processCardCommand(args.slice(1));
                break;
            case 'perimeter':
                await perimeter.processPerimeterCommand(args.slice(1));
                break;
            case 'service':
                exitIfNotLoggedIn();
                await service.processServiceCommand(args.slice(1));
                break;
            case 'help':
                printHelp();
                break;
            default:
                console.log(`\n Unknown command : ${args[0]}
                `);
                printHelp();
        }
    }
})();

function exitIfNotLoggedIn() {
    if (!login.checkIsLogged()) {
        process.exit();
    }
}

function printHelp() {
    if (args[1] === undefined) {
        console.log(`Usage: opfab <command> [<options>]

Command list :

    bundle          Load or delete a bundle
    businessdata    Send or delete business data
    card            Send a card, delete a card or reset the card limiter for sending cards 
    config          Set, get or list opfab cli configuration values
    connectedusers  Send a message to subscriptions
    entities        Load a list of entities
    help            Show help on a command using help <command> or all commands using help  
    login           Log in to opfab
    logout          Log out to opfab
    monitoringconfig Load or delete a configuration for monitoring screen
    perimeter       Create or delete a perimeter
    processgroups   Send or clear processgroups
    realtimescreen  Load real time screen definition file
    service         Get or set log level for java services
    status          Show login status
    users           Set or unset process/state notifications

`);
    } else {
        switch (args[1]) {
            case 'businessdata':
                businessData.printHelp();
                break;
            case 'bundle':
                bundleCommand.printHelp();
                break;
            case 'card':
                card.printHelp();
                break;
            case 'connectedusers':
                connectedUsers.printHelp();
                break;
            case 'entities':
                entities.printHelp();
                break;
            case 'perimeter':
                perimeter.printHelp();
                break;
            case 'config':
                config.printHelp();
                break;
            case 'login':
                login.printHelp();
                break;
            case 'processgroups':
                processGroups.printHelp();
                break;
            case 'realtimescreen':
                realtimescreen.printHelp();
                break;
            case 'service':
                service.printHelp();
                break;
            case 'monitoringconfig':
                monitoringConfig.printHelp();
                break;
            case 'users':
                users.printHelp();
                break;
            case 'default':
                console.log(`No help for command ${args[1]}`);
        }
    }
}
