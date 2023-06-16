/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import axios from 'axios';

import GetResponse from './getResponse';
import AuthenticationService from '../client-side/authenticationService';
import EventBus from './eventBus';
import {EventListener} from './eventListener';


export default class OpfabServicesInterface {

    private token: string = '';
    private tokenExpirationMargin: number = 60000;
    private login: string = '';
    private password: string = '';
    private opfabCardRemindUrl = '';
    private opfabGetTokenUrl: string = '';
    private logger: any;
    private authenticationService: AuthenticationService;
    private listener: EventBus;


    constructor() {
        this.listener = new EventBus();
    }


    public setEventBusConfiguration(eventBusConfig: any) {
        this.listener.setHost(eventBusConfig.host)
            .setPort(eventBusConfig.port)
            .setUsername(eventBusConfig.username)
            .setPassword(eventBusConfig.password);
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

    public setLogin(login: string) {
        this.login = login;
        return this;
    }

    public setPassword(password: string) {
        this.password = password;
        return this;
    }

    public setOpfabCardRemindUrl(opfabCardRemindUrl: string) {
        this.opfabCardRemindUrl = opfabCardRemindUrl;
        return this;
    }

    public setOpfabGetTokenUrl(opfabGetTokenUrl: string) {
        this.opfabGetTokenUrl = opfabGetTokenUrl;
        return this;
    }

    public setAuthenticationService(authenticationService: AuthenticationService) {
        this.authenticationService = authenticationService;
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
            url: this.opfabCardRemindUrl + '/' + cardId,
            headers: {
                Authorization: 'Bearer ' + this.token
            }
        });
    }


    private async getToken() {
        if (!this.authenticationService.validateToken(this.token, this.tokenExpirationMargin)) {
            const response = await this.sendRequest({
                method: 'post',
                url: this.opfabGetTokenUrl,
                data: `username=${this.login}&password=${this.password}&grant_type=password&client_id=opfab-client`
            });
            this.token = response?.data?.access_token;
            if (!this.token) throw new Error('No token provided , http response = ' + response);
        }
    }

    public sendRequest(request: any) {
        return axios(request);
    }

}
