/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import axios from 'axios';

import GetResponse from './getResponse';
import JwtTokenUtils from './jwtTokenUtils';

export default class OpfabServicesInterface {
    token = '';
    tokenExpirationMargin = 60000;
    login = '';
    password = '';
    opfabUsersUrl = '';
    opfabCardsConsultationUrl = '';
    opfabCardsPublicationUrl = '';
    opfabBusinessconfigUrl = '';
    opfabGetTokenUrl = '';

    logger: any;
    jwtToken: JwtTokenUtils = new JwtTokenUtils();

    public setLogin(login: string): this {
        this.login = login;
        return this;
    }

    public setPassword(password: string): this {
        this.password = password;
        return this;
    }

    public setOpfabGetTokenUrl(opfabGetTokenUrl: string): this {
        this.opfabGetTokenUrl = opfabGetTokenUrl;
        return this;
    }

    public setOpfabUsersUrl(opfabUsersUrl: string): this {
        this.opfabUsersUrl = opfabUsersUrl;
        return this;
    }

    public setOpfabCardsConsultationUrl(opfabCardsConsultationUrl: string): this {
        this.opfabCardsConsultationUrl = opfabCardsConsultationUrl;
        return this;
    }

    public setOpfabCardsPublicationUrl(opfabCardsPublicationUrl: string): this {
        this.opfabCardsPublicationUrl = opfabCardsPublicationUrl;
        return this;
    }

    public setopfabBusinessconfigUrl(opfabBusinessconfigUrl: string): this {
        this.opfabBusinessconfigUrl = opfabBusinessconfigUrl;
        return this;
    }

    public setLogger(logger: any): this {
        this.logger = logger;
        this.jwtToken.setLogger(logger);
        return this;
    }

    public async fetchUser(login: string): Promise<GetResponse> {
        try {
            await this.getToken();
            const response = await this.sendGetUserRequest(login);
            if (response?.data != null) {
                return new GetResponse(response.data, true);
            } else {
                this.logger.warn('No user defined in HTTP response');
                return new GetResponse([], false);
            }
        } catch (e) {
            this.logger.warn('Impossible to get user', e);
            return new GetResponse([], false);
        }
    }

    public async fetchAllUsers(): Promise<GetResponse> {
        const retryDelay = 5000; // Delay in milliseconds between retries (5 seconds)
        const maxRetries = 120; // So max time is 5 * 120 = 600 seconds (10 minutes)

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                await this.getToken();
                const response = await this.sendGetAllUsersRequest();
                if (response?.data != null) {
                    return new GetResponse(response.data, true);
                } else {
                    this.logger.warn('No users defined in HTTP response');
                    return new GetResponse([], false);
                }
            } catch (e) {
                this.logger.warn('Impossible to get users', e);
                this.logger.warn(
                    `Attempt ${attempt} to get users data failed. Retrying in ${retryDelay / 1000} seconds...`
                );
                await new Promise((resolve) => {
                    return setTimeout(resolve, retryDelay);
                });
            }
        }
        this.logger.warn('Impossible to get users');
        return new GetResponse(null, false);
    }

    public async getUsersConnected(): Promise<GetResponse> {
        try {
            await this.getToken();
            const response = await this.sendUsersConnectedRequest();
            if (response?.data != null) {
                return new GetResponse(response.data, true);
            } else {
                this.logger.warn('No connected users defined in HTTP response');
                return new GetResponse(null, false);
            }
        } catch (e) {
            this.logger.warn('Impossible to get connected users', e);
            return new GetResponse(null, false);
        }
    }

    public async getCard(cardId: string): Promise<GetResponse> {
        try {
            await this.getToken();
            const response = await this.sendGetCardRequest(cardId);

            if (response?.data != null) {
                const card = response.data.card;
                return new GetResponse(card, true);
            } else {
                this.logger.warn('No card defined in HTTP response');
                return new GetResponse(null, false);
            }
        } catch (e) {
            this.logger.warn(`Impossible to get card with id : ${cardId} `, e);
            return new GetResponse(null, false);
        }
    }

    public async getCards(filter: any): Promise<GetResponse> {
        try {
            await this.getToken();
            const response = await this.sendGetCardsRequest(filter);
            const cards: any[] = [];
            if (response?.data != null) {
                response.data.content.forEach((card: any) => {
                    cards.push(card);
                });
                return new GetResponse(cards, true);
            } else {
                this.logger.warn('No cards defined in HTTP response');
                return new GetResponse(null, false);
            }
        } catch (e) {
            this.logger.warn('Impossible to get cards', e);
            return new GetResponse(null, false);
        }
    }

    public async getUserWithPerimeters(userToken: string | null): Promise<GetResponse> {
        try {
            const response = await this.sendRequest({
                method: 'get',
                url: this.opfabUsersUrl + '/CurrentUserWithPerimeters',
                headers: {
                    Authorization: 'Bearer ' + userToken
                }
            });
            if (response?.data != null) {
                return new GetResponse(response?.data, true);
            } else {
                this.logger.warn('No user with perimeters defined in HTTP response');
                return new GetResponse(null, false);
            }
        } catch (e) {
            this.logger.warn('Impossible to get user with perimeters', e);
            return new GetResponse(null, false);
        }
    }

    public async getEntity(id: string): Promise<GetResponse> {
        try {
            await this.getToken();
            const response = await this.sendGetEntityRequest(id);
            if (response?.data != null) {
                return new GetResponse(response.data, true);
            } else {
                this.logger.warn('No entity defined in HTTP response');
                return new GetResponse([], false);
            }
        } catch (e) {
            this.logger.warn('Impossible to get entity ' + id, e);
            return new GetResponse([], false);
        }
    }

    async getToken(): Promise<void> {
        if (!this.jwtToken.validateToken(this.token, this.tokenExpirationMargin)) {
            const response = await this.sendRequest({
                method: 'post',
                url: this.opfabGetTokenUrl,
                data: `username=${this.login}&password=${this.password}&grant_type=password`
            });
            this.token = response?.data?.access_token;
            if (this.token == null) throw new Error('No token provided , http response = ' + response);
        }
    }

    sendUsersConnectedRequest(): any {
        return this.sendRequest({
            method: 'get',
            url: this.opfabCardsConsultationUrl + '/connections',
            headers: {
                Authorization: 'Bearer ' + this.token
            }
        });
    }

    sendGetUserRequest(login: string): any {
        return this.sendRequest({
            method: 'get',
            url: this.opfabUsersUrl + '/users/' + login,
            headers: {
                Authorization: 'Bearer ' + this.token
            }
        });
    }

    sendGetAllUsersRequest(): any {
        return this.sendRequest({
            method: 'get',
            url: this.opfabUsersUrl + '/users',
            headers: {
                Authorization: 'Bearer ' + this.token
            }
        });
    }

    sendGetCardRequest(cardId: string): any {
        return this.sendRequest({
            method: 'get',
            url: this.opfabCardsConsultationUrl + '/cards/' + cardId,
            headers: {
                Authorization: 'Bearer ' + this.token
            }
        });
    }

    sendGetCardsRequest(filter: any): any {
        return this.sendRequest({
            method: 'post',
            url: this.opfabCardsConsultationUrl + '/cards',
            data: filter,
            headers: {
                Authorization: 'Bearer ' + this.token
            }
        });
    }

    private sendGetEntityRequest(id: string): any {
        return this.sendRequest({
            method: 'get',
            url: this.opfabUsersUrl + '/entities/' + id,
            headers: {
                Authorization: 'Bearer ' + this.token
            }
        });
    }

    public async sendCard(card: any): Promise<void> {
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

    sendRequest(request: any): any {
        // Cast to <Promise<any>> required for testing, to be able to stub the call
        return <Promise<any>>axios(request); //eslint-disable-line
    }
}
