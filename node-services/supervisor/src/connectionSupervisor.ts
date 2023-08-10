/* Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
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


import ConfigService from './domain/client-side/configService';
import SupervisorService from './domain/client-side/supervisorService';
import AuthenticationService from './common/client-side/authenticationService';
import OpfabServicesInterface from './common/server-side/opfabServicesInterface';
import logger from './common/server-side/logger';

const app = express();
app.disable("x-powered-by");
app.use(bodyParser.json());

app.use(express.static("public"));
const adminPort = config.get('supervisor.adminPort');

const configService = new ConfigService(config.get('supervisor.defaultConfig'), 'config/supervisorConfig.json', logger);

const activeOnStartUp = config.get('supervisor.activeOnStartup');

const authenticationService = new AuthenticationService()
    .setTokenExpireClaim(config.get('opfab.tokenExpireClaim'))
    .setLogger(logger);



const opfabServicesInterface = new OpfabServicesInterface()
    .setLogin(config.get('opfab.login'))
    .setPassword(config.get('opfab.password'))
    .setOpfabUsersUrl(config.get('opfab.usersUrl'))
    .setOpfabCardsConsultationUrl(config.get('opfab.cardsConsultationUrl'))
    .setOpfabCardsPublicationUrl(config.get('opfab.cardsPublicationUrl'))
    .setOpfabGetTokenUrl(config.get('opfab.getTokenUrl'))
    .setAuthenticationService(authenticationService)
    .setLogger(logger);

const supervisorConfig = configService.getSupervisorConfig();

const supervisorService = new SupervisorService(supervisorConfig, opfabServicesInterface, logger);

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
        logger.info('Start supervisor asked');
        supervisorService.start();
        res.send('Start supervisor');
    }
});

app.get('/stop', (req, res) => {
    if (!authenticationService.authorize(req))
        res.status(403).send();
    else {
        logger.info('Stop supervisor asked');
        supervisorService.stop();
        res.send('Stop supervisor');
    }

});

app.get('/config', (req, res) => {
    if (!authenticationService.authorize(req))
        res.status(403).send();
    else {
        res.send(configService.getSupervisorConfig());
    }

});

app.post('/config', (req, res) => {
    if (!authenticationService.authorize(req))
        res.status(403).send();
    else {
        const userLogin = authenticationService.getLogin(req);

        opfabServicesInterface.fetchUser(userLogin).then(userResp => {
            if (!authenticationService.hasUserAnyPermission(userResp.getData(), ['ADMIN']))
                res.status(403).send();
            else {
                logger.info('Update configuration');
                const updated = configService.patch(req.body);
                supervisorService.setConfiguration(updated);
                res.send(updated);
            }
        })
    }
});

app.listen(adminPort, () => {
    logger.info(`Opfab connection supervisor listening on port ${adminPort}`);
});

logger.info('Application started');

if (activeOnStartUp) {
    supervisorService.start();
}
