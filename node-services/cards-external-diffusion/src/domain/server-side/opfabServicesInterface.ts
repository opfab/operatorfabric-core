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
import EventBusListener from './eventBusListener';
import {EventListener} from './eventListener';

export default class OpfabServicesInterface implements EventListener{

    private token: string = '';
    private tokenExpirationMargin: number = 60000;
    private login: string = '';
    private password: string = '';
    private opfabUrl = '';
    private opfabGetUsersConnectedUrl: string = '';
    private opfabGetUsersUrl: string = '';
    private opfabGetCardsUrl: string = '';
    private opfabGetTokenUrl: string = '';
    private logger: any;
    private authenticationService: AuthenticationService;
    private users : any[] = [];
    private userSettings = new Map<string,any>();
    private userPerimeters = new Map<string,any>();
    private listener: EventBusListener;



    constructor() {
        this.listener = new EventBusListener()
            .addListener(this);
    }

    async onConnection() {
        this.logger.info('EventBusListener connected!');
    }

    async onDisconnection(error: any) {
        this.logger.error('EventBusListener disconnected!', error);
    }

    async onMessage(message: any) {
        const username : string = message.content.toString();
        this.logger.info("EventBusListener received user update event: " + username);
        if (username && username.length > 0)
            await this.clearCacheForUser(username);
        else
            await this.loadUsersData();
    }

    public setEventBusConfiguration(eventBusConfig: any) {
        this.listener.setHost(eventBusConfig.host)
            .setPort(eventBusConfig.port)
            .setUsername(eventBusConfig.username)
            .setPassword(eventBusConfig.password);
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

    public setOpfabGetUsersUrl(opfabGetUsersUrl: string) {
        this.opfabGetUsersUrl = opfabGetUsersUrl;
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

    public setLogger(logger: any) {
        this.logger = logger;
        this.listener.setLogger(logger);
        return this;
    }

    public startListener() {
        this.listener.start();
    }

    public stopListener() {
        this.listener.stop();
    }

    public getUsers() {
        return this.users;
    }

    public async getUser(login: string) : Promise<GetResponse> {
        const user = this.users.find(user => user.login === login);
        if (user) 
            return new GetResponse(user, true);
        else 
            return this.fetchUser(login);
    }

    private async fetchUser(login: string): Promise<GetResponse> {
        try {
            await this.getToken();
            const response = await this.sendGetUserRequest(login);
            if (response?.data) {
                this.addUserToCache(response.data);
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
                this.users = response.data;

                return new GetResponse(this.users, true);
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
            const users = new Array();
            if (response?.data) {
                response.data.forEach((user: any) => {
                    users.push(user.login);
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

    public async getUserSettings(login: string): Promise<GetResponse> {
        try {
            if (this.userSettings.has(login))
                return new GetResponse(this.userSettings.get(login), true);

            await this.getToken();
            const response = await this.sendGetUserSettingRequest(login);
            if (response?.data) {
                this.userSettings.set(login, response.data);
                return new GetResponse(response.data, true);
            }
            else {
                this.logger.warn("No data in HTTP response")
                return new GetResponse(null, false);
            }
        } catch (error: any) {
            if (error.response.status != 404) {
                this.logger.warn('Impossible to get user settings', error);
            }

            return new GetResponse(null, false);
        }
    }

    public async getUserPerimeters(login: string): Promise<GetResponse> {
        try {
            if (this.userPerimeters.has(login))
                return new GetResponse(this.userPerimeters.get(login), true);

            await this.getToken();
            const response = await this.sendGetUserPerimetersRequest(login);
            if (response?.data) {
                this.userPerimeters.set(login, response.data);
                return new GetResponse(response.data, true);
            }
            else {
                this.logger.warn("No data in HTTP response")
                return new GetResponse(null, false);
            }
        } catch (error: any) {
            this.logger.warn('Impossible to get user perimeters', error);
            return new GetResponse(null, false);
        }
    }


    public async loadUsersData() {
        await this.fetchAllUsers();
        this.userPerimeters.clear();
        this.userSettings.clear();
    }

    public async clearCacheForUser(login: string) {
        this.userSettings.delete(login);
        this.userPerimeters.delete(login);
        await this.fetchUser(login);
    }

    private addUserToCache(user: any) {
        const usrIndex = this.users.findIndex((usr) =>  usr.login == user.login);
        if (usrIndex >= 0) 
            this.users.splice(usrIndex, 1, user);
        else
            this.users.push(user);
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

    public sendRequest(request: any) {
        return <Promise<any>>axios(request);
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

    private sendGetUserRequest(login: string) {
        return this.sendRequest({
            method: 'get',
            url: this.opfabGetUsersUrl + '/' + login,
            headers: {
                Authorization: 'Bearer ' + this.token
            }
        });
    }

    private sendGetAllUsersRequest() {
        return this.sendRequest({
            method: 'get',
            url: this.opfabGetUsersUrl,
            headers: {
                Authorization: 'Bearer ' + this.token
            }
        });
    }

    private sendGetUserSettingRequest(login: string) {
        return this.sendRequest({
            method: 'get',
            url: this.opfabGetUsersUrl +'/' + login + '/settings',
            headers: {
                Authorization: 'Bearer ' + this.token
            }
        });
    }

    private sendGetUserPerimetersRequest(login: string) {
        return this.sendRequest({
            method: 'get',
            url: this.opfabGetUsersUrl +'/' + login + '/perimeters',
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


}
