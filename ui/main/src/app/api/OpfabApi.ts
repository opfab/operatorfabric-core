/* Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {AlertMessageService} from '../services/alerteMessage/AlertMessageService';
import {Message, MessageLevel} from '@ofServices/alerteMessage/model/Message';
import {BusinessConfigAPI} from './BusinessConfigApi';
import {initUserAPI} from './UserApi';
import {HandlebarsAPI} from './HandlebarsApi';
import {initUtilsAPI} from './UtilsApi';
import {initNavigateAPI} from './NavigateApi';
import {CurrentCardAPI} from './CurrentCardApi';
import {CurrentUserCardAPI} from './CurrentUserCardApi';
import {initUiAPI} from './UIApi';
import {initCardsAPI} from './CardsApi';

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
