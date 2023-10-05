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
import AuthorizationService from './common/client-side/authorizationService'
import SendMailService from './domain/server-side/sendMailService';
import CardsExternalDiffusionOpfabServicesInterface from './domain/server-side/cardsExternalDiffusionOpfabServicesInterface';
import CardsExternalDiffusionService from './domain/client-side/cardsExternalDiffusionService';
import ConfigService from './domain/client-side/configService';

const app = express();
app.disable("x-powered-by");

app.use(bodyParser.json());

app.use(express.static("public"));
const adminPort = config.get('operatorfabric.cardsExternalDiffusion.adminPort');


const activeOnStartUp = config.get('operatorfabric.cardsExternalDiffusion.activeOnStartup');

const configService = new ConfigService(config.get('operatorfabric.cardsExternalDiffusion.defaultConfig'), 'config/serviceConfig.json', logger);



const authenticationService = new AuthenticationService()
    .setLogger(logger);


const mailService = new SendMailService(config.get('operatorfabric.mail'));
    
const opfabServicesInterface = new CardsExternalDiffusionOpfabServicesInterface()
    .setLogin(config.get('operatorfabric.internalAccount.login'))
    .setPassword(config.get('operatorfabric.internalAccount.password'))
    .setOpfabUsersUrl(config.get('operatorfabric.servicesUrls.users'))
    .setOpfabCardsConsultationUrl(config.get('operatorfabric.servicesUrls.cardsConsultation'))
    .setOpfabGetTokenUrl(config.get('operatorfabric.servicesUrls.authToken'))
    .setEventBusConfiguration(config.get('operatorfabric.rabbitmq'))
    .setAuthenticationService(authenticationService)
    .setLogger(logger);

opfabServicesInterface.loadUsersData().catch(error => 
    logger.error("error during loadUsersData", error)
);



const authorizationService = new AuthorizationService()
    .setAuthenticationService(authenticationService)
    .setOpfabServicesInterface(opfabServicesInterface)
    .setLogger(logger);


const serviceConfig = configService.getConfig();

const cardsExternalDiffusionService = new CardsExternalDiffusionService(opfabServicesInterface, mailService, serviceConfig, logger);


app.get('/status', (req, res) => {

    authorizationService.isAdminUser(req).then(isAdmin => {
        if (!isAdmin) 
            res.status(403).send();
        else
            res.send(cardsExternalDiffusionService.isActive());
    });
});

app.get('/start', (req, res) => {

    authorizationService.isAdminUser(req).then(isAdmin => {
        if (!isAdmin) 
            res.status(403).send();
        else {
            cardsExternalDiffusionService.start();
            res.send('Start service');
        }
    })
});

app.get('/stop', (req, res) => {

    authorizationService.isAdminUser(req).then(isAdmin => {
        if (!isAdmin) 
            res.status(403).send();
        else {
            logger.info('Stop card external diffusion service asked');
            cardsExternalDiffusionService.stop();
            res.send('Stop service');
        }
    })
});

app.get('/config', (req, res) => {

    authorizationService.isAdminUser(req).then(isAdmin => {
        if (!isAdmin) 
            res.status(403).send();
        else
            res.send(configService.getConfig());
    });
});

app.post('/config', (req, res) => {

    authorizationService.isAdminUser(req).then(isAdmin => {
        if (!isAdmin) 
            res.status(403).send();
        else {
            logger.info('Reconfiguration asked: ' + JSON.stringify(req.body));
            const updated = configService.patch(req.body);
            cardsExternalDiffusionService.setConfiguration(updated);
            res.send(updated);
        }
    })
});

app.get('/healthcheck', (req, res) => {
    res.send();
});

app.listen(adminPort, () => {
    logger.info(`Opfab card external diffusion service listening on port ${adminPort}`);
});

opfabServicesInterface.startListener();

if (activeOnStartUp) {
    cardsExternalDiffusionService.start();
}

logger.info('Application started');