/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import GetResponse from '../../common/server-side/getResponse';
import EventBusListener from '../../common/server-side/eventBus';
import {EventListener} from '../../common/server-side/eventListener';
import OpfabServicesInterface from '../../common/server-side/opfabServicesInterface'

export default class CardsExternalDiffusionOpfabServicesInterface extends OpfabServicesInterface implements EventListener{

    private users : any[] = [];

    private userWithPerimeters = new Map<string,any>();

    private listener: EventBusListener;


    constructor() {
        super();
        this.listener = new EventBusListener()
            .addListener(this);
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
            .setPassword(eventBusConfig.password)
            .setQueue("user","", { exclusive: true, autoDelete: true })
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

    public async fetchUser(login: string): Promise<GetResponse> {
        let response = await super.fetchUser(login);
        if (response.isValid()) {
            this.addUserToCache(response.getData());
        }
        return response;
    }

    public async fetchAllUsers(): Promise<GetResponse> {
        let response = await super.fetchAllUsers();
        if (response.isValid()) {
            this.users = response.getData();
        }
        return response;
    }
 
    public async getUserWithPerimetersByLogin(login: string): Promise<GetResponse> {
        if (this.userWithPerimeters.has(login))
            return new GetResponse(this.userWithPerimeters.get(login), true);
        
        let response = await this.sendGetUserWithPerimetersByLogin(login);
        if (response.isValid()) {
            this.userWithPerimeters.set(login, response.getData());
        }
        return response;
    }

    public async loadUsersData() {
        await this.fetchAllUsers();
        this.userWithPerimeters.clear();
    }

    public async clearCacheForUser(login: string) {
        this.userWithPerimeters.delete(login);
        await this.fetchUser(login);
    }

    private addUserToCache(user: any) {
        const usrIndex = this.users.findIndex((usr) =>  usr.login == user.login);
        if (usrIndex >= 0) 
            this.users.splice(usrIndex, 1, user);
        else
            this.users.push(user);
    }

    public async sendGetUserWithPerimetersByLogin(login: string) {

        try {
            const response = await this.sendRequest({
                method: 'get',
                url: this.opfabUsersUrl + '/UserWithPerimeters/' + login,
                headers: {
                    Authorization: 'Bearer ' + this.token
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

}
