/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import express from 'express';
import config from 'config';
import Logger from './common/server-side/logger';
import {BusinessConfigService} from './domain/client-side/businessConfigService';
import multer from 'multer';

const app = express();
app.disable('x-powered-by');
//app.use(bodyParser.json());
// Configure multer to store files in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const logger = Logger.getLogger();

const port = config.get('operatorfabric.businessconfig.port');
const storagePath = config.get('operatorfabric.businessconfig.storage.path');

const businessConfigService = new BusinessConfigService(storagePath as string);

app.get('/*', (req, res) => {
    const version = req.query.version as string;
    const serviceResponse = businessConfigService.getResource(req.url, version, [])
    res.statusCode = serviceResponse.returnCode;
    res.send(serviceResponse.response);
});

app.post('/*',  upload.single('file'), async (req, res) => {
    // Access the file from req.file
    if (req.file) {
        const fileBuffer = req.file.buffer;
        const serviceResponse = await businessConfigService.postResource(req.url,fileBuffer,[]);
        res.statusCode = serviceResponse.returnCode;
        res.send(serviceResponse.response);
        res.send('File uploaded and processed in memory.');
    } else {
        res.send('No file uploaded.');
    }
});

app.listen(port, () => {
    logger.info(`Opfab businessconfig listening on port ${port}`);
});
