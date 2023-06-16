/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import express from 'express';
import bodyParser from 'body-parser';
import config from 'config';

import logger from './domain/server-side/logger';

import AuthenticationService from './domain/client-side/authenticationService';
import ReminderService from './domain/application/reminderService';
import OpfabServicesInterface from './domain/server-side/opfabServicesInterface';
import CardsReminderService from './domain/client-side/cardsRemiderService';
import ConfigService from './domain/client-side/configService';
import {RRuleReminderService} from './domain/application/rruleReminderService';
import RemindDatabaseService from './domain/server-side/remindDatabaseService';

const app = express();
app.disable("x-powered-by");

app.use(bodyParser.json());

app.use(express.static("public"));
const adminPort = config.get('adminPort');


const activeOnStartUp = config.get('activeOnStartup');

const configService = new ConfigService(config.get('defaultConfig'), 'config/serviceConfig.json', logger);

const authenticationService = new AuthenticationService()
    .setTokenExpireClaim(config.get('opfab.tokenExpireClaim'))
    .setLogger(logger);

const remindDatabaseService = new RemindDatabaseService()
    .setMongoDbConfiguration(config.get("mongodb"))
    .setRemindersCollection(ReminderService.REMINDERS_COLLECTION);

const reminderService = new ReminderService()
    .setLogger(logger)
    .setDatabaseService(remindDatabaseService);

const rrRuleRemindDatabaseService = new RemindDatabaseService()
    .setMongoDbConfiguration(config.get("mongodb"))
    .setRemindersCollection(RRuleReminderService.REMINDERS_COLLECTION);

const rruleReminderService = new RRuleReminderService()
    .setLogger(logger)
    .setDatabaseService(rrRuleRemindDatabaseService);

const opfabServicesInterface = new OpfabServicesInterface()
    .setLogin(config.get('opfab.login'))
    .setPassword(config.get('opfab.password'))
    .setOpfabCardRemindUrl(config.get('opfab.cardReminderUrl'))
    .setOpfabGetTokenUrl(config.get('opfab.getTokenUrl'))
    .setAuthenticationService(authenticationService)
    .setLogger(logger)
    .setEventBusConfiguration(config.get("rabbitmq"))
    .addListener(rruleReminderService)
    .addListener(reminderService);


const serviceConfig = configService.getConfig();



const cardsReminderService = new CardsReminderService(opfabServicesInterface, rruleReminderService, reminderService, serviceConfig, logger);



app.get('/status', (req, res) => {

    if (!authenticationService.authorize(req))
        res.status(403).send();
    else
        res.send(activeOnStartUp);
        
});

app.get('/start', (req, res) => {

    if (!authenticationService.authorize(req))
        res.status(403).send();
    else {
        cardsReminderService.start();
        res.send('Start service');
    }
});

app.get('/stop', (req, res) => {

    if (!authenticationService.authorize(req))
        res.status(403).send();
    else {
        logger.info('Stop card reminder service asked');
        cardsReminderService.stop();
        res.send('Stop service');
    }

});

app.get('/config', (req, res) => {
    if (!authenticationService.authorize(req))
        res.status(403).send();
    else {
        res.send(configService.getConfig());
    }

});

app.listen(adminPort, () => {
    logger.info(`Opfab cards reminder service listening on port ${adminPort}`);
});

logger.info('Application started');

if (activeOnStartUp) {
    cardsReminderService.start();
    opfabServicesInterface.startListener();
}