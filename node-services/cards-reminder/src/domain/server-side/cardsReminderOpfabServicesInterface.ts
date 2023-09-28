/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import GetResponse from '../../common/server-side/getResponse';

import EventBus from '../../common/server-side/eventBus';
import {EventListener} from '../../common/server-side/eventListener';
import OpfabServicesInterface from '../../common/server-side/opfabServicesInterface'

export default class CardsReminderOpfabServicesInterface extends OpfabServicesInterface {


    private listener: EventBus;


    constructor() {
        super();
        this.listener = new EventBus();
    }


    public setEventBusConfiguration(eventBusConfig: any) {
        this.listener.setHost(eventBusConfig.host)
            .setPort(eventBusConfig.port)
            .setUsername(eventBusConfig.username)
            .setPassword(eventBusConfig.password)
            .setQueue("card","reminder.card",{ durable: true, autoDelete: false })
        return this;
    }

    public startListener() {
        this.listener.start();
    }


    public stopListener() {
        this.listener.stop();
    }

    public addListener(listener: EventListener) {
        this.listener.addListener(listener);
        return this;
    }

    public setLogger(logger: any) {
        this.logger = logger;
        this.listener.setLogger(logger);
        return this;
    }

    public async sendCardReminder(cardId: string) {

        try {
            await this.getToken();
            const response = await this.sendCardReminderRequest(cardId);
            if (response?.status == 200) {
                return new GetResponse(null, true);
            }
            else {
                this.logger.warn("HTTP request failed with status " + response?.status);
                return new GetResponse(null, false);
            }
        } catch (e) {
            this.logger.warn('Impossible to send card reminder', e);
            return new GetResponse(null, false);
        }


    }
    public async sendCardReminderRequest(cardId: string) {

        this.logger.info("sendCardReminder for card " + cardId);
        return this.sendRequest({
            method: 'post',
            url: this.opfabCardsPublicationUrl + '/cards/resetReadAndAcks/' + cardId,
            headers: {
                Authorization: 'Bearer ' + this.token
            }
        });
    }

}
