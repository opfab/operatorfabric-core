/* Copyright (c) 2023-2026, RTE (http://www.rte-france.com)
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
import Busboy from 'busboy';
import path from 'node:path';
import fs from 'node:fs';

import AuthorizationService from './common/server-side/authorizationService';
import OutgoingEmailsServer from './domain/server-side/outgoingEmailsServer';
import UsersServer from './domain/server-side/usersServer';
import OutgoingEmailsService from './domain/client-side/outgoingEmailsService';
import ConfigService from './domain/client-side/configService';
import DatabaseServer from './domain/server-side/databaseServer';
import BusinessConfigServer from './domain/server-side/businessConfigServer';
import {getLogger, getLogLevel, setLogLevel} from './common/server-side/logger';
import {loadHelpers} from './domain/server-side/handlebarsHelpersServer';
import IncomingEmailsServer from './domain/server-side/incomingEmailsServer';
import IncomingEmailsService from './domain/client-side/incomingEmailsService';

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
        })(req, res, next)
);

app.use(express.static('public'));
const adminPort = config.get('operatorfabric.emailGateway.adminPort');
const defaultLogLevel = config.get('operatorfabric.logConfig.logLevel');
const logger = getLogger();

const activeOnStartUp = config.get('operatorfabric.emailGateway.activeOnStartup');

const configService = new ConfigService(
    config.get('operatorfabric.emailGateway.defaultConfig'),
    'config/serviceConfig.json',
    logger
);
logger.info('Configuration loaded: ' + JSON.stringify(configService.getConfig()));
// load custom handlebars helpers
// Need to ignore Sonar rule btypescript:S4325 because it is necessary to use "any" here to avoid TypeScript errors
const customHandlebarsHelpersFile = (config.get('operatorfabric.emailGateway') as any)?.customHandlebarsHelpersFile; //NOSONAR
if (customHandlebarsHelpersFile && (customHandlebarsHelpersFile as string).length > 0) {
    try {
        loadHelpers(customHandlebarsHelpersFile as string, logger);
    } catch (err) {
        logger.error('Error loading custom handlebars helpers from ' + customHandlebarsHelpersFile, err);
    }
}

const outgoingEmailsServer = new OutgoingEmailsServer(config.get('operatorfabric.emailGateway.smtpServer'));

const incomingEmailsServer = new IncomingEmailsServer()
    .setEmailServerConfiguration(config.get('operatorfabric.emailGateway.imapServer'))
    .setLogger(logger);

const usersServer = new UsersServer()
    .setLogin(config.get('operatorfabric.internalAccount.login'))
    .setPassword(config.get('operatorfabric.internalAccount.password'))
    .setOpfabUsersUrl(config.get('operatorfabric.servicesUrls.users'))
    .setOpfabCardsConsultationUrl(config.get('operatorfabric.servicesUrls.cardsConsultation'))
    .setOpfabCardsPublicationUrl(config.get('operatorfabric.servicesUrls.cardsPublication'))
    .setopfabBusinessconfigUrl(config.get('operatorfabric.servicesUrls.businessconfig'))
    .setOpfabGetTokenUrl(config.get('operatorfabric.servicesUrls.authToken'))
    .setEventBusConfiguration(config.get('operatorfabric.rabbitmq'))
    .setLogger(logger);

const businessConfigServer = new BusinessConfigServer()
    .setLogin(config.get('operatorfabric.internalAccount.login'))
    .setPassword(config.get('operatorfabric.internalAccount.password'))
    .setOpfabUsersUrl(config.get('operatorfabric.servicesUrls.users'))
    .setOpfabCardsConsultationUrl(config.get('operatorfabric.servicesUrls.cardsConsultation'))
    .setopfabBusinessconfigUrl(config.get('operatorfabric.servicesUrls.businessconfig'))
    .setOpfabGetTokenUrl(config.get('operatorfabric.servicesUrls.authToken'))
    .setEventBusConfiguration(config.get('operatorfabric.rabbitmq'))
    .setLogger(logger);

const databaseServer = new DatabaseServer()
    .setMongoDbConfiguration(config.get('operatorfabric.mongodb'))
    .setLogger(logger);

const authorizationService = new AuthorizationService()
    .setOpfabServicesInterface(usersServer)
    .setLoginClaim(config.get('operatorfabric.security.jwt.login-claim'))
    .setLogger(logger);

const serviceConfig = configService.getConfig();

const outgoingEmailsService = new OutgoingEmailsService(
    usersServer,
    businessConfigServer,
    databaseServer,
    outgoingEmailsServer,
    serviceConfig,
    logger
);

const incomingEmailsService = new IncomingEmailsService(configService, incomingEmailsServer, usersServer, logger);

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
    processAdminRequest(req, res, () => res.send(outgoingEmailsService.isActive()));
});

app.get('/start', (req, res) => {
    processAdminRequest(req, res, () => {
        outgoingEmailsService.start();
        res.send('Start service');
    });
});

app.get('/stop', (req, res) => {
    processAdminRequest(req, res, () => {
        logger.info('Stop email gateway service asked');
        outgoingEmailsService.stop();
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
        outgoingEmailsService.setConfiguration(updated);
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
    logger.info(`Opfab email gateway service listening on port ${adminPort as number}`);
});

app.post('/sendDailyEmail', (req, res) => {
    authorizationService
        .isAdminUser(req)
        .then((isAdmin) => {
            if (isAdmin) {
                logger.info('Sending email with cards from the last 24 hours');
                outgoingEmailsService.sendDailyRecap().catch((err) => {
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
                outgoingEmailsService.sendWeeklyRecap().catch((err) => {
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

// Create directory if it does not exist
const uploadDir = path.join(__dirname, '../config/js');
if (!fs.existsSync(uploadDir)) {
    logger.info('Upload directory does not exist , creating it at ' + uploadDir);
    fs.mkdirSync(uploadDir, {recursive: true});
}

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
    await databaseServer.connectToMongoDB();
    const response = await usersServer.loadUsersData();
    if (!response.isValid()) {
        logger.error('Impossible to load users data, exiting');
        process.exit(1);
    }
    usersServer.startListener();
    businessConfigServer.startListener();

    if (activeOnStartUp as boolean) {
        outgoingEmailsService.start();
        incomingEmailsService.start();
    }
    logger.info('Application started');
}

start().catch((err) => {
    logger.error('Error during start', err);
});
