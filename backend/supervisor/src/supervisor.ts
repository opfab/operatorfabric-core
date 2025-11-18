/* Copyright (c) 2022-2025, RTE (http://www.rte-france.com)
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
import SupervisorService from './domain/client-side/supervisorService';
import OpfabServicesInterface from './common/server-side/opfabServicesInterface';
import {getLogger, getLogLevel, setLogLevel} from './common/server-side/logger';
import AuthorizationService from './common/server-side/authorizationService';
import MongoSupervisorDatabaseServer from './domain/server-side/mongoSupervisorDatabaseServer';
import {EntityToSupervise} from './domain/application/entityToSupervise';

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
const adminPort: string = config.get('operatorfabric.supervisor.adminPort');
const defaultLogLevel = config.get('operatorfabric.logConfig.logLevel');

const logger = getLogger();

const supervisorDatabaseService = new MongoSupervisorDatabaseServer()
    .setMongoDbConfiguration(config.get('operatorfabric.mongodb'))
    .setLogger(logger);

const activeOnStartUp: boolean = config.get('operatorfabric.supervisor.activeOnStartup');

const opfabServicesInterface = new OpfabServicesInterface()
    .setLogin(config.get('operatorfabric.internalAccount.login'))
    .setPassword(config.get('operatorfabric.internalAccount.password'))
    .setOpfabUsersUrl(config.get('operatorfabric.servicesUrls.users'))
    .setOpfabCardsConsultationUrl(config.get('operatorfabric.servicesUrls.cardsConsultation'))
    .setOpfabCardsPublicationUrl(config.get('operatorfabric.servicesUrls.cardsPublication'))
    .setOpfabGetTokenUrl(config.get('operatorfabric.servicesUrls.authToken'))
    .setLogger(logger);

const authorizationService = new AuthorizationService()
    .setOpfabServicesInterface(opfabServicesInterface)
    .setLoginClaim(config.get('operatorfabric.security.jwt.login-claim'))
    .setLogger(logger);

const supervisorService = new SupervisorService(
    config.get('operatorfabric.supervisor.defaultConfig'),
    'config/supervisorConfig.json',
    supervisorDatabaseService,
    opfabServicesInterface,
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
    processAdminRequest(req, res, () => res.send(supervisorService.isActive()));
});

app.get('/start', (req, res) => {
    processAdminRequest(req, res, () => {
        logger.info('Start supervisor asked');
        supervisorService.start();
        res.send('Start supervisor');
    });
});

app.get('/stop', (req, res) => {
    processAdminRequest(req, res, () => {
        logger.info('Stop supervisor asked');
        supervisorService.stop();
        res.send('Stop supervisor');
    });
});

app.get('/config', (req, res) => {
    logger.info('Get config');
    res.send(supervisorService.getSupervisorConfig());
});

app.post('/config', (req, res) => {
    processAdminRequest(req, res, () => {
        logger.info('Update configuration');
        const updated = supervisorService.patch(req.body as object);
        res.send(updated);
    });
});

app.get('/healthcheck', (req, res) => {
    res.send();
});

app.get('/supervisedEntities', (req, res) => {
    processAdminRequest(req, res, () => {
        supervisorDatabaseService
            .getSupervisedEntities()
            .then((entities) => res.send(entities))
            .catch((err) => {
                logger.error('Error getting supervised entities in database' + err);
                res.status(500).send();
            });
    });
});

app.post('/supervisedEntities', (req, res) => {
    processAdminRequest(req, res, () => {
        const newEntity: EntityToSupervise = req.body;
        logger.info('Add supervised entity ' + JSON.stringify(newEntity));
        supervisorService
            .saveSupervisedEntity(newEntity)
            .then(() => {
                res.send();
            })
            .catch((err) => {
                res.status(500).send();
                logger.error('Error saving supervisedEntities in db' + err);
            });
    });
});

app.delete('/supervisedEntities/:id', (req, res) => {
    processAdminRequest(req, res, () => {
        supervisorService
            .deleteSupervisedEntity(req.params.id)
            .then((wasDeleted) => {
                if (wasDeleted) {
                    res.send();
                } else {
                    res.status(404).send({message: 'Entity ' + req.params.id + ' not found'});
                }
            })
            .catch((err) => {
                res.status(500).send();
                logger.error('Error deleting supervisedEntities in db' + err);
            });
    });
});

app.get('/logLevel', (req, res) => {
    processAdminRequest(req, res, () => res.send(getLogLevel()));
});

app.post('/logLevel', (req, res) => {
    processAdminRequest(req, res, () => {
        logger.info('Set log level: ' + JSON.stringify(req.body));
        const level: string =
            req.body.configuredLevel == null ? defaultLogLevel : req.body.configuredLevel.toLowerCase();
        if (setLogLevel(level)) {
            res.contentType('text/plain').send(getLogLevel());
        } else {
            res.status(400).send('Bad log level');
        }
    });
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
    logger.info(`Opfab connection supervisor listening on port ${adminPort}`);
});

async function start(): Promise<void> {
    await supervisorService.init();
    if (activeOnStartUp) {
        supervisorService.start();
    }
    logger.info('Application started');
}

start().catch((err) => logger.error('Impossible to start' + err));
