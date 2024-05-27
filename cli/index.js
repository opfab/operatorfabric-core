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
const card = require('./cardCommands.js')
const args = process.argv.slice(2);

(async () => {
    if (args[0] === undefined) {
        console.log('Please choose an option');
    } else {
        config.loadConfig();
        switch (args[0]) {
            case 'config':
                config.processConfigCommand(args.slice(1));
                break;
            case 'login':
                await login.processLoginCommand(args.slice(1));
                break;
            case 'logout':
                login.logout();
                break;
            case 'status':
                login.status();
                break;
            case 'card':
                if (!login.checkIsLogged()) {
                    return;
                }
                card.processCardCommand(args.slice(1));
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

function printHelp() {
    if (args[1] === undefined) {
        console.log(`Usage: opfab <command> [<options>]

Command list :

    config      Set, get or list opfab cli configuration values
    login       Log in to opfab
    logout      Log out to opfab
    status      Show login status
    card        Send or delete a card 
    help        Show help on a command using help <command> or all commands using help  
`);
    } else {
        switch (args[1]) {
            case 'config':
                config.printHelp();
                break;
            case 'login':
                login.printHelp();
                break;
            case 'card':
                card.printHelp();
                break;
            case 'default':
                console.log(`No help for command ${args[1]}`);
        }
    }
}
