/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {environment} from '@env/environment';
import {HttpClient} from '@angular/common/http';
import {CrudService} from './crud-service';
import {catchError, tap} from 'rxjs/operators';
import {Observable, Subject} from 'rxjs';
import {Entity} from '@ofModel/entity.model';
import {takeUntil} from 'rxjs/internal/operators/takeUntil';
import {Injectable} from '@angular/core';


declare const templateGateway: any;

@Injectable({
    providedIn: 'root'
})
export class EntitiesService extends CrudService {

 readonly entitiesUrl: string;
 private _entities: Entity[];
 private ngUnsubscribe = new Subject<void>();
  /**
   * @constructor
   * @param httpClient - Angular build-in
   */
  constructor(private httpClient: HttpClient) {
    super();
    this.entitiesUrl = `${environment.urls.entities}`;
  }
  deleteById(id: string) {
      const url = `${this.entitiesUrl}/entities/${id}`;
    return this.httpClient.delete(url).pipe(
      catchError((error: Response) => this.handleError(error))
    );
  }

  getAllEntities(): Observable<Entity[]> {
    return this.httpClient.get<Entity[]>(`${this.entitiesUrl}`).pipe(
      catchError((error: Response) => this.handleError(error))
    );
  }

  updateEntity(entityData: Entity): Observable<Entity> {
    return this.httpClient.post<Entity>(`${this.entitiesUrl}`, entityData).pipe(
      catchError((error: Response) => this.handleError(error)),
        tap(next => {
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
      .pipe(takeUntil(this.ngUnsubscribe)
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

  public getEntityName(idEntity: string): string {
      const name = this._entities.find(entity => entity.id === idEntity).name;
      return (name ? name : idEntity);
    }

  private setEntityNamesInTemplateGateway(): void {
    const entityNames  = new Map();
    this._entities.forEach(entity =>  entityNames.set(entity.id, entity.name));
    templateGateway.setEntityNames(entityNames);
  }

}
