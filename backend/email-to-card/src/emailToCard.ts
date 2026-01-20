/* Copyright (c) 2025-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import express, {NextFunction, Request, Response} from 'express';
import Busboy from 'busboy';
import path from 'node:path';
import fs from 'node:fs';
import {expressjwt, GetVerificationKey} from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import bodyParser from 'body-parser';
import config from 'config';
import EmailToCardService from './domain/client-side/emailToCardService';
import OpfabServicesInterface from './common/server-side/opfabServicesInterface';
import AuthorizationService from './common/server-side/authorizationService';
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
        })(req, res, next)
);

app.use(express.static('public'));
const adminPort: string = config.get('operatorfabric.emailToCard.adminPort');

const logger = getLogger();

const emailServerService = new EmailServer()
    .setEmailServerConfiguration(config.get('operatorfabric.emailToCard.defaultConfig'))
    .setLogger(logger);

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

const activeOnStartUp: boolean = config.get('operatorfabric.emailToCard.activeOnStartup');

const emailToCardService = new EmailToCardService(
    config.get('operatorfabric.emailToCard.defaultConfig'),
    'config/emailToCardConfig.json',
    emailServerService,
    opfabServicesInterface,
    logger
);

// Create directory if it does not exist
const uploadDir = path.join(__dirname, '../config/js');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, {recursive: true});
}

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

app.get('/healthcheck', (req, res) => {
    res.send();
});

app.post('/upload', (req: Request, res: Response) => {
    processAdminRequest(req, res, () => {
        logger.info('Upload file endpoint');

        const busboy = Busboy({
            headers: req.headers
        });

        let fileReceived = false;
        let savedFileName: string | null = null;
        let savedFileSize = 0;

        busboy.on('file', (fieldname, file, info) => {
            if (fieldname !== 'file') {
                file.resume();
                return;
            }

            const filename = info.filename;

            if (!filename?.endsWith('.js')) {
                file.resume();
                busboy.emit('error', new Error('Only .js files are allowed'));
                return;
            }

            fileReceived = true;
            savedFileName = path.basename(filename);
            const filePath = path.join(uploadDir, savedFileName);

            const writeStream = fs.createWriteStream(filePath);

            file.on('data', (data) => {
                savedFileSize += data.length;
            });

            file.pipe(writeStream);

            writeStream.on('error', (err) => {
                busboy.emit('error', err);
            });
        });

        busboy.on('finish', () => {
            if (!fileReceived) {
                return res.status(400).send('No file received or invalid file type (only *.js files accepted)');
            }

            logger.info(`File received : ${savedFileName}, size : ${savedFileSize} bytes`);

            res.send({success: true});
        });

        busboy.on('error', (err: unknown) => {
            logger.error('Upload error:', err);

            if (err instanceof Error) {
                res.status(400).send(err.message);
            } else {
                res.status(400).send('Upload error');
            }
        });

        req.pipe(busboy);
    });
});

app.delete('/delete', (req, res) => {
    processAdminRequest(req, res, () => {
        const uploadDir = path.join(__dirname, '../config/js');

        const filename = req.query.filename as string;
        if (!filename) {
            return res.status(400).send('Missing filename parameter');
        }

        const allowedFiles = fs.readdirSync(uploadDir);
        if (!allowedFiles.includes(filename)) {
            return res.status(400).send('Invalid filename');
        }

        const filePath = path.join(uploadDir, filename);

        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                return res.status(404).send('File not found');
            }

            fs.unlink(filePath, (err) => {
                if (err) {
                    logger.error('Error deleting file:', err);
                    return res.status(500).send('Failed to delete file');
                }

                logger.info(`File deleted: ${filePath}`);
                res.send({success: true, message: `File ${filename} deleted`});
            });
        });
    });
});

app.get('/list', (req, res) => {
    processAdminRequest(req, res, () => {
        const dirPath = path.join(__dirname, '../config/js');

        fs.readdir(dirPath, (err, files) => {
            if (err) {
                logger.error('Error reading directory:', err);
                return res.status(500).send('Failed to read directory');
            }

            const jsFiles = files.filter((f) => f.endsWith('.js'));

            res.send({success: true, files: jsFiles});
        });
    });
});

async function start(): Promise<void> {
    if (activeOnStartUp) {
        emailToCardService.start();
    }
    logger.info('Application started');
}

start().catch((err) => logger.error('Impossible to start: ' + err));
