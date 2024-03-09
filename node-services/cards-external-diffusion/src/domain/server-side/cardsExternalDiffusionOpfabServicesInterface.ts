/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
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
import OpfabServicesInterface from '../../common/server-side/opfabServicesInterface';

export default class CardsExternalDiffusionOpfabServicesInterface
    extends OpfabServicesInterface
    implements EventListener
{
    private users: any[] = [];

    private readonly userWithPerimeters = new Map<string, any>();

    private readonly listener: EventBusListener;

    constructor() {
        super();
        this.listener = new EventBusListener().addListener(this);
    }

    async onMessage(message: any): Promise<void> {
        const username: string = message.content.toString();
        this.logger.info('EventBusListener received user update event: ' + username);
        if (username != null && username.length > 0) await this.clearCacheForUser(username);
        else await this.loadUsersData();
    }

    public setEventBusConfiguration(eventBusConfig: any): this {
        this.listener
            .setHost(eventBusConfig.host as string)
            .setPort(eventBusConfig.port as number)
            .setUsername(eventBusConfig.username as string)
            .setPassword(eventBusConfig.password as string)
            .setQueue('user', '', {exclusive: true, autoDelete: true});
        return this;
    }

    public setLogger(logger: any): this {
        this.logger = logger;
        this.listener.setLogger(logger);
        return this;
    }

    public startListener(): void {
        this.listener.start();
    }

    public stopListener(): void {
        this.listener.stop();
    }

    public getUsers(): any[] {
        return this.users;
    }

    public async getUser(login: string): Promise<GetResponse> {
        const user = this.users.find((user) => user.login === login);
        if (user != null) return new GetResponse(user, true);
        else return await this.fetchUser(login);
    }

    public async fetchUser(login: string): Promise<GetResponse> {
        const response = await super.fetchUser(login);
        if (response.isValid()) {
            this.addUserToCache(response.getData());
        }
        return response;
    }

    public async fetchAllUsers(): Promise<GetResponse> {
        const response = await super.fetchAllUsers();
        if (response.isValid()) {
            this.users = response.getData();
        }
        return response;
    }

    public async getUserWithPerimetersByLogin(login: string): Promise<GetResponse> {
        if (this.userWithPerimeters.has(login)) return new GetResponse(this.userWithPerimeters.get(login), true);

        const response = await this.sendGetUserWithPerimetersByLogin(login);
        if (response.isValid()) {
            this.userWithPerimeters.set(login, response.getData());
        }
        return response;
    }

    public async loadUsersData(): Promise<void> {
        await this.fetchAllUsers();
        this.userWithPerimeters.clear();
    }

    public async clearCacheForUser(login: string): Promise<void> {
        this.userWithPerimeters.delete(login);
        await this.fetchUser(login);
    }

    private addUserToCache(user: any): void {
        const usrIndex = this.users.findIndex((usr) => usr.login === user.login);
        if (usrIndex >= 0) this.users.splice(usrIndex, 1, user);
        else this.users.push(user);
    }

    public async sendGetUserWithPerimetersByLogin(login: string): Promise<GetResponse> {
        try {
            const response = await this.sendRequest({
                method: 'get',
                url: this.opfabUsersUrl + '/UserWithPerimeters/' + login,
                headers: {
                    Authorization: 'Bearer ' + this.token
                }
            });
            if (response?.data != null) {
                return new GetResponse(response?.data, true);
            } else {
                this.logger.warn('No data in HTTP response');
                return new GetResponse(null, false);
            }
        } catch (e) {
            this.logger.warn('Impossible to get user with perimeters', e);
            return new GetResponse(null, false);
        }
    }
}
