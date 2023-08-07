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

import logger from './common/server-side/logger';

import AuthenticationService from './common/client-side/authenticationService'
import ReminderService from './domain/application/reminderService';
import CardsReminderOpfabServicesInterface from './domain/server-side/cardsReminderOpfabServicesInterface';
import CardsReminderService from './domain/client-side/cardsRemiderService';
import {RRuleReminderService} from './domain/application/rruleReminderService';
import RemindDatabaseService from './domain/server-side/remindDatabaseService';
import AuthorizationService from './common/client-side/authorizationService';

const app = express();
app.disable("x-powered-by");

app.use(bodyParser.json());

app.use(express.static("public"));
const adminPort = config.get('cardsReminder.adminPort');


const activeOnStartUp = config.get('cardsReminder.activeOnStartup');

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

const opfabServicesInterface = new CardsReminderOpfabServicesInterface()
    .setLogin(config.get('cardsReminder.opfab.login'))
    .setPassword(config.get('cardsReminder.opfab.password'))
    .setOpfabCardsPublicationUrl(config.get('opfab.cardsPublicationUrl'))
    .setOpfabGetTokenUrl(config.get('opfab.getTokenUrl'))
    .setAuthenticationService(authenticationService)
    .setLogger(logger)
    .setEventBusConfiguration(config.get("rabbitmq"))
    .addListener(rruleReminderService)
    .addListener(reminderService);

const authorizationService = new AuthorizationService()
    .setAuthenticationService(authenticationService)
    .setOpfabServicesInterface(opfabServicesInterface)
    .setLogger(logger);

const cardsReminderService = new CardsReminderService(opfabServicesInterface, rruleReminderService, reminderService, config.get('cardsReminder.checkPeriodInSeconds'), logger);


app.get('/status', (req, res) => {

    authorizationService.isAdminUser(req).then(isAdmin => {
        if (!isAdmin) 
            res.status(403).send();
        else 
            res.send(cardsReminderService.isActive());
    })
        
});

app.get('/start', (req, res) => {

    authorizationService.isAdminUser(req).then(isAdmin => {
        if (!isAdmin) 
            res.status(403).send();
        else {
            cardsReminderService.start();
            res.send('Start service');
        }
    })
});

app.get('/stop', (req, res) => {

    authorizationService.isAdminUser(req).then(isAdmin => {
        if (!isAdmin) 
            res.status(403).send();
        else {
            logger.info('Stop card reminder service asked');
            cardsReminderService.stop();
            res.send('Stop service');
        }
    })
});

app.get('/reset', (req, res) => {

    authorizationService.isAdminUser(req).then(isAdmin => {
        if (!isAdmin) 
            res.status(403).send();
        else {
            logger.info('Reset card reminder service asked');
            cardsReminderService.reset();
            res.send('Reset service');
        }
    })
});

app.listen(adminPort, () => {
    logger.info(`Opfab cards reminder service listening on port ${adminPort}`);
});

logger.info('Application started');

if (activeOnStartUp) {
    cardsReminderService.start();
    opfabServicesInterface.startListener();
}