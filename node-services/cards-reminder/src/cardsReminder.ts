/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import express from 'express';
import {expressjwt, GetVerificationKey} from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import bodyParser from 'body-parser';
import config from 'config';

import logger from './common/server-side/logger';

import ReminderService from './domain/application/reminderService';
import CardsReminderOpfabServicesInterface from './domain/server-side/cardsReminderOpfabServicesInterface';
import CardsReminderService from './domain/client-side/cardsRemiderService';
import {RRuleReminderService} from './domain/application/rruleReminderService';
import RemindDatabaseService from './domain/server-side/remindDatabaseService';
import AuthorizationService from './common/server-side/authorizationService';

const app = express();
app.disable('x-powered-by');

app.use(bodyParser.json());

// Token verification activated except for heathcheck request
const jwksUri: string = config.get('operatorfabric.security.oauth2.resourceserver.jwt.jwk-set-uri');
app.use(
    /\/((?!healthcheck).)*/,
    expressjwt({
        secret: jwksRsa.expressJwtSecret({
            cache: true,
            rateLimit: true,
            jwksRequestsPerMinute: 5,
            jwksUri: jwksUri
        }) as GetVerificationKey,
        algorithms: ['RS256']
    })
);

app.use(express.static('public'));
const adminPort = config.get('operatorfabric.cardsReminder.adminPort');

const activeOnStartUp = config.get('operatorfabric.cardsReminder.activeOnStartup');

const remindDatabaseService = new RemindDatabaseService()
    .setMongoDbConfiguration(config.get('operatorfabric.mongodb'))
    .setRemindersCollection(ReminderService.REMINDERS_COLLECTION)
    .setLogger(logger);

const reminderService = new ReminderService().setLogger(logger).setDatabaseService(remindDatabaseService);

const rRuleRemindDatabaseService = new RemindDatabaseService()
    .setMongoDbConfiguration(config.get('operatorfabric.mongodb'))
    .setRemindersCollection(RRuleReminderService.REMINDERS_COLLECTION)
    .setLogger(logger);

const rruleReminderService = new RRuleReminderService()
    .setLogger(logger)
    .setDatabaseService(rRuleRemindDatabaseService);

const opfabServicesInterface = new CardsReminderOpfabServicesInterface()
    .setLogin(config.get('operatorfabric.internalAccount.login'))
    .setPassword(config.get('operatorfabric.internalAccount.password'))
    .setOpfabCardsPublicationUrl(config.get('operatorfabric.servicesUrls.cardsPublication'))
    .setOpfabUsersUrl(config.get('operatorfabric.servicesUrls.users'))
    .setOpfabGetTokenUrl(config.get('operatorfabric.servicesUrls.authToken'))
    .setLogger(logger)
    .setEventBusConfiguration(config.get('operatorfabric.rabbitmq'))
    .addListener(rruleReminderService)
    .addListener(reminderService);

const authorizationService = new AuthorizationService()
    .setOpfabServicesInterface(opfabServicesInterface)
    .setLogger(logger);

const cardsReminderService = new CardsReminderService(
    opfabServicesInterface,
    rruleReminderService,
    reminderService,
    remindDatabaseService,
    config.get('operatorfabric.cardsReminder.checkPeriodInSeconds'),
    logger
);

app.get('/status', (req, res) => {
    authorizationService.isAdminUser(req).then((isAdmin) => {
        if (!isAdmin) res.status(403).send();
        else res.send(cardsReminderService.isActive());
    });
});

app.get('/start', (req, res) => {
    authorizationService.isAdminUser(req).then((isAdmin) => {
        if (!isAdmin) res.status(403).send();
        else {
            cardsReminderService.start();
            res.send('Start service');
        }
    });
});

app.get('/stop', (req, res) => {
    authorizationService.isAdminUser(req).then((isAdmin) => {
        if (!isAdmin) res.status(403).send();
        else {
            logger.info('Stop card reminder service asked');
            cardsReminderService.stop();
            res.send('Stop service');
        }
    });
});

app.get('/reset', (req, res) => {
    authorizationService.isAdminUser(req).then((isAdmin) => {
        if (!isAdmin) res.status(403).send();
        else {
            logger.info('Reset card reminder service asked');
            cardsReminderService.reset();
            res.send('Reset service');
        }
    });
});

app.get('/healthcheck', (req, res) => {
    res.send();
});

app.listen(adminPort, () => {
    logger.info(`Opfab cards reminder service listening on port ${adminPort}`);
});

opfabServicesInterface.startListener();

async function start() {
    await remindDatabaseService.connectToMongoDB();
    await rRuleRemindDatabaseService.connectToMongoDB();
    if (activeOnStartUp) {
        cardsReminderService.start();
    }
    logger.info('Application started');
}
start();
