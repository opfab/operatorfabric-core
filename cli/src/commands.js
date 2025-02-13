/* Copyright (c) 2024-2025, RTE (http://www.rte-france.com)
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
const perimeter = require('./perimeterCommands.js');
const processGroup = require('./processGroupCommands.js');
const realtimescreen = require('./realtimescreenCommands.js');
const businessData = require('./businessDataCommands.js');
const log = require('./logCommands.js');
const supervisor = require('./supervisorCommands.js');
const bundleCommand = require('./bundleCommands.js');
const monitoringConfig = require('./monitoringConfigCommands.js');
const processMonitoring = require('./processMonitoringCommands.js');
const connectedUser = require('./connectedUserCommands.js');
const user = require('./userCommands.js');
const entity = require('./entityCommands');
const group = require('./groupCommands');
const externalDevice = require('./externalDeviceCommands.js');
const reminder = require('./reminderCommands');

const commands = {
    async processCommand(args) {
        switch (args[0]) {
            case 'bundle':
                this.exitIfNotLoggedIn();
                await bundleCommand.processBundleCommand(args.slice(1));
                break;
            case 'business-data':
                this.exitIfNotLoggedIn();
                await businessData.processBusinessDataCommand(args.slice(1));
                break;
            case 'commands':
                commands.processCommandsFile(args.slice(1));
                break;
            case 'config':
                config.processConfigCommand(args.slice(1));
                break;
            case 'connected-user':
                this.exitIfNotLoggedIn();
                await connectedUser.processConnectedUserCommand(args.slice(1));
                break;
            case 'entity':
                this.exitIfNotLoggedIn();
                await entity.processEntityCommand(args.slice(1));
                break;
            case 'group':
                this.exitIfNotLoggedIn();
                await group.processGroupCommand(args.slice(1));
                break;
            case 'user':
                this.exitIfNotLoggedIn();
                await user.processUserCommand(args.slice(1));
                break;
            case 'login':
                await login.processLoginCommand(args.slice(1));
                break;
            case 'logout':
                login.logout();
                break;
            case 'monitoring-config':
                this.exitIfNotLoggedIn();
                await monitoringConfig.processMonitoringConfigCommand(args.slice(1));
                break;
            case 'process-monitoring':
                this.exitIfNotLoggedIn();
                await processMonitoring.processProcessMonitoringCommand(args.slice(1));
                break;
            case 'process-group':
                this.exitIfNotLoggedIn();
                await processGroup.processProcessGroupCommand(args.slice(1));
                break;
            case 'realtime-screen':
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
            case 'perimeter':
                await perimeter.processPerimeterCommand(args.slice(1));
                break;
            case 'reminder':
                await reminder.processReminderCommand(args.slice(1));
                break;
            case 'log':
                this.exitIfNotLoggedIn();
                await log.processLogCommand(args.slice(1));
                break;
            case 'supervisor':
                this.exitIfNotLoggedIn();
                await supervisor.processSupervisorCommand(args.slice(1));
                break;
            case 'external-device':
                this.exitIfNotLoggedIn();
                await externalDevice.processExternalDeviceCommand(args.slice(1));
                break;
            case 'help':
                this.printHelp(args.slice(1));
                break;
            case 'version':
                console.log('OperatorFabric CLI version', require('./package.json').version);
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
            // Exclude commented or empty lines
            if (!line.trimStart().startsWith('#') && line.trim()) {
                commandList.push(line);
            }
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
        console.log(`Usage: opfab commands <fileName>

    The file shall contain a list of opfab cli commands without the 'opfab' keyword.
    One command per line and no end-of-line character. The file can contain comments with "#". e.g. :
            # Add and remove a user from an entity
            user add-to-entity entity username
            user remove-from-entity entity username
        `);
    },

    printHelp(args) {
        if (args === undefined || args.length === 0) {
            console.log(`Usage: opfab <command> [<options>]
    
    Command list :
    
        bundle                  Load or delete a bundle
        business-data           Load or delete business data
        card                    Send a card, delete a card or reset the card limiter for sending cards 
        commands                Executes commands list read from input file
        config                  Set, get or list opfab cli configuration values
        connected-user          Send a message to subscriptions or list all connected users
        entity                  Load a list of entities
        external-device         Manage users external devices
        group                   Load a list of groups
        help                    Show help on a command using help <command> or all commands using help
        log                     Get or set log level for services  
        login                   Log in to opfab
        logout                  Log out to opfab
        monitoring-config       Load or delete a configuration for monitoring screen
        perimeter               Create or delete perimeters
        process-group           Load or clear processgroups
        process-monitoring      Load configuration for monitoring processus screen
        realtime-screen         Load real time screen definition file
        reminder                Manage card reminder service
        status                  Show login status
        supervisor              Manage supervising entities
        user                    Manage users
        version                 Show CLI version
    `);
        } else {
            switch (args[0]) {
                case 'business-data':
                    businessData.printHelp();
                    break;
                case 'bundle':
                    bundleCommand.printHelp();
                    break;
                case 'card':
                    card.printHelp();
                    break;
                case 'commands':
                    this.printCommandsHelp();
                    break;
                case 'connected-user':
                    connectedUser.printHelp();
                    break;
                case 'entity':
                    entity.printHelp();
                    break;
                case 'group':
                    group.printHelp();
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
                case 'process-group':
                    processGroup.printHelp();
                    break;
                case 'realtime-screen':
                    realtimescreen.printHelp();
                    break;
                case 'log':
                    log.printHelp();
                    break;
                case 'supervisor':
                    supervisor.printHelp();
                    break;
                case 'monitoring-config':
                    monitoringConfig.printHelp();
                    break;
                case 'process-monitoring':
                    processmonitoring.printHelp();
                    break;
                case 'reminder':
                    reminder.printHelp();
                    break;
                case 'user':
                    user.printHelp();
                    break;
                case 'external-device':
                    externalDevice.printHelp();
                    break;
                default:
                    console.log(`No help for command ${args[0]}`);
            }
        }
    }
};

module.exports = commands;
