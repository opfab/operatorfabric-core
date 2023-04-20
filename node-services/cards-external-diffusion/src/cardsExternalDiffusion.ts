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

import logger from './domain/server-side/logger';

import AuthenticationService from './domain/client-side/authenticationService';
import SendMailService from './domain/server-side/sendMailService';
import OpfabServicesInterface from './domain/server-side/opfabServicesInterface';
import CardsExternalDiffusionService from './domain/client-side/cardsExternalDiffusionService';
import ConfigService from './domain/client-side/configService';

const app = express();
app.disable("x-powered-by");

app.use(bodyParser.json());

app.use(express.static("public"));
const adminPort = config.get('adminPort');


const activeOnStartUp = config.get('activeOnStartup');

const configService = new ConfigService(config.get('defaultConfig'), 'config/serviceConfig.json', logger);



const authenticationService = new AuthenticationService()
    .setTokenExpireClaim(config.get('opfab.tokenExpireClaim'))
    .setLogger(logger);


const mailService = new SendMailService(config.get('mail'));
    
const opfabServicesInterface = new OpfabServicesInterface()
    .setLogin(config.get('opfab.login'))
    .setPassword(config.get('opfab.password'))
    .setOpfabUrl(config.get('opfab.url'))
    .setOpfabGetUsersUrl(config.get('opfab.usersUrl'))
    .setOpfabGetUsersConnectedUrl(config.get('opfab.connectedUsersUrl'))
    .setOpfabGetCardsUrl(config.get('opfab.cardsUrl'))
    .setOpfabGetTokenUrl(config.get('opfab.getTokenUrl'))
    .setEventBusConfiguration(config.get('rabbitmq'))
    .setAuthenticationService(authenticationService)
    .setLogger(logger);

opfabServicesInterface.loadUsersData().catch(error => 
    logger.error("error during loadUsersData", error)
);


const serviceConfig = configService.getConfig();

const cardsExternalDiffusionService = new CardsExternalDiffusionService(opfabServicesInterface, mailService, serviceConfig, logger);


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
        opfabServicesInterface.startListener();
        cardsExternalDiffusionService.start();
        res.send('Start service');
    }
});

app.get('/stop', (req, res) => {

    if (!authenticationService.authorize(req))
        res.status(403).send();
    else {
        logger.info('Stop card external diffusion service asked');
        cardsExternalDiffusionService.stop();
        opfabServicesInterface.stopListener();
        res.send('Stop service');
    }

});

app.get('/config', (req, res) => {
    if (!authenticationService.authorize(req))
        res.status(403).send();
    else {
        res.send(configService.getConfig());
    }

});

app.post('/config', (req, res) => {

    if (!authenticationService.authorize(req))
        res.status(403).send();
    else {
        logger.info('Reconfiguration asked ' + JSON.stringify(req.body));
        const updated = configService.patch(req.body);
        cardsExternalDiffusionService.setConfiguration(updated);

        res.send(updated);
    }

});

app.listen(adminPort, () => {
    logger.info(`Opfab card external diffusion service listening on port ${adminPort}`);
});

logger.info('Application started');

if (activeOnStartUp) {
    opfabServicesInterface.startListener();
    cardsExternalDiffusionService.start();
}