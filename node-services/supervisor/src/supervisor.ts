/* Copyright (c) 2022-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import express from 'express';
import {expressjwt, type GetVerificationKey} from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import bodyParser from 'body-parser';
import config from 'config';
import ConfigService from './domain/client-side/configService';
import SupervisorService from './domain/client-side/supervisorService';
import OpfabServicesInterface from './common/server-side/opfabServicesInterface';
import logger from './common/server-side/logger';
import AuthorizationService from './common/server-side/authorizationService';
import SupervisorDatabaseService from './domain/server-side/supervisorDatabaseService';
import {EntityToSupervise} from './domain/application/entityToSupervise';

const app = express();
app.disable('x-powered-by');
app.use(bodyParser.json());


const jwksUri: string = config.get('operatorfabric.security.oauth2.resourceserver.jwt.jwk-set-uri');

/* eslint-disable */
// disable eslint as false positive , promise are authorized see
// https://community.sonarsource.com/t/express-router-promise-returned-in-function-argument-where-a-void-return-was-expected/95772
app.use(
    /\/((?!healthcheck).)*/,  // Token verification activated except for heathcheck request
    expressjwt({
        secret: jwksRsa.expressJwtSecret({
            cache: true,
            rateLimit: true,
            jwksRequestsPerMinute: 5,
            jwksUri
        }) as GetVerificationKey,
        algorithms: ['RS256']
    })
);
/* eslint-enable */

app.use(express.static('public'));
const adminPort: string = config.get('operatorfabric.supervisor.adminPort');

const supervisorDatabaseService = new SupervisorDatabaseService()
    .setMongoDbConfiguration(config.get('operatorfabric.mongodb'))
    .setLogger(logger);

const configService = new ConfigService(
    supervisorDatabaseService,
    config.get('operatorfabric.supervisor.defaultConfig'),
    'config/supervisorConfig.json',
    logger
);

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
    .setLogger(logger);

const supervisorConfig = configService.getSupervisorConfig();

const supervisorService = new SupervisorService(supervisorConfig, opfabServicesInterface, logger);

app.get('/status', (req, res) => {
    authorizationService
        .isAdminUser(req)
        .then((isAdmin) => {
            if (!isAdmin) res.status(403).send();
            else res.send(supervisorService.isActive());
        })
        .catch((err) => {
            logger.error('Error getting authorization in GET /status' + err);
        });
});

app.get('/start', (req, res) => {
    authorizationService
        .isAdminUser(req)
        .then((isAdmin) => {
            if (!isAdmin) res.status(403).send();
            else {
                logger.info('Start supervisor asked');
                supervisorService.start();
                res.send('Start supervisor');
            }
        })
        .catch((err) => {
            logger.error('Error getting authorization in GET /start' + err);
        });
});

app.get('/stop', (req, res) => {
    authorizationService
        .isAdminUser(req)
        .then((isAdmin) => {
            if (!isAdmin) res.status(403).send();
            else {
                logger.info('Stop supervisor asked');
                supervisorService.stop();
                res.send('Stop supervisor');
            }
        })
        .catch((err) => {
            logger.error('Error getting authorization in GET /start' + err);
        });
});

app.get('/config', (req, res) => {
    logger.info('Get config');
    res.send(configService.getSupervisorConfig());
});

app.post('/config', (req, res) => {
    authorizationService
        .isAdminUser(req)
        .then((isAdmin) => {
            if (!isAdmin) res.status(403).send();
            else {
                logger.info('Update configuration');
                const updated = configService.patch(req.body as object);
                supervisorService.setConfiguration(updated);
                supervisorService.resetConnectionChecker();
                supervisorService.resetAcknowledgementChecker();
                res.send(updated);
            }
        })
        .catch((err) => {
            logger.error('Error in GET /config' + err);
            res.status(403).send();
        });
});

app.get('/healthcheck', (req, res) => {
    res.send();
});

app.get('/supervisedEntities', (req, res) => {
    authorizationService
        .isAdminUser(req)
        .then((isAdmin) => {
            if (!isAdmin) res.status(403).send();
            else {
                supervisorDatabaseService
                    .getSupervisedEntities()
                    .then((entities) => res.send(entities))
                    .catch((err) => {
                        logger.error('Error getting supervised entities in database' + err);
                        res.status(500).send();
                    });
            }
        })
        .catch((err) => {
            logger.error('Error getting authorization in GET /start' + err);
            res.status(403).send();
        });
});

app.post('/supervisedEntities', (req, res) => {
    authorizationService
        .isAdminUser(req)
        .then((isAdmin) => {
            if (!isAdmin) res.status(403).send();
            else {
                const newEntity: EntityToSupervise = req.body;
                logger.info('Add supervised entity ' + JSON.stringify(newEntity));
                configService
                    .saveSupervisedEntity(newEntity)
                    .then((entity) => {
                        supervisorService.setConfiguration(configService.getSupervisorConfig());
                        supervisorService.resetConnectionChecker();
                        res.send(entity);
                    })
                    .catch((err) => {
                        res.status(500).send();
                        logger.error('Error saving supervisedEntities in db' + err);
                    });
            }
        })
        .catch((err) => {
            logger.error('Error in GET /supervisedEntities' + err);
            res.status(403).send();
        });
});

app.delete('/supervisedEntities/:id', (req, res) => {
    authorizationService
        .isAdminUser(req)
        .then((isAdmin) => {
            if (!isAdmin) res.status(403).send();
            else {
                configService
                    .deleteSupervisedEntity(req.params.id)
                    .then(() => {
                        supervisorService.setConfiguration(configService.getSupervisorConfig());
                        supervisorService.resetConnectionChecker();
                        res.send();
                    })
                    .catch((err) => {
                        res.status(500).send();
                        logger.error('Error deleting supervisedEntities in db' + err);
                    });
            }
        })
        .catch((err) => {
            logger.error('Error getting authorization in GET /supervisedEntities' + err);
            res.status(403).send();
        });
});

app.listen(adminPort, () => {
    logger.info(`Opfab connection supervisor listening on port ${adminPort}`);
});

async function start(): Promise<void> {
    await supervisorDatabaseService.connectToMongoDB();
    await configService.synchronizeWithMongoDb();
    if (activeOnStartUp) {
        supervisorService.start();
    }
    logger.info('Application started');
}

start().catch((err) => logger.error('Impossible to start' + err));
