/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {AlertMessageService} from '../services/alerteMessage/AlertMessageService';
import {Message, MessageLevel} from '@ofServices/alerteMessage/model/Message';
import {BusinessConfigAPI} from './businessconfig.api';
import {initUserAPI} from './user.api';
import {HandlebarsAPI} from './handlebars.api';
import {initUtilsAPI} from './utils.api';
import {initNavigateAPI} from './navigate.api';
import {CurrentCardAPI} from './currentcard.api';
import {CurrentUserCardAPI} from './currentusercard.api';
import {initUiAPI} from './ui.api';
import {initCardsAPI} from './cards.api';

declare const opfab: any;

export class OpfabAPI {
    private static initAPIDone = false;

    public static initAPI() {
        if (OpfabAPI.initAPIDone) return;
        OpfabAPI.initAlertAPI();
        initNavigateAPI();
        initUtilsAPI();
        initUserAPI();
        initUiAPI();
        initCardsAPI();
        CurrentCardAPI.init();
        CurrentUserCardAPI.init();
        BusinessConfigAPI.init();
        HandlebarsAPI.init();
        OpfabAPI.initAPIDone = true;
    }

    private static initAlertAPI() {
        opfab.alertMessage = {
            messageLevel: Object.freeze(MessageLevel),
            show(message, messageLevel) {
                const msg = new Message(message, messageLevel);
                return AlertMessageService.sendAlertMessage(msg);
            }
        };
        Object.freeze(opfab.alertMessage);
    }
}
