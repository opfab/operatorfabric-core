/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {map, takeUntil, tap} from 'rxjs/operators';
import {Observable, Subject} from 'rxjs';
import {ServerResponseStatus} from '../../server/serverResponse';
import {ErrorService} from '../error-service';
import {SupervisedEntity} from '@ofModel/supervised-entity.model';
import {SupervisedEntitiesServer} from 'app/business/server/supervised-entities.server';
import {LoggerService as logger} from 'app/services/logs/LoggerService';

export class SupervisedEntitiesService {
    protected static _entities: SupervisedEntity[];
    private static readonly ngUnsubscribe$ = new Subject<void>();
    private static supervisedEntitiesServer: SupervisedEntitiesServer;

    public static setSupervisedEntitiesServer(supervisedEntitiesServer: SupervisedEntitiesServer) {
        SupervisedEntitiesService.supervisedEntitiesServer = supervisedEntitiesServer;
    }

    public static deleteById(id: string) {
        return SupervisedEntitiesService.supervisedEntitiesServer.deleteById(id).pipe(
            tap((entitiesResponse) => {
                if (entitiesResponse.status === ServerResponseStatus.OK) {
                    SupervisedEntitiesService.deleteFromCachedEntities(id);
                } else {
                    ErrorService.handleServerResponseError(entitiesResponse);
                }
            })
        );
    }

    private static deleteFromCachedEntities(id: string): void {
        SupervisedEntitiesService._entities = SupervisedEntitiesService._entities.filter(
            (entity) => entity.entityId !== id
        );
    }

    public static queryAllSupervisedEntities(): Observable<SupervisedEntity[]> {
        return SupervisedEntitiesService.supervisedEntitiesServer.queryAllSupervisedEntities().pipe(
            map((entitiesResponse) => {
                if (entitiesResponse.status === ServerResponseStatus.OK) {
                    return entitiesResponse.data;
                } else {
                    ErrorService.handleServerResponseError(entitiesResponse);
                    return [];
                }
            })
        );
    }

    public static updateSupervisedEntity(entityData: SupervisedEntity): Observable<SupervisedEntity> {
        return SupervisedEntitiesService.supervisedEntitiesServer.updateSupervisedEntity(entityData).pipe(
            map((responseEntities) => {
                if (responseEntities.status === ServerResponseStatus.OK) {
                    SupervisedEntitiesService.updateCachedEntity(entityData);

                    return responseEntities.data;
                } else {
                    ErrorService.handleServerResponseError(responseEntities);
                    return null;
                }
            })
        );
    }

    public static getAll(): Observable<any[]> {
        return SupervisedEntitiesService.queryAllSupervisedEntities();
    }

    public static update(data: any): Observable<any> {
        return SupervisedEntitiesService.updateSupervisedEntity(data);
    }

    private static updateCachedEntity(entityData: SupervisedEntity): void {
        const updatedEntities = SupervisedEntitiesService._entities.filter(
            (entity) => entity.entityId !== entityData.entityId
        );
        updatedEntities.push(entityData);
        SupervisedEntitiesService._entities = updatedEntities;
    }

    public static loadAllSupervisedEntitiesData(): Observable<any> {
        return SupervisedEntitiesService.queryAllSupervisedEntities().pipe(
            takeUntil(SupervisedEntitiesService.ngUnsubscribe$),
            tap({
                next: (entities) => {
                    if (entities) {
                        SupervisedEntitiesService._entities = entities;
                        logger.info('List of entities loaded');
                    }
                },
                error: (error) => logger.error('an error occurred ' + JSON.stringify(error))
            })
        );
    }

    public static getSupervisedEntity(entityId): SupervisedEntity {
        const entity = SupervisedEntitiesService._entities.find((entity) => entity.entityId === entityId);
        return entity;
    }

    public static getSupervisedEntities(): SupervisedEntity[] {
        return SupervisedEntitiesService._entities;
    }

    public static getCachedValues(): Array<SupervisedEntity> {
        return SupervisedEntitiesService.getSupervisedEntities();
    }
}
