/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

const fs = require('fs');
const readline = require('readline');
const prompts = require('prompts');

const login = require('./loginCommands.js');
const config = require('./configCommands.js');
const card = require('./cardCommands.js');
const perimeters = require('./perimetersCommands.js');
const processGroups = require('./processGroupsCommands.js');
const realtimescreen = require('./realtimescreenCommands.js');
const businessData = require('./businessDataCommands.js');
const service = require('./serviceCommands.js');
const bundleCommand = require('./bundleCommands.js');
const monitoringConfig = require('./monitoringConfigCommands.js');
const processMonitoring = require('./processMonitoringCommands.js');
const connectedUsers = require('./connectedUsersCommands.js');
const users = require('./usersCommands.js');
const entities = require('./entitiesCommands');
const groups = require('./groupsCommands');

const commands = {
    async processCommand(args) {
        switch (args[0]) {
            case 'bundle':
                this.exitIfNotLoggedIn();
                await bundleCommand.processBundleCommand(args.slice(1));
                break;
            case 'businessdata':
                this.exitIfNotLoggedIn();
                await businessData.processBusinessDataCommand(args.slice(1));
                break;
            case 'commands':
                commands.processCommandsFile(args.slice(1));
                break;
            case 'config':
                config.processConfigCommand(args.slice(1));
                break;
            case 'connectedusers':
                this.exitIfNotLoggedIn();
                await connectedUsers.processConnectedUsersCommand(args.slice(1));
                break;
            case 'entities':
                this.exitIfNotLoggedIn();
                await entities.processEntitiesCommand(args.slice(1));
                break;
            case 'groups':
                this.exitIfNotLoggedIn();
                await groups.processGroupsCommand(args.slice(1));
                break;
            case 'users':
                this.exitIfNotLoggedIn();
                await users.processUsersCommand(args.slice(1));
                break;
            case 'login':
                await login.processLoginCommand(args.slice(1));
                break;
            case 'logout':
                login.logout();
                break;
            case 'monitoringconfig':
                this.exitIfNotLoggedIn();
                await monitoringConfig.processMonitoringConfigCommand(args.slice(1));
                break;
            case 'processmonitoring':
                this.exitIfNotLoggedIn();
                await processMonitoring.processProcessMonitoringCommand(args.slice(1));
                break;
            case 'processgroups':
                this.exitIfNotLoggedIn();
                await processGroups.processProcessGroupsCommand(args.slice(1));
                break;
            case 'realtimescreen':
                this.exitIfNotLoggedIn();
                await realtimescreen.processRealtimescreenCommand(args.slice(1));
                break;
            case 'status':
                login.status();
                break;
            case 'card':
                this.exitIfNotLoggedIn();
                await card.processCardCommand(args.slice(1));
                break;
            case 'perimeters':
                await perimeters.processPerimetersCommand(args.slice(1));
                break;
            case 'service':
                this.exitIfNotLoggedIn();
                await service.processServiceCommand(args.slice(1));
                break;
            case 'help':
                this.printHelp(args.slice(1));
                break;
            default:
                console.log(`\n Unknown command : ${args[0]}
                `);
                this.printHelp();
        }
    },

    async processCommandsFile(args) {
        let commandsFile = args[0];
        if (!commandsFile) {
            commandsFile = (
                await prompts({
                    type: 'text',
                    name: 'value',
                    message: 'commands file name'
                })
            ).value;
            if (!commandsFile) {
                console.log('commands file name is required');
                return;
            }
        }
        try {
            await fs.promises.access(commandsFile, fs.promises.constants.F_OK);
            this.executeCommands(commandsFile);
        } catch (error) {
            console.log(`Error reading commands file ${commandsFile}: ${error}`);
            return;
        }
    },

    async executeCommands(commandsFile) {
        const commandList = [];
        const fileStream = fs.createReadStream(commandsFile);

        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        rl.on('line', (line) => {
            commandList.push(line);
        });

        rl.on('close', async () => {
            for (let commandLine of commandList) {
                await this.processCommand(commandLine.split(' '));
            }
        });
    },

    exitIfNotLoggedIn() {
        if (!login.checkIsLogged()) {
            process.exit();
        }
    },

    printCommandsHelp() {
        console.log(`Usage: opfab config <set|get|list> [<key>] [<value>]

    set  Set a configuration value
    get  Get a configuration value
    list List all configuration values
        `);
    },

    printHelp(args) {
        if (args === undefined || args.length === 0) {
            console.log(`Usage: opfab <command> [<options>]
    
    Command list :
    
        bundle                  Load or delete a bundle
        businessdata            Load or delete business data
        card                    Send a card, delete a card or reset the card limiter for sending cards 
        commands                Executes commands list read from input file
        config                  Set, get or list opfab cli configuration values
        connectedusers          Send a message to subscriptions
        entities                Load a list of entities
        groups                  Load a list of groups
        help                    Show help on a command using help <command> or all commands using help  
        login                   Log in to opfab
        logout                  Log out to opfab
        monitoringconfig        Load or delete a configuration for monitoring screen
        perimeters              Create or delete perimeters
        processgroups           Load or clear processgroups
        processmonitoring       Load configuration for monitoring processus screen
        realtimescreen          Load real time screen definition file
        service                 Get or set log level for services
        status                  Show login status
        users                   Manage users
    
    `);
        } else {
            switch (args[0]) {
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
                case 'groups':
                    groups.printHelp();
                    break;
                case 'perimeters':
                    perimeters.printHelp();
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
                case 'processmonitoring':
                    processmonitoring.printHelp();
                    break;
                case 'users':
                    users.printHelp();
                    break;
                default:
                    console.log(`No help for command ${args[0]}`);
            }
        }
    }
};

module.exports = commands;
