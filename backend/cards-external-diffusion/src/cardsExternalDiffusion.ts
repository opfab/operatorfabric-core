/* Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import express, {NextFunction, Request, Response} from 'express';
import {expressjwt} from 'express-jwt';
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
import {loadHelpers} from './domain/server-side/CustomHandlebarsHelpers';

const app = express();
app.disable('x-powered-by');

app.use(bodyParser.json());

const jwksUri: string = config.get('operatorfabric.security.oauth2.resourceserver.jwt.jwk-set-uri');
app.use(
    /\/((?!healthcheck).)*/, // Token verification activated except for healthcheck request
    async (req: any, res: any, next: NextFunction) =>
        expressjwt({
            secret: jwksRsa.expressJwtSecret({
                cache: true,
                rateLimit: true,
                jwksRequestsPerMinute: 5,
                jwksUri: jwksUri
            }),
            algorithms: ['RS256']
        })(req, res, next) as Promise<void>
);

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

// load custom handlebars helpers
// Need to ignore Sonar rule btypescript:S4325 because it is necessary to use "any" here to avoid TypeScript errors
const customHandlebarsHelpersFile = (config.get('operatorfabric.cardsExternalDiffusion') as any) //NOSONAR
    ?.customHandlebarsHelpersFile;
if (customHandlebarsHelpersFile && (customHandlebarsHelpersFile as string).length > 0) {
    try {
        loadHelpers(customHandlebarsHelpersFile as string, logger);
    } catch (err) {
        logger.error('Error loading custom handlebars helpers from ' + customHandlebarsHelpersFile, err);
    }
}

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

const processAdminRequest = (req: Request, res: Response, requestProcessor: Function) => {
    authorizationService
        .isAdminUser(req)
        .then((isAdmin) => {
            if (isAdmin) {
                requestProcessor(req, res);
            } else {
                authorizationService.handleUnauthorizedAccess(req, res);
            }
        })
        .catch((err) => {
            logger.error(`Error processing request ${req.url}: ${err}`);
            res.status(500).send();
        });
};

app.get('/status', (req, res) => {
    processAdminRequest(req, res, () => res.send(cardsExternalDiffusionService.isActive()));
});

app.get('/start', (req, res) => {
    processAdminRequest(req, res, () => {
        cardsExternalDiffusionService.start();
        res.send('Start service');
    });
});

app.get('/stop', (req, res) => {
    processAdminRequest(req, res, () => {
        logger.info('Stop card external diffusion service asked');
        cardsExternalDiffusionService.stop();
        res.send('Stop service');
    });
});

app.get('/config', (req, res) => {
    processAdminRequest(req, res, () => res.send(configService.getConfig()));
});

app.post('/config', (req, res) => {
    processAdminRequest(req, res, () => {
        logger.info('Reconfiguration asked: ' + JSON.stringify(req.body));
        const updated = configService.patch(req.body as object);
        cardsExternalDiffusionService.setConfiguration(updated);
        res.send(updated);
    });
});

app.get('/logLevel', (req, res) => {
    processAdminRequest(req, res, () => res.send(getLogLevel()));
});

app.post('/logLevel', (req, res) => {
    processAdminRequest(req, res, () => {
        logger.info('Set log level: ' + JSON.stringify(req.body));
        const level = req.body.configuredLevel == null ? defaultLogLevel : req.body.configuredLevel.toLowerCase();

        if (setLogLevel(level as string)) {
            res.contentType('text/plain').send(getLogLevel());
        } else {
            res.status(400).send('Bad log level');
        }
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
            if (isAdmin) {
                logger.info('Sending email with cards from the last 24 hours');
                cardsExternalDiffusionService.sendDailyRecap().catch((err) => {
                    logger.error('Error in sendDailyEmail' + err);
                });
                res.send();
            } else {
                authorizationService.handleUnauthorizedAccess(req, res);
            }
        })
        .catch((err) => {
            logger.error('Error in POST /sendDailyEmail' + err);
            res.status(500).send();
        });
});

app.post('/sendWeeklyEmail', (req, res) => {
    authorizationService
        .isAdminUser(req)
        .then((isAdmin) => {
            if (isAdmin) {
                logger.info('Sending email with cards from the last 7 days');
                cardsExternalDiffusionService.sendWeeklyRecap().catch((err) => {
                    logger.error('Error in sendWeeklyEmail' + err);
                });
                res.send();
            } else {
                authorizationService.handleUnauthorizedAccess(req, res);
            }
        })
        .catch((err) => {
            logger.error('Error in POST /sendWeeklyEmail' + err);
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
