/* Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
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
import ConfigService from './domain/client-side/configService';
import SupervisorService from './domain/client-side/supervisorService';
import OpfabServicesInterface from './common/server-side/opfabServicesInterface';
import logger from './common/server-side/logger';
import AuthorizationService from './common/client-side/authorizationService';

const app = express();
app.disable('x-powered-by');
app.use(bodyParser.json());


// Token verification activated except for heathcheck request 
const jwksUri : string =  config.get('operatorfabric.security.oauth2.resourceserver.jwt.jwk-set-uri');
app.use(
    /\/((?!healthcheck).)*/,
    expressjwt({
        secret: jwksRsa.expressJwtSecret({
            cache: true,
            rateLimit: true,
            jwksRequestsPerMinute: 5,
            jwksUri:jwksUri
        }) as GetVerificationKey,
        algorithms: [ 'RS256' ]
    })
);

app.use(express.static('public'));
const adminPort = config.get('operatorfabric.supervisor.adminPort');

const configService = new ConfigService(
    config.get('operatorfabric.supervisor.defaultConfig'),
    'config/supervisorConfig.json',
    logger
);

const activeOnStartUp = config.get('operatorfabric.supervisor.activeOnStartup');



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
    authorizationService.isAdminUser(req).then((isAdmin) => {
        if (!isAdmin) res.status(403).send();
        else res.send(supervisorService.isActive());
    });
});

app.get('/start', (req, res) => {
    authorizationService.isAdminUser(req).then((isAdmin) => {
        if (!isAdmin) res.status(403).send();
        else {
            logger.info('Start supervisor asked');
            supervisorService.start();
            res.send('Start supervisor');
        }
    });
});

app.get('/stop', (req, res) => {
    authorizationService.isAdminUser(req).then((isAdmin) => {
        if (!isAdmin) res.status(403).send();
        else {
            logger.info('Stop supervisor asked');
            supervisorService.stop();
            res.send('Stop supervisor');
        }
    });
});

app.get('/config', (req, res) => {
        logger.info("Get config");
        res.send(configService.getSupervisorConfig());
});

app.post('/config', (req, res) => {
    authorizationService.isAdminUser(req).then((isAdmin) => {
        if (!isAdmin) res.status(403).send();
        else {
            logger.info('Update configuration');
            const updated = configService.patch(req.body);
            supervisorService.setConfiguration(updated);
            res.send(updated);
        }
    });
});

app.get('/healthcheck', (req, res) => {
    res.send();
});

app.listen(adminPort, () => {
    logger.info(`Opfab connection supervisor listening on port ${adminPort}`);
});

logger.info('Application started');

if (activeOnStartUp) {
    supervisorService.start();
}
