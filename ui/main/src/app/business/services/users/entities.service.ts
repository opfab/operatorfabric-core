/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {map, takeUntil, tap} from 'rxjs/operators';
import {Observable, Subject} from 'rxjs';
import {Entity} from '@ofModel/entity.model';
import {Injectable} from '@angular/core';
import {CachedCrudService} from 'app/business/services/cached-crud-service';
import {EntitiesServer} from '../../server/entities.server';
import {ServerResponseStatus} from '../../server/serverResponse';
import {EntitiesTree} from '@ofModel/processes.model';
import {LoggerService as logger} from '../logs/logger.service';


@Injectable({
    providedIn: 'root'
})
export class EntitiesService extends CachedCrudService {
    protected _entities: Entity[];
    private ngUnsubscribe$ = new Subject<void>();
    /**
     * @constructor
     * @param httpClient - Angular build-in
     */
    constructor(
        private entitiesServer: EntitiesServer) {
        super();
    }

    deleteById(id: string) {
        return this.entitiesServer.deleteById(id).pipe(
            tap((entitiesResponse) => {
                if (entitiesResponse.status === ServerResponseStatus.OK){
                    this.deleteFromCachedEntities(id);
                } else {
                    this.handleServerResponseError(entitiesResponse);
                }
            })
        );
    }

    private deleteFromCachedEntities(id: string): void {
        this._entities = this._entities.filter((entity) => entity.id !== id);
    }

    queryAllEntities(): Observable<Entity[]> {
        return this.entitiesServer.queryAllEntities().pipe(
            map((entitiesResponse) => {
                if (entitiesResponse.status === ServerResponseStatus.OK){
                    return entitiesResponse.data;
                } else {
                    this.handleServerResponseError(entitiesResponse);
                    return [];
                }
            })
            );
    }

    updateEntity(entityData: Entity): Observable<Entity> {
        return this.entitiesServer.updateEntity(entityData).pipe(
            map((responseEntities) => {
                if (responseEntities.status === ServerResponseStatus.OK) {
                    this.updateCachedEntity(entityData);
                    return responseEntities.data;
                } else {
                    this.handleServerResponseError(responseEntities);
                    return null;
                }
            })
        );
    }

    private updateCachedEntity(entityData: Entity): void {
        const updatedEntities = this._entities.filter((entity) => entity.id !== entityData.id);
        updatedEntities.push(entityData);
        this._entities = updatedEntities;
    }

    getAll(): Observable<any[]> {
        return this.queryAllEntities();
    }

    update(data: any): Observable<any> {
        return this.updateEntity(data);
    }

    public loadAllEntitiesData(): Observable<any> {
        return this.queryAllEntities().pipe(
            takeUntil(this.ngUnsubscribe$),
            tap({
                next: (entities) => {
                    if (entities) {
                        this._entities = entities;
                        console.log(new Date().toISOString(), 'List of entities loaded');
                    }
                },
                error: (error) => console.error(new Date().toISOString(), 'an error occurred', error)
            })
        );
    }

    public getEntity(entityId) : Entity {
        const entity = this._entities.find((entity) => entity.id === entityId);
        return entity;
    }

    public getEntities(): Entity[] {
        return this._entities;
    }

    public getEntitiesFromIds(listOfIds: string[]): Entity[] {
        return this.getEntities().filter((entity) => listOfIds.includes(entity.id));
    }

    public getCachedValues(): Array<Entity> {
        return this.getEntities();
    }

    public getEntityName(idEntity: string): string {
        const found = this._entities.find((entity) => entity.id === idEntity);
        if (found?.name) return found.name;

        return idEntity;
    }

    public isEntityAllowedToSendCard(idEntity: string): boolean {
        const found = this._entities.find((entity) => entity.id === idEntity);
        return found?.entityAllowedToSendCard;
    }

    /** Given a list of entities that might contain parent entities, this method returns the list of entities
     *  that can actually send cards
     * */
    public resolveEntitiesAllowedToSendCards(selected: Entity[]): Entity[] {
        const allowed = new Set<Entity>();
        selected.forEach((entity) => {
            if (entity.entityAllowedToSendCard) {
                allowed.add(entity);
            } else {
                const children = this._entities.filter((child) => child.parents?.includes(entity.id));
                const childrenAllowed = this.resolveEntitiesAllowedToSendCards(children);
                childrenAllowed.forEach((c) => allowed.add(c));
            }
        });

        return Array.from(allowed);
    }

    public resolveEntities(recipients: EntitiesTree[]): Entity[] {
        const resolvedEntities = [];
        recipients.forEach((r) => {
            if (r.levels) {
                r.levels.forEach((l) => {
                    this.resolveChildEntitiesByLevel(r.id, l).forEach((entity) => {
                        if (!resolvedEntities.find((o) => o.id === entity.id)) {
                            resolvedEntities.push(entity);
                        }
                    });
                });
            } else {
                if (!resolvedEntities.find((o) => o.id === r.id)) {
                    const entity = this.getEntities().find((e) => e.id === r.id);
                    if (entity)
                        resolvedEntities.push(entity);
                    else logger.info('Entity not found : ' + r.id);
                }
            }
        });
        return resolvedEntities;
    }

    /** This method returns the list of entities related to a given parent entity by a specified level of relationship **/
    public resolveChildEntitiesByLevel(parentId: string, level: number): Entity[] {
        const resolved = new Set<Entity>();
        const parent = this._entities.find((e) => e.id === parentId);
        if (parent) {
            if (level === 0) {
                resolved.add(parent);
            } else if (level > 0) {
                this.findChildEntitiesByLevel(parent, 1, level).forEach((c) => resolved.add(c));
            }
        }
        return Array.from(resolved);
    }

    private findChildEntitiesByLevel(parent: Entity, currentLevel: number, level: number): Entity[] {
        const resolved = new Set<Entity>();
        const children = this._entities.filter((child) => child.parents?.includes(parent.id));

        if (currentLevel === level) {
            children.forEach((c) => resolved.add(c));
        } else if (currentLevel < level) {
            children.forEach((c) => {
                this.findChildEntitiesByLevel(c, currentLevel + 1, level).forEach((n) => resolved.add(n));
            });
        }
        return Array.from(resolved);
    }

    /** This method returns the list of descendant entities related to a given parent entity **/
    public resolveChildEntities(parentId: string): Entity[] {
        const resolved = new Set<Entity>();
        const parent = this._entities.find((e) => e.id === parentId);
        if (parent) {
            this.findChildEntities(parent).forEach((cc) => resolved.add(cc));
        }
        return Array.from(resolved);
    }

    private findChildEntities(parent: Entity): Entity[] {
        const resolved = new Set<Entity>();
        const children = this._entities.filter((child) => child.parents?.includes(parent.id));
        children.forEach((c) => {
            resolved.add(c);
            this.findChildEntities(c).forEach((cc) => resolved.add(cc));
        });
        return Array.from(resolved);
    }
}
