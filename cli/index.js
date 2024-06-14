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
const args = process.argv.slice(2);

(async () => {
    if (args[0] === undefined) {
        console.log('Please choose an option');
    } else {
        config.loadConfig();
        switch (args[0]) {
            case 'businessdata':
                exitIfNotLoggedIn();
                await businessData.processBusinessDataCommand(args.slice(1));
                break;
            case 'config':
                config.processConfigCommand(args.slice(1));
                break;
            case 'login':
                await login.processLoginCommand(args.slice(1));
                break;
            case 'logout':
                login.logout();
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
                card.processCardCommand(args.slice(1));
                break;
            case 'perimeter':
                perimeter.processPerimeterCommand(args.slice(1));
                break;
            case 'help':
                printHelp();
                break;
            default:
                console.log(`Unknown command : ${args[0]}
                
To see a list of supported opfab commands, run:
      opfab help
                `);
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

    businessdata    Send business data
    card            Send a card, delete a card or reset the card limiter for sending cards 
    config          Set, get or list opfab cli configuration values
    help            Show help on a command using help <command> or all commands using help  
    login           Log in to opfab
    logout          Log out to opfab
    perimeter       Create or delete a perimeter
    processgroups   Send or clear processgroups
    realtimescreen  Load real time screen definition file
    status          Show login status

`);
    } else {
        switch (args[1]) {
            case 'businessdata':
                businessData.printHelp();
                break;
            case 'card':
                card.printHelp();
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
            case 'default':
                console.log(`No help for command ${args[1]}`);
        }
    }
}
