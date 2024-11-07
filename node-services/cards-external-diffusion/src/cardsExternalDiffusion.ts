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

import AuthorizationService from './common/server-side/authorizationService';
import SendMailService from './domain/server-side/sendMailService';
import CardsExternalDiffusionOpfabServicesInterface from './domain/server-side/cardsExternalDiffusionOpfabServicesInterface';
import CardsExternalDiffusionService from './domain/client-side/cardsExternalDiffusionService';
import ConfigService from './domain/client-side/configService';
import CardsExternalDiffusionDatabaseService from './domain/server-side/cardsExternaDiffusionDatabaseService';
import BusinessConfigOpfabServicesInterface from './domain/server-side/BusinessConfigOpfabServicesInterface';
import {getLogger, getLogLevel, setLogLevel} from './common/server-side/logger';

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
const adminPort = config.get('operatorfabric.cardsExternalDiffusion.adminPort');
const defaultLogLevel = config.get('operatorfabric.logConfig.logLevel');

const logger = getLogger();

const activeOnStartUp = config.get('operatorfabric.cardsExternalDiffusion.activeOnStartup');

const configService = new ConfigService(
    config.get('operatorfabric.cardsExternalDiffusion.defaultConfig'),
    'config/serviceConfig.json',
    logger
);

const mailService = new SendMailService(config.get('operatorfabric.mail'));

const opfabServicesInterface = new CardsExternalDiffusionOpfabServicesInterface()
    .setLogin(config.get('operatorfabric.internalAccount.login'))
    .setPassword(config.get('operatorfabric.internalAccount.password'))
    .setOpfabUsersUrl(config.get('operatorfabric.servicesUrls.users'))
    .setOpfabCardsConsultationUrl(config.get('operatorfabric.servicesUrls.cardsConsultation'))
    .setopfabBusinessconfigUrl(config.get('operatorfabric.servicesUrls.businessconfig'))
    .setOpfabGetTokenUrl(config.get('operatorfabric.servicesUrls.authToken'))
    .setEventBusConfiguration(config.get('operatorfabric.rabbitmq'))
    .setLogger(logger);

const opfabBusinessConfigServicesInterface = new BusinessConfigOpfabServicesInterface()
    .setLogin(config.get('operatorfabric.internalAccount.login'))
    .setPassword(config.get('operatorfabric.internalAccount.password'))
    .setOpfabUsersUrl(config.get('operatorfabric.servicesUrls.users'))
    .setOpfabCardsConsultationUrl(config.get('operatorfabric.servicesUrls.cardsConsultation'))
    .setopfabBusinessconfigUrl(config.get('operatorfabric.servicesUrls.businessconfig'))
    .setOpfabGetTokenUrl(config.get('operatorfabric.servicesUrls.authToken'))
    .setEventBusConfiguration(config.get('operatorfabric.rabbitmq'))
    .setLogger(logger);

const cardsExternalDiffusionDatabaseService = new CardsExternalDiffusionDatabaseService()
    .setMongoDbConfiguration(config.get('operatorfabric.mongodb'))
    .setLogger(logger);

const authorizationService = new AuthorizationService()
    .setOpfabServicesInterface(opfabServicesInterface)
    .setLoginClaim(config.get('operatorfabric.security.jwt.login-claim'))
    .setLogger(logger);

const serviceConfig = configService.getConfig();

const cardsExternalDiffusionService = new CardsExternalDiffusionService(
    opfabServicesInterface,
    opfabBusinessConfigServicesInterface,
    cardsExternalDiffusionDatabaseService,
    mailService,
    serviceConfig,
    logger
);

app.get('/status', (req, res) => {
    authorizationService
        .isAdminUser(req)
        .then((isAdmin) => {
            if (!isAdmin) authorizationService.handleUnauthorizedAccess(req, res);
            else res.send(cardsExternalDiffusionService.isActive());
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
                cardsExternalDiffusionService.start();
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
                logger.info('Stop card external diffusion service asked');
                cardsExternalDiffusionService.stop();
                res.send('Stop service');
            }
        })
        .catch((err) => {
            logger.error('Error in GET /stop' + err);
            res.status(500).send();
        });
});

app.get('/config', (req, res) => {
    authorizationService
        .isAdminUser(req)
        .then((isAdmin) => {
            if (!isAdmin) authorizationService.handleUnauthorizedAccess(req, res);
            else res.send(configService.getConfig());
        })
        .catch((err) => {
            logger.error('Error in GET /config' + err);
            res.status(500).send();
        });
});

app.post('/config', (req, res) => {
    authorizationService
        .isAdminUser(req)
        .then((isAdmin) => {
            if (!isAdmin) authorizationService.handleUnauthorizedAccess(req, res);
            else {
                logger.info('Reconfiguration asked: ' + JSON.stringify(req.body));
                const updated = configService.patch(req.body as object);
                cardsExternalDiffusionService.setConfiguration(updated);
                res.send(updated);
            }
        })
        .catch((err) => {
            logger.error('Error in POST /config' + err);
            res.status(500).send();
        });
});

app.get('/logLevel', (req, res) => {
    authorizationService
        .isAdminUser(req)
        .then((isAdmin) => {
            if (!isAdmin) authorizationService.handleUnauthorizedAccess(req, res);
            else {
                res.send(getLogLevel());
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
                const level =
                    req.body.configuredLevel != null ? req.body.configuredLevel.toLowerCase() : defaultLogLevel;

                if (setLogLevel(level as string)) {
                    res.contentType('text/plain').send(getLogLevel());
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
        next(err);
    }
});

app.listen(adminPort, () => {
    logger.info(`Opfab card external diffusion service listening on port ${adminPort as number}`);
});

app.post('/sendDailyEmail', (req, res) => {
    authorizationService
        .isAdminUser(req)
        .then((isAdmin) => {
            if (!isAdmin) authorizationService.handleUnauthorizedAccess(req, res);
            else {
                logger.info('Sending email with cards from the last 24 hours');
                cardsExternalDiffusionService.sendDailyRecap().catch((err) => {
                    logger.error('Error in sendDailyEmail' + err);
                });
                res.send();
            }
        })
        .catch((err) => {
            logger.error('Error in POST /sendDailyEmail' + err);
            res.status(500).send();
        });
});

async function start(): Promise<void> {
    await cardsExternalDiffusionDatabaseService.connectToMongoDB();
    const response = await opfabServicesInterface.loadUsersData();
    if (!response.isValid()) {
        logger.error('Impossible to load users data, exiting');
        process.exit(1);
    }
    opfabServicesInterface.startListener();
    opfabBusinessConfigServicesInterface.startListener();

    if (activeOnStartUp as boolean) {
        cardsExternalDiffusionService.start();
    }
    logger.info('Application started');
}

start().catch((err) => {
    logger.error('Error during start', err);
});
