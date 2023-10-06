/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Message} from '@ofModel/message.model';
import {Observable, Subject} from 'rxjs';

export class AlertMessageService {
    private static instance: AlertMessageService;
    private alertEvent = new Subject<Message>();

    private constructor() {}

    public static getInstance(): AlertMessageService {
        if (!AlertMessageService.instance) {
            AlertMessageService.instance = new AlertMessageService();
        }
        return AlertMessageService.instance;
    }

    public sendAlertMessage(message: Message) {
        this.alertEvent.next(message);
    }

    public getAlertMessage(): Observable<Message> {
        return this.alertEvent.asObservable();
    }
}
