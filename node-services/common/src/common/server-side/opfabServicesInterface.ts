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
import AuthenticationService from '../client-side/authenticationService'


export default class OpfabServicesInterface {

    token: string = '';
    tokenExpirationMargin: number = 60000;
    login: string = '';
    password: string = '';
    opfabUsersUrl: string = '';
    opfabCardsConsultationUrl: string = '';
    opfabCardsPublicationUrl: string = '';
    opfabGetTokenUrl: string = '';


    logger: any;
    authenticationService: AuthenticationService;

    public setLogin(login: string) {
        this.login = login;
        return this;
    }

    public setPassword(password: string) {
        this.password = password;
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

    public setOpfabUsersUrl(opfabUsersUrl: string) {
        this.opfabUsersUrl = opfabUsersUrl;
        return this;
    }


    public setOpfabCardsConsultationUrl(opfabCardsConsultationUrl: string) {
        this.opfabCardsConsultationUrl = opfabCardsConsultationUrl;
        return this;
    }


    public setOpfabCardsPublicationUrl(opfabCardsPublicationUrl: string) {
        this.opfabCardsPublicationUrl = opfabCardsPublicationUrl;
        return this;
    }

    public setLogger(logger: any) {
        this.logger = logger;
        return this;
    }

    public async fetchUser(login: string): Promise<GetResponse> {
        try {
            await this.getToken();
            const response = await this.sendGetUserRequest(login);
            if (response?.data) {
                return new GetResponse(response.data, true);
            }
            else {
                this.logger.warn("No data in HTTP response")
                return new GetResponse([], false);
            }
        } catch (e) {
            this.logger.warn('Impossible to get user', e);
            return new GetResponse([], false);
        }
       
    }

    public async fetchAllUsers(): Promise<GetResponse> {
        try {
            await this.getToken();
            const response = await this.sendGetAllUsersRequest();
            if (response?.data) {
                return new GetResponse(response.data, true);
            }
            else {
                this.logger.warn("No data in HTTP response")
                return new GetResponse([], false);
            }
        } catch (e) {
            this.logger.warn('Impossible to get users', e);
            return new GetResponse([], false);
        }
       
    }

    public async getUsersConnected(): Promise<GetResponse> {
        try {
            await this.getToken();
            const response = await this.sendUsersConnectedRequest();
            if (response?.data) {
                return new GetResponse(response.data, true);
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

    public async getUserWithPerimeters(userToken: string | null) {

        try {
            const response = await this.sendRequest({
                method: 'get',
                url: this.opfabUsersUrl + '/CurrentUserWithPerimeters',
                headers: {
                    Authorization: 'Bearer ' + userToken
                }
            });
            if (response?.data) {
                return new GetResponse(response?.data, true);
            }
            else {
                this.logger.warn("No data in HTTP response")
                return new GetResponse(null, false);
            }
        } catch (e) {
            this.logger.warn('Impossible to get user with perimeters', e);
            return new GetResponse(null, false);
        }

    }


    async getToken() {
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

    sendUsersConnectedRequest() {
        return this.sendRequest({
            method: 'get',
            url: this.opfabCardsConsultationUrl + '/connections',
            headers: {
                Authorization: 'Bearer ' + this.token
            }
        });
    }

    sendGetUserRequest(login: string) {
        return this.sendRequest({
            method: 'get',
            url: this.opfabUsersUrl + '/users/' + login,
            headers: {
                Authorization: 'Bearer ' + this.token
            }
        });
    }

    sendGetAllUsersRequest() {
        return this.sendRequest({
            method: 'get',
            url: this.opfabUsersUrl + '/users',
            headers: {
                Authorization: 'Bearer ' + this.token
            }
        });
    }

    sendGetCardsRequest(filter: any) {
        return this.sendRequest({
            method: 'post',
            url: this.opfabCardsConsultationUrl + '/cards',
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
                url: this.opfabCardsPublicationUrl + '/cards',
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

    private sendGetEntityRequest(id: string) {
        return this.sendRequest({
            method: 'get',
            url: this.opfabUsersUrl + '/entities/' + id,
            headers: {
                Authorization: 'Bearer ' + this.token
            }
        });
    }

    sendRequest(request: any) {
        // Cast to <Promise<any>> required for testing, to be able to stub the call
        return <Promise<any>>axios(request);
    }
}
