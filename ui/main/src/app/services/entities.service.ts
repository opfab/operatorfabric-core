/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {environment} from '@env/environment';
import {HttpClient} from '@angular/common/http';
import {catchError, takeUntil, tap} from 'rxjs/operators';
import {Observable, Subject} from 'rxjs';
import {Entity} from '@ofModel/entity.model';
import {Injectable, OnDestroy} from '@angular/core';
import {CachedCrudService} from '@ofServices/cached-crud-service';


declare const templateGateway: any;

@Injectable({
    providedIn: 'root'
})
export class EntitiesService extends CachedCrudService implements OnDestroy {

 readonly entitiesUrl: string;
 private _entities: Entity[];
 private ngUnsubscribe$ = new Subject<void>();
  /**
   * @constructor
   * @param httpClient - Angular build-in
   */
  constructor(private httpClient: HttpClient) {
    super();
    this.entitiesUrl = `${environment.urls.entities}`;
  }

  ngOnDestroy() {
        this.ngUnsubscribe$.next();
        this.ngUnsubscribe$.complete();
  }

  deleteById(id: string) {
      const url = `${this.entitiesUrl}/${id}`;
    return this.httpClient.delete(url).pipe(
      catchError((error: Response) => this.handleError(error)),
        tap(() => {
            this.deleteFromCachedEntities(id);
        })
    );
  }

  private deleteFromCachedEntities(id: string): void {
        this._entities = this._entities.filter(entity => entity.id !== id);
  }

  getAllEntities(): Observable<Entity[]> {
    return this.httpClient.get<Entity[]>(`${this.entitiesUrl}`).pipe(
      catchError((error: Response) => this.handleError(error))
    );
  }

  updateEntity(entityData: Entity): Observable<Entity> {
    return this.httpClient.post<Entity>(`${this.entitiesUrl}`, entityData).pipe(
      catchError((error: Response) => this.handleError(error)),
        tap(() => {
            this.updateCachedEntity(entityData);
        })
    );
  }

  private updateCachedEntity(entityData: Entity): void {
      const updatedEntities = this._entities.filter(entity => entity.id !== entityData.id);
      updatedEntities.push(entityData);
      this._entities = updatedEntities;
  }


  getAll(): Observable<any[]> {
    return this.getAllEntities();
  }

  update(data: any): Observable<any> {
    return this.updateEntity(data);
  }

  public loadAllEntitiesData(): Observable<any> {
    return this.getAllEntities()
      .pipe(takeUntil(this.ngUnsubscribe$)
      , tap(
        (entities) => {
          if (!!entities) {
            this._entities = entities;
            this.setEntityNamesInTemplateGateway();
            console.log(new Date().toISOString(), 'List of entities loaded');
          }
        }, (error) => console.error(new Date().toISOString(), 'an error occurred', error)
      ));
  }

  public getEntities(): Entity[] {
    return this._entities;
  }

  public getEntitiesFromIds(listOfIds: string[]): Entity[] {
        return this.getEntities().filter(entity  => listOfIds.includes(entity.id));
  }

  public getCachedValues(): Array<Entity> {
      return this.getEntities();
  }

    public getEntityName(idEntity: string): string {
      const name = this._entities.find(entity => entity.id === idEntity).name;
      return (name ? name : idEntity);
    }

  private setEntityNamesInTemplateGateway(): void {
    const entityNames  = new Map();
    this._entities.forEach(entity =>  entityNames.set(entity.id, entity.name));
    templateGateway.setEntityNames(entityNames);
  }

  /** Given a list of entities that might contain parent entities, this method returns the list of entities
   *  that can actually send cards
   * */
  public resolveEntitiesAllowedToSendCards(selected: Entity[]) : Entity[] {
    let allowed = new Set<Entity>();
    selected.forEach(entity => {
        if (entity.entityAllowedToSendCard) {
            allowed.add(entity);
        } else {
          const childs = this._entities.filter(child => child.parents.includes(entity.id));
          const childsAllowed = this.resolveEntitiesAllowedToSendCards(childs);
          childsAllowed.forEach(c => allowed.add(c));
        }
    })

    return Array.from(allowed);
  }

  /** This method returns the list of entities related to a given parent entity by a specified level of relationship **/
  public resolveChildEntitiesByLevel(parentId: string, level: number) : Entity[] {
    let resolved = new Set<Entity>();
    const parent = this._entities.find(e => e.id === parentId)
    if (!!parent) {
      if (level == 0) {
        resolved.add(parent);
      } else if (level > 0) {
        this.findChildEntitiesByLevel(parent, 1, level).forEach(c => resolved.add(c));
      }
    }
    return Array.from(resolved);
  }

  private findChildEntitiesByLevel(parent: Entity, currentLevel: number, level: number): Entity[] {
    let resolved = new Set<Entity>();
    const childs = this._entities.filter(child => child.parents.includes(parent.id));

    if (currentLevel == level) {
      childs.forEach(c => resolved.add(c));
    } else if (currentLevel < level) {
      childs.forEach(c => {
        this.findChildEntitiesByLevel(c, currentLevel +1, level).forEach(n => resolved.add(n));
      });
    }
    return Array.from(resolved);
  }

}
