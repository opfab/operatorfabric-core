/* Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {map, takeUntil, tap} from 'rxjs/operators';
import {Observable, Subject} from 'rxjs';
import {Entity} from './model/Entity';
import {EntitiesServer} from './server/EntitiesServer';
import {ServerResponseStatus} from '../../server/ServerResponse';
import {LoggerService as logger} from 'app/services/logs/LoggerService';
import {RoleEnum} from './model/RoleEnum';
import {EntitiesTree} from './model/EntitiesTree';
import {MessageLevel} from '@ofServices/alerteMessage/model/Message';
import {AlertMessageService} from '@ofServices/alerteMessage/AlertMessageService';

export class EntitiesService {
    private static _entities: Entity[];
    private static readonly _childEntities: Map<string, Entity[]> = new Map<string, Entity[]>();
    private static readonly ngUnsubscribe$ = new Subject<void>();
    private static entitiesServer: EntitiesServer;

    public static setEntitiesServer(entitiesServer: EntitiesServer) {
        EntitiesService.entitiesServer = entitiesServer;
    }

    public static deleteById(id: string) {
        return EntitiesService.entitiesServer.deleteById(id).pipe(
            tap((entitiesResponse) => {
                if (entitiesResponse.status === ServerResponseStatus.OK) {
                    EntitiesService.deleteFromCachedEntities(id);
                } else {
                    logger.error(`Error while deleting entity ${id} :  ${entitiesResponse.statusMessage}`);
                    AlertMessageService.sendAlertMessage({
                        message: '',
                        i18n: {key: 'shared.error.entity.deleteEntity'},
                        level: MessageLevel.ERROR
                    });
                }
            })
        );
    }

    private static deleteFromCachedEntities(id: string): void {
        EntitiesService._entities = EntitiesService._entities.filter((entity) => entity.id !== id);
        EntitiesService._childEntities.delete(id);
        EntitiesService.deleteFromCachedChildEntities(id);
    }

    private static deleteFromCachedChildEntities(id: string) {
        const parentEntitiesIds = [...EntitiesService._childEntities.entries()]
            .filter(([, childs]) => childs.findIndex((child) => child.id === id) >= 0)
            .map((entry) => entry[0]);

        parentEntitiesIds.forEach((parentId) => EntitiesService._childEntities.delete(parentId));
    }

    public static queryAllEntities(): Observable<Entity[]> {
        return EntitiesService.entitiesServer.queryAllEntities().pipe(
            map((entitiesResponse) => {
                if (entitiesResponse.status === ServerResponseStatus.OK) {
                    return entitiesResponse.data;
                } else {
                    logger.error(`Error while getting entities :  ${entitiesResponse.statusMessage}`);
                    AlertMessageService.sendAlertMessage({
                        message: '',
                        i18n: {key: 'shared.error.entity.gettingEntities'},
                        level: MessageLevel.ERROR
                    });
                    return [];
                }
            })
        );
    }

    public static updateEntity(entityData: Entity): Observable<Entity> {
        return EntitiesService.entitiesServer.updateEntity(entityData).pipe(
            map((responseEntities) => {
                if (responseEntities.status === ServerResponseStatus.OK) {
                    EntitiesService.updateCachedEntity(entityData);
                    return responseEntities.data;
                } else {
                    logger.error(`Error while updating entity ${entityData.id} :  ${responseEntities.statusMessage}`);
                    AlertMessageService.sendAlertMessage({
                        message: '',
                        i18n: {key: 'shared.error.entity.updateEntity'},
                        level: MessageLevel.ERROR
                    });
                    return null;
                }
            })
        );
    }

    private static updateCachedEntity(entityData: Entity): void {
        const updatedEntities = EntitiesService._entities.filter((entity) => entity.id !== entityData.id);
        updatedEntities.push(entityData);
        EntitiesService._entities = updatedEntities;
        EntitiesService.deleteFromCachedChildEntities(entityData.id);
    }

    public static getAll(): Observable<any[]> {
        return EntitiesService.queryAllEntities();
    }

    public static update(data: any): Observable<any> {
        return EntitiesService.updateEntity(data);
    }

    public static loadAllEntitiesData(): Observable<any> {
        return EntitiesService.queryAllEntities().pipe(
            takeUntil(EntitiesService.ngUnsubscribe$),
            tap({
                next: (entities) => {
                    if (entities) {
                        EntitiesService._entities = entities;
                        EntitiesService._childEntities.clear();
                        logger.info('List of entities loaded');
                    }
                },
                error: (error) => logger.error('An error occurred when loading entities' + error)
            })
        );
    }

    public static getEntity(entityId): Entity {
        const entity = EntitiesService._entities.find((entity) => entity.id === entityId);
        return entity;
    }

    public static getEntities(): Entity[] {
        return EntitiesService._entities;
    }

    public static getEntitiesFromIds(listOfIds: string[]): Entity[] {
        return EntitiesService.getEntities().filter((entity) => listOfIds.includes(entity.id));
    }

    public static getCachedValues(): Array<Entity> {
        return EntitiesService.getEntities();
    }

    public static getCachedChildEntities(): Map<string, Entity[]> {
        return EntitiesService._childEntities;
    }

    public static clearCachedValues() {
        EntitiesService._entities = [];
        EntitiesService._childEntities.clear();
    }

    public static getEntityName(idEntity: string): string {
        const found = EntitiesService._entities.find((entity) => entity.id === idEntity);
        if (found?.name) return found.name;

        return idEntity;
    }

    public static isEntityAllowedToSendCard(idEntity: string): boolean {
        const found = EntitiesService._entities.find((entity) => entity.id === idEntity);
        return found?.roles?.includes(RoleEnum.CARD_SENDER);
    }

    /** Given a list of entities that might contain parent entities, EntitiesService method returns the list of entities
     *  that can actually send cards
     * */
    public static resolveEntitiesAllowedToSendCards(selected: Entity[]): Entity[] {
        const allowed = new Set<Entity>();
        selected.forEach((entity) => {
            if (entity.roles?.includes(RoleEnum.CARD_SENDER)) {
                allowed.add(entity);
            } else {
                const children = EntitiesService._entities.filter((child) => child.parents?.includes(entity.id));
                const childrenAllowed = EntitiesService.resolveEntitiesAllowedToSendCards(children);
                childrenAllowed.forEach((c) => allowed.add(c));
            }
        });
        return Array.from(allowed);
    }

    public static resolveEntities(recipients: EntitiesTree[]): Entity[] {
        const resolvedEntities = [];
        recipients.forEach((r) => {
            if (r.levels) {
                r.levels.forEach((l) => {
                    EntitiesService.resolveChildEntitiesByLevel(r.id, l).forEach((entity) => {
                        if (!resolvedEntities.find((o) => o.id === entity.id)) {
                            resolvedEntities.push(entity);
                        }
                    });
                });
            } else if (!resolvedEntities.find((o) => o.id === r.id)) {
                const entity = EntitiesService.getEntities().find((e) => e.id === r.id);
                if (entity) resolvedEntities.push(entity);
                else logger.info('Entity not found : ' + r.id);
            }
        });
        return resolvedEntities;
    }

    /** This method returns the list of entities related to a given parent entity by a specified level of relationship **/
    public static resolveChildEntitiesByLevel(parentId: string, level: number): Entity[] {
        const resolved = new Set<Entity>();
        const parent = EntitiesService._entities.find((e) => e.id === parentId);
        if (parent) {
            if (level === 0) {
                resolved.add(parent);
            } else if (level > 0) {
                EntitiesService.findChildEntitiesByLevel(parent, 1, level).forEach((c) => resolved.add(c));
            }
        }
        return Array.from(resolved);
    }

    private static findChildEntitiesByLevel(parent: Entity, currentLevel: number, level: number): Entity[] {
        const resolved = new Set<Entity>();
        const children = EntitiesService._entities.filter((child) => child.parents?.includes(parent.id));

        if (currentLevel === level) {
            children.forEach((c) => resolved.add(c));
        } else if (currentLevel < level) {
            children.forEach((c) => {
                EntitiesService.findChildEntitiesByLevel(c, currentLevel + 1, level).forEach((n) => resolved.add(n));
            });
        }
        return Array.from(resolved);
    }

    /** This method returns the list of descendant entities related to a given parent entity **/
    public static resolveChildEntities(parentId: string): Entity[] {
        let childEntities = EntitiesService._childEntities.get(parentId);
        if (!childEntities) {
            const resolved = new Set<Entity>();
            const parent = EntitiesService._entities.find((e) => e.id === parentId);
            if (parent) {
                EntitiesService.findChildEntities(parent).forEach((cc) => resolved.add(cc));
            }
            childEntities = Array.from(resolved);
            childEntities.sort((a, b) => a.description.localeCompare(b.description));
            EntitiesService._childEntities.set(parentId, childEntities);
        }
        return childEntities;
    }

    private static findChildEntities(parent: Entity): Entity[] {
        const resolved = new Set<Entity>();
        const children = EntitiesService._entities.filter((child) => child.parents?.includes(parent.id));
        children.forEach((c) => {
            resolved.add(c);
            EntitiesService.findChildEntities(c).forEach((cc) => resolved.add(cc));
        });
        return Array.from(resolved);
    }
}
