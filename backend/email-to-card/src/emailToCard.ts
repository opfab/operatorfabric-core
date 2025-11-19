/* Copyright (c) 2025, RTE (http://www.rte-france.com)
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
import EmailToCardService from './domain/client-side/emailToCardService';
import {getLogger} from './common/server-side/logger';
import EmailServer from './domain/server-side/emailServer';

const app = express();
app.disable('x-powered-by');
app.use(bodyParser.json());

const jwksUri: string = config.get('operatorfabric.security.oauth2.resourceserver.jwt.jwk-set-uri');

const secret = jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: jwksUri
}) as unknown;

app.use(
    /\/((?!healthcheck).)*/, // Token verification activated except for healthcheck request
    async (req: any, res: any, next: NextFunction) =>
        expressjwt({
            secret: secret as GetVerificationKey,
            algorithms: ['RS256']
        })(req, res, next) as Promise<void>
);

app.use(express.static('public'));
const adminPort: string = config.get('operatorfabric.emailToCard.adminPort');

const logger = getLogger();

const emailServerService = new EmailServer()
    .setEmailServerConfiguration(config.get('operatorfabric.emailToCard.defaultConfig'))
    .setLogger(logger);

const activeOnStartUp: boolean = config.get('operatorfabric.emailToCard.activeOnStartup');

const emailToCardService = new EmailToCardService(
    config.get('operatorfabric.emailToCard.defaultConfig'),
    'config/emailToCardConfig.json',
    emailServerService,
    logger
);

app.use(function (err: any, req: any, res: any, next: any): void {
    if (err.name === 'UnauthorizedError') {
        logger.warn('SECURITY : try to access resource ' + req.originalUrl + ' without valid token');
        res.status(401).send('Invalid token');
    } else {
        next(err);
    }
});

app.listen(adminPort, () => {
    logger.info(`Opfab connection email-to-card listening on port ${adminPort}`);
});

async function start(): Promise<void> {
    if (activeOnStartUp) {
        emailToCardService.start();
    }
    logger.info('Application started');
}

start().catch((err) => logger.error('Impossible to start' + err));
