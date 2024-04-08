/* Copyright (c) 2022-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import GetResponse from '../../common/server-side/getResponse';
import OpfabServicesInterface from '../../common/server-side/opfabServicesInterface';
import ConnectionsStates from './connectionsStates';
import {EntityToSupervise} from './entityToSupervise';

export default class ConnectionChecker {
    private opfabInterface: OpfabServicesInterface;
    private readonly connectionsStates = new ConnectionsStates();
    private logger: any;
    private nbOfConsecutiveNotConnectedToSendFirstCard: number;
    private nbOfConsecutiveNotConnectedToSendSecondCard: number;
    private secondsBetweenConnectionChecks: number;
    private supervisorList: Map<string, string[]>;
    private entitiesList: string[];
    private groupsList: string[] = [];
    private disconnectedCardTemplate: any = '';

    public setOpfabServicesInterface(opfabInterface: OpfabServicesInterface): this {
        this.opfabInterface = opfabInterface;
        return this;
    }

    public setLogger(logger: any): this {
        this.logger = logger;
        return this;
    }

    public setSecondsBetweenConnectionChecks(secondsBetweenConnectionChecks: number): this {
        this.secondsBetweenConnectionChecks = secondsBetweenConnectionChecks;
        return this;
    }

    public setNbOfConsecutiveNotConnectedToSendFirstCard(nbOfConsecutiveNotConnectedToSendFirstCard: number): this {
        this.nbOfConsecutiveNotConnectedToSendFirstCard = nbOfConsecutiveNotConnectedToSendFirstCard;
        return this;
    }

    public setNbOfConsecutiveNotConnectedToSendSecondCard(nbOfConsecutiveNotConnectedToSendSecondCard: number): this {
        this.nbOfConsecutiveNotConnectedToSendSecondCard = nbOfConsecutiveNotConnectedToSendSecondCard;
        return this;
    }

    public setDisconnectedCardTemplate(disconnectedCardTemplate: any): this {
        this.disconnectedCardTemplate = disconnectedCardTemplate;
        return this;
    }

    public setConsiderConnectedIfUserInGroups(considerConnectedIfUserInGroups: any): this {
        if (considerConnectedIfUserInGroups == null) this.groupsList = [];
        else this.groupsList = considerConnectedIfUserInGroups;
        return this;
    }

    public setEntitiesToSupervise(entitiesToSupervise: EntityToSupervise[]): this {
        this.supervisorList = new Map();
        this.entitiesList = [];
        entitiesToSupervise.forEach((entity: EntityToSupervise) => {
            this.entitiesList.push(entity.entityId);
            this.supervisorList.set(entity.entityId, entity.supervisors);
        });
        this.connectionsStates.setToSupervise(this.entitiesList);
        return this;
    }

    public resetState(): void {
        this.connectionsStates.reset();
    }

    public async checkConnection(): Promise<void> {
        const GetResponse: GetResponse = await this.opfabInterface.getUsersConnected();
        if (!GetResponse.isValid()) return;

        const allConnectedUsers = GetResponse.getData();

        this.logger.debug('All users connected : ' + JSON.stringify(allConnectedUsers));
        const connectedUsers =
            this.groupsList.length > 0
                ? allConnectedUsers.filter((user: {groups: string[]}) => {
                      return user?.groups.filter((group) => this.groupsList.includes(group)).length > 0;
                  })
                : allConnectedUsers;
        this.logger.debug('Users connected in configured groups: ' + JSON.stringify(connectedUsers));

        const connectedEntities: string[] = [];

        if (connectedUsers != null) {
            connectedUsers.forEach((user: any) => {
                user.entitiesConnected?.forEach((entity: string) => {
                    if (!connectedEntities.includes(entity)) connectedEntities.push(entity);
                });
            });
        }

        this.logger.debug('Entities connected : ' + connectedEntities.join(', '));

        this.connectionsStates.setConnected(connectedEntities);
        await this.sendCardsToEntitiesNotConnectedFor(this.nbOfConsecutiveNotConnectedToSendFirstCard);
        await this.sendCardsToEntitiesNotConnectedFor(this.nbOfConsecutiveNotConnectedToSendSecondCard);
    }

    private async sendCardsToEntitiesNotConnectedFor(nbOfConsecutiveNotConnected: number): Promise<void> {
        const entitiesNotConnected =
            this.connectionsStates.getNotConnectedForConsecutiveTimes(nbOfConsecutiveNotConnected);
        if (entitiesNotConnected.length > 0) {
            this.logger.info(
                entitiesNotConnected.join(', ') +
                    ' is(are) not connected for ' +
                    nbOfConsecutiveNotConnected +
                    ' consecutive times'
            );

            for (const entity of entitiesNotConnected) {
                await this.sendDisconnectedCard(
                    entity,
                    this.supervisorList.get(entity),
                    (this.secondsBetweenConnectionChecks * nbOfConsecutiveNotConnected) / 60
                );
            }
        }
    }

    private async sendDisconnectedCard(
        disconnected: string,
        recipients: string[] | undefined,
        minutes: number
    ): Promise<void> {
        let entityName = disconnected;
        const entityResp = await this.opfabInterface.getEntity(disconnected);
        if (entityResp.isValid()) entityName = entityResp.getData().name;
        else this.logger.info('GetEntity Response not valid');
        const card = {...this.disconnectedCardTemplate};
        card.startDate = new Date().valueOf();
        card.processInstanceId = disconnected;
        card.entityRecipients = recipients;
        card.data = {disconnected: entityName, minutes};
        card.title = {key: 'connection.title', parameters: {disconnected: entityName}};
        card.summary = {key: 'connection.summary', parameters: {disconnected: entityName, minutes}};
        await this.opfabInterface.sendCard(card);
    }
}
