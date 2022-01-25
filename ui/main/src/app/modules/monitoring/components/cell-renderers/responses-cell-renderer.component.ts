/* Copyright (c) 2021-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {Component, OnDestroy} from '@angular/core';
import {Card} from '@ofModel/card.model';
import {EntitiesService} from '@ofServices/entities.service';
import {LightCardsStoreService} from '@ofServices/lightcards/lightcards-store.service';
import {ICellRendererAngularComp} from 'ag-grid-angular';
import {ICellRendererParams} from 'ag-grid-community';
import {filter, Subject, takeUntil} from 'rxjs';

const maxVisibleEntities = 2;

@Component({
  selector: 'of-responses-cell-renderer',
  templateUrl: './responses-cell-renderer.component.html',
  styleUrls: ['./responses-cell-renderer.component.scss']
})
export class ResponsesCellRendererComponent implements ICellRendererAngularComp, OnDestroy {



  constructor(private entitiesService: EntitiesService, private lightCardsStoreService: LightCardsStoreService) {
    
  }

  // For explanations regarding ag-grid CellRenderers see
  // https://www.ag-grid.com/documentation/angular/component-cell-renderer/#example-rendering-using-angular-components
  private params: any;
  private api: any;
  public cardUid: string;
  public childCards: Card[];

  listVisibleEntities: any[];
  listDropdownEntities: any[];



  unsubscribe$: Subject<void> = new Subject<void>();


  agInit(params: any): void {
    this.params = params;
    this.api = params.api;
    this.cardUid = params.data.cardUid;

    this.childCards = this.lightCardsStoreService.getChildCards(params.data.cardId);
    this.checkEntitiesResponses();

    this.lightCardsStoreService.getNewLightChildCards()
      .pipe(takeUntil(this.unsubscribe$), filter(child => child.parentCardId === params.data.cardId))
      .subscribe(child => this.api.refreshCells({
        force: true,
        rowNodes: [this.params.node]}));
  }


  checkEntitiesResponses() {
    const responses = this.createEntityResponsesList(this.params.data.entitiesResponses);
    responses.sort((a, b) => a.name?.localeCompare(b.name));
    this.listVisibleEntities = responses.length > maxVisibleEntities ?
                                    responses.slice(0, maxVisibleEntities) :
                                    responses;

    this.listDropdownEntities = responses.length > maxVisibleEntities ?
                                    responses.slice(maxVisibleEntities) :
                                                    [];
  }

  private createEntityResponsesList(entities: string[]) {
    const entityHeader = [];
    entities.forEach(entity => {
        const entityName = this.entitiesService.getEntityName(entity);
        if (entityName) {
            entityHeader.push(
                {
                    id: entity,
                    name: entityName,
                    color: this.checkEntityAnswered(entity) ? "green" : "#ff6600"
                });
        }
    });
    return entityHeader;
  }

  private checkEntityAnswered(entity: string): boolean {
    if (this.childCards)
      return this.childCards.some(childCard => childCard.publisher === entity);
    else
      return false;
  }

  // noinspection JSUnusedLocalSymbols
  /** This method returns true to signal to the grid that this renderer doesn't need to be recreated if the underlying data changes
   *  See https://www.ag-grid.com/documentation/angular/component-cell-renderer/#handling-refresh
   * */
  refresh(params: ICellRendererParams): boolean {
    return false;
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
