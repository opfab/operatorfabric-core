/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import axios from 'axios';

import GetResponse from '../../common/server-side/getResponse';
import AuthenticationService from '../../common/client-side/authenticationService';

export default class OpfabServicesInterface {

    private token: string = '';
    private tokenExpirationMargin: number = 60000;
    private login: string = '';
    private password: string = '';
    private opfabUrl = '';
    private opfabGetUsersConnectedUrl: string = '';
    private opfabGetEntityUrl: string = '';
    private opfabGetCardsUrl: string = '';
    private opfabGetTokenUrl: string = '';
    private opfabPublicationUrl: string = '';
    private logger: any;
    private authenticationService: AuthenticationService;

    public setLogin(login: string) {
        this.login = login;
        return this;
    }

    public setPassword(password: string) {
        this.password = password;
        return this;
    }

    public setOpfabUrl(opfabUrl: string) {
        this.opfabUrl = opfabUrl;
        return this;
    }

    public getOpfabUrl() : string {
        return this.opfabUrl
    }

    public setOpfabGetTokenUrl(opfabGetTokenUrl: string) {
        this.opfabGetTokenUrl = opfabGetTokenUrl;
        return this;
    }

    public setAuthenticationService(authenticationService: AuthenticationService) {
        this.authenticationService = authenticationService;
        return this;
    }

    public setOpfabGetEntityUrl(opfabGetEntityUrl: string) {
        this.opfabGetEntityUrl = opfabGetEntityUrl;
        return this;
    }

    public setOpfabGetUsersConnectedUrl(opfabGetUsersConnectedUrl: string) {
        this.opfabGetUsersConnectedUrl = opfabGetUsersConnectedUrl;
        return this;
    }

    public setOpfabGetCardsUrl(opfabGetCardsUrl: string) {
        this.opfabGetCardsUrl = opfabGetCardsUrl;
        return this;
    }

    public setOpfabPublicationUrl(opfabPublicationUrl: string) {
        this.opfabPublicationUrl = opfabPublicationUrl;
        return this;
    }

    public setLogger(logger: any) {
        this.logger = logger;
        return this;
    }

    public async getEntity(id: string): Promise<GetResponse> {
        try {
            await this.getToken();
            const response = await this.sendGetEntityRequest(id);
            if (response?.data) {
                return new GetResponse(response.data, true);
            }
            else {
                this.logger.warn("No data in HTTP response")
                return new GetResponse([], false);
            }
        } catch (e) {
            this.logger.warn('Impossible to get entity ' + id, e);
            return new GetResponse([], false);
        }
       
    }

    public async getUsersConnected(): Promise<GetResponse> {
        try {
            await this.getToken();
            const response = await this.sendUsersConnectedRequest();
            const users = new Array();
            if (response?.data) {
                response.data.forEach((user: any) => {
                    users.push(user);
                });
                return new GetResponse(users, true);
            }
            else {
                this.logger.warn("No data in HTTP response")
                return new GetResponse(null, false);
            }
        } catch (e) {
            this.logger.warn('Impossible to get connected users', e);
            return new GetResponse(null, false);
        }
       
    }

    public async getCards(filter: any) {
        try {
            await this.getToken();
            const response = await this.sendGetCardsRequest(filter);
            const cards = new Array();
            if (response?.data) {
                response.data.content.forEach((card: any) => {
                    cards.push(card);
                });
                return new GetResponse(cards, true);
            }
            else {
                this.logger.warn("No data in HTTP response")
                return new GetResponse(null, false);
            }
        } catch (e) {
            this.logger.warn('Impossible to get cards', e);
            return new GetResponse(null, false);
        }
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

    public sendRequest(request: any) : Promise<any> {
        return axios(request);
    }

    private sendUsersConnectedRequest() {
        return this.sendRequest({
            method: 'get',
            url: this.opfabGetUsersConnectedUrl,
            headers: {
                Authorization: 'Bearer ' + this.token
            }
        });
    }

    private sendGetEntityRequest(id: string) {
        return this.sendRequest({
            method: 'get',
            url: this.opfabGetEntityUrl + '/' + id,
            headers: {
                Authorization: 'Bearer ' + this.token
            }
        });
    }

    private sendGetCardsRequest(filter: any) {
        return this.sendRequest({
            method: 'post',
            url: this.opfabGetCardsUrl,
            data: filter,
            headers: {
                Authorization: 'Bearer ' + this.token
            }
        });
    }

    public async sendCard(card: any) {
        try {
            await this.getToken();
            const request = {
                method: 'post',
                url: this.opfabPublicationUrl,
                data: card,
                headers: {
                    Authorization: 'Bearer ' + this.token
                }
            };
            await this.sendRequest(request);
        } catch (exc) {
            this.logger.warn('Impossible to send card', exc);
        }
    }


}
