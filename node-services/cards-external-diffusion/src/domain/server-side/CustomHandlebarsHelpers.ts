/* Copyright (c) 2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import * as Handlebars from 'handlebars';

export function loadHelpers(filePath: string, logger: any) {
    logger.info('Loading custom handlebars helpers from ' + filePath);
    const code = fs.readFileSync(filePath, 'utf8');
    const globals = {helpers: {}};
    const context = vm.createContext(globals);
    vm.runInContext(code, context, {filename: path.basename(filePath)});

    if (!context.helpers || !Array.isArray(context.helpers)) {
        throw new Error(`Custom Handlebars helpers file ${filePath} must define a 'helpers' array.`);
    }

    for (const helper of context.helpers) {
        if (typeof helper !== 'function' || !helper.name) {
            logger.error(`Each helper must be a named function. Found: ${helper}`);
            continue;
        }
        Handlebars.registerHelper(helper.name, helper);
        logger.info(`Registered Handlebars helper: ${helper.name}`);
    }

    if (logger) {
        logger.info(`Loaded custom Handlebars helpers from ${filePath}`);
    }
    return context;
}
