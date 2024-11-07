/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import express, {NextFunction} from 'express';
import {expressjwt, GetVerificationKey} from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import bodyParser from 'body-parser';
import config from 'config';

import ReminderService from './domain/application/reminderService';
import CardsReminderOpfabServicesInterface from './domain/server-side/cardsReminderOpfabServicesInterface';
import CardsReminderService from './domain/client-side/cardsReminderService';
import {RRuleReminderService} from './domain/application/rruleReminderService';
import RemindDatabaseService from './domain/server-side/remindDatabaseService';
import AuthorizationService from './common/server-side/authorizationService';
import * as Logger from './common/server-side/logger';

const app = express();
app.disable('x-powered-by');

app.use(bodyParser.json());

/* eslint-disable */
// disable eslint as false positive , promise are authorized see
// https://community.sonarsource.com/t/express-router-promise-returned-in-function-argument-where-a-void-return-was-expected/95772

const jwksUri: string = config.get('operatorfabric.security.oauth2.resourceserver.jwt.jwk-set-uri');
app.use(
    /\/((?!healthcheck).)*/, // Token verification activated except for healthcheck request
    async (req: any, res: any, next: NextFunction) => expressjwt({
        secret: jwksRsa.expressJwtSecret({
            cache: true,
            rateLimit: true,
            jwksRequestsPerMinute: 5,
            jwksUri: jwksUri
        }) as GetVerificationKey,
        algorithms: ['RS256']
    })(req, res, next) as Promise<void>
);
/* eslint-enable */

app.use(express.static('public'));

const defaultLogLevel = config.get('operatorfabric.logConfig.logLevel');
const adminPort: string = config.get('operatorfabric.cardsReminder.adminPort');

const activeOnStartUp: boolean = config.get('operatorfabric.cardsReminder.activeOnStartup');

const logger = Logger.getLogger();

const remindDatabaseService = new RemindDatabaseService()
    .setMongoDbConfiguration(config.get('operatorfabric.mongodb'))
    .setRemindersCollection('reminders')
    .setLogger(logger);

const reminderService = new ReminderService().setLogger(logger).setDatabaseService(remindDatabaseService);

const rRuleRemindDatabaseService = new RemindDatabaseService()
    .setMongoDbConfiguration(config.get('operatorfabric.mongodb'))
    .setRemindersCollection('rrule_reminders')
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
    .setLoginClaim(config.get('operatorfabric.security.jwt.login-claim'))
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
    authorizationService
        .isAdminUser(req)
        .then((isAdmin) => {
            if (!isAdmin) authorizationService.handleUnauthorizedAccess(req, res);
            else res.send(cardsReminderService.isActive());
        })
        .catch((err) => {
            logger.error('Error in GET /status' + err);
            res.status(500).send();
        });
});

app.get('/start', (req, res) => {
    authorizationService
        .isAdminUser(req)
        .then((isAdmin) => {
            if (!isAdmin) authorizationService.handleUnauthorizedAccess(req, res);
            else {
                cardsReminderService.start();
                res.send('Start service');
            }
        })
        .catch((err) => {
            logger.error('Error in GET /start' + err);
            res.status(500).send();
        });
});

app.get('/stop', (req, res) => {
    authorizationService
        .isAdminUser(req)
        .then((isAdmin) => {
            if (!isAdmin) authorizationService.handleUnauthorizedAccess(req, res);
            else {
                logger.info('Stop card reminder service asked');
                cardsReminderService.stop();
                res.send('Stop service');
            }
        })
        .catch((err) => {
            logger.error('Error in GET /stop' + err);
            res.status(500).send();
        });
});

app.get('/reset', (req, res) => {
    authorizationService
        .isAdminUser(req)
        .then((isAdmin) => {
            if (!isAdmin) authorizationService.handleUnauthorizedAccess(req, res);
            else {
                logger.info('Reset card reminder service asked');
                cardsReminderService.reset().catch((err) => {
                    logger.error('Error resetting service in GET /start' + err);
                });
                res.send('Reset service');
            }
        })
        .catch((err) => {
            logger.error('Error resetting service in GET /start' + err);
            res.status(500).send();
        });
});

app.get('/logLevel', (req, res) => {
    authorizationService
        .isAdminUser(req)
        .then((isAdmin) => {
            if (!isAdmin) authorizationService.handleUnauthorizedAccess(req, res);
            else {
                res.send(Logger.getLogLevel());
            }
        })
        .catch((err) => {
            logger.error('Error in GET /logLevel' + err);
            res.status(500).send();
        });
});

app.post('/logLevel', (req, res) => {
    authorizationService
        .isAdminUser(req)
        .then((isAdmin) => {
            if (!isAdmin) authorizationService.handleUnauthorizedAccess(req, res);
            else {
                logger.info('Set log level: ' + JSON.stringify(req.body));
                const level: string =
                    req.body.configuredLevel != null ? req.body.configuredLevel.toLowerCase() : defaultLogLevel;
                if (Logger.setLogLevel(level)) {
                    res.contentType('text/plain').send(Logger.getLogLevel());
                } else {
                    res.status(400).send('Bad log level');
                }
            }
        })
        .catch((err) => {
            logger.error('Error in POST /logLevel' + err);
            res.status(500).send();
        });
});

app.get('/healthcheck', (req, res) => {
    res.send();
});

app.use(function (err: any, req: any, res: any, next: any): void {
    if (err.name === 'UnauthorizedError') {
        logger.warn('SECURITY : try to access resource ' + req.originalUrl + ' without valid token');
        res.status(401).send('Invalid token');
    } else {
        logger.error('Catched error ' + err);
        next(err);
    }
});

app.listen(adminPort, () => {
    logger.info(`Opfab cards reminder service listening on port ${adminPort}`);
});

opfabServicesInterface.startListener();

async function start(): Promise<void> {
    await remindDatabaseService.connectToMongoDB();
    await rRuleRemindDatabaseService.connectToMongoDB();
    if (activeOnStartUp) {
        cardsReminderService.start();
    }
    logger.info('Application started');
}

start().catch((err) => logger.error('Impossible to start' + err));
