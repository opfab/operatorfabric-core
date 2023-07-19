/* Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
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

export default class ConnectionChecker {

    private opfabInterface: OpfabServicesInterface;
    private connectionsStates = new ConnectionsStates();
    private logger: any;
    private nbOfConsecutiveNotConnectedToSendFirstCard: number;
    private nbOfConsecutiveNotConnectedToSendSecondCard: number;
    private secondsBetweenConnectionChecks: number;
    private supervisorList: any;
    private entitiesList: any;
    private disconnectedCardTemplate: any = '';

    public setOpfabServicesInterface(opfabInterface: OpfabServicesInterface) {
        this.opfabInterface = opfabInterface;
        return this;
    }

    public setLogger(logger: any) {
        this.logger = logger;
        return this;
    }

    public setSecondsBetweenConnectionChecks(secondsBetweenConnectionChecks: number) {
        this.secondsBetweenConnectionChecks = secondsBetweenConnectionChecks;
        return this;
    }

    public setNbOfConsecutiveNotConnectedToSendFirstCard(nbOfConsecutiveNotConnectedToSendFirstCard: number) {
        this.nbOfConsecutiveNotConnectedToSendFirstCard = nbOfConsecutiveNotConnectedToSendFirstCard;
        return this;
    }

    public setNbOfConsecutiveNotConnectedToSendSecondCard(nbOfConsecutiveNotConnectedToSendSecondCard: number) {
        this.nbOfConsecutiveNotConnectedToSendSecondCard = nbOfConsecutiveNotConnectedToSendSecondCard;
        return this;
    }


    public setDisconnectedCardTemplate(disconnectedCardTemplate: any) {
        this.disconnectedCardTemplate = disconnectedCardTemplate;
        return this;
    }
    
    public setEntitiesToSupervise(entitiesToSupervise: any) {
        this.supervisorList = new Map();
        this.entitiesList = [];
        entitiesToSupervise.forEach((entity: any) => {
            this.entitiesList.push(entity.id);
            this.supervisorList.set(entity.id, entity.supervisors);
        });
        this.connectionsStates.setToSupervise(this.entitiesList);
        return this;
    }

    public resetState() {
        this.connectionsStates.reset();
    }

    public async checkConnection() {
        const GetResponse: GetResponse = await this.opfabInterface.getUsersConnected();
        if (!GetResponse.isValid()) return;
        
        const connectedUsers = GetResponse.getData();
        this.logger.debug('Users connected : ' + JSON.stringify(connectedUsers));

        const connectedEntities : string[] = [];

        if (connectedUsers) {
            connectedUsers.forEach((user: any) => {
                user.entitiesConnected?.forEach((entity: string) => {
                    if (!connectedEntities.includes(entity)) 
                        connectedEntities.push(entity);
                })
            })
        }

        this.logger.debug('Entities connected : ' + connectedEntities);

        this.connectionsStates.setConnected(connectedEntities);
        await this.sendCardsToEntitiesNotConnectedFor(this.nbOfConsecutiveNotConnectedToSendFirstCard);
        await this.sendCardsToEntitiesNotConnectedFor(this.nbOfConsecutiveNotConnectedToSendSecondCard);

    }

    private async sendCardsToEntitiesNotConnectedFor(nbOfConsecutiveNotConnected: number) {
        const entitiesNotConnected =
            this.connectionsStates.getNotConnectedForConsecutiveTimes(nbOfConsecutiveNotConnected);
        if (entitiesNotConnected.length > 0) {
            this.logger.info(
                entitiesNotConnected + ' is(are) not connected for ' + nbOfConsecutiveNotConnected + ' consecutive times'
            );

            for (const entity of entitiesNotConnected) {
                await this.sendDisconnectedCard(
                    entity,
                    this.supervisorList.get(entity),
                    (this.secondsBetweenConnectionChecks * nbOfConsecutiveNotConnected) / 60
                );
            };
        }
    }

    private async sendDisconnectedCard(disconnected: string, recipients: Array<string>, minutes: number) {
        let entityName = disconnected;
        const entityResp = await this.opfabInterface.getEntity(disconnected);
        if (entityResp.isValid())
            entityName = entityResp.getData().name;
        else
            this.logger.info("GetEntity Response not valid");
        const card = Object.assign({}, this.disconnectedCardTemplate);
        card.startDate = new Date().valueOf();
        card.processInstanceId = disconnected;
        card.entityRecipients = recipients;
        card.data = {disconnected: entityName, minutes: minutes};
        card.title = {key: 'connection.title', parameters: {disconnected: entityName}};
        card.summary = {key: 'connection.summary', parameters: {disconnected: entityName, minutes: minutes}};
        return this.opfabInterface.sendCard(card);
    }
}
