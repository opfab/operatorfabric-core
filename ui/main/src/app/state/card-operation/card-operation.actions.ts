/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { CardOperation } from './card-operation.model';

export enum CardOperationActionTypes {
  LoadCardOperations = '[CardOperation] Load CardOperations',
  LoadCardOperationsSuccess= '[CardOperation] Load CardOperations Success',
  LoadCardOperationsFail= '[CardOperation] Load CardOperations Fail',
  AddCardOperation = '[CardOperation] Add CardOperation',
  UpsertCardOperation = '[CardOperation] Upsert CardOperation',
  AddCardOperations = '[CardOperation] Add CardOperations',
  UpsertCardOperations = '[CardOperation] Upsert CardOperations',
  UpdateCardOperation = '[CardOperation] Update CardOperation',
  UpdateCardOperations = '[CardOperation] Update CardOperations',
  DeleteCardOperation = '[CardOperation] Delete CardOperation',
  DeleteCardOperations = '[CardOperation] Delete CardOperations',
  ClearCardOperations = '[CardOperation] Clear CardOperations'
}

export class LoadCardOperations implements Action {
  readonly type = CardOperationActionTypes.LoadCardOperations;
}

export class LoadCardOperationsSuccess implements Action{
  readonly type = CardOperationActionTypes.LoadCardOperationsSuccess;
  constructor(public payload: { cardOperations: CardOperation[] }) {}
}

export class LoadCardOperationsFail implements Action {
  readonly type = CardOperationActionTypes.LoadCardOperationsFail;
}

export class AddCardOperation implements Action {
  readonly type = CardOperationActionTypes.AddCardOperation;

  constructor(public payload: { cardOperation: CardOperation }) {}
}

export class UpsertCardOperation implements Action {
  readonly type = CardOperationActionTypes.UpsertCardOperation;

  constructor(public payload: { cardOperation: CardOperation }) {}
}

export class AddCardOperations implements Action {
  readonly type = CardOperationActionTypes.AddCardOperations;

  constructor(public payload: { cardOperations: CardOperation[] }) {}
}

export class UpsertCardOperations implements Action {
  readonly type = CardOperationActionTypes.UpsertCardOperations;

  constructor(public payload: { cardOperations: CardOperation[] }) {}
}

export class UpdateCardOperation implements Action {
  readonly type = CardOperationActionTypes.UpdateCardOperation;

  constructor(public payload: { cardOperation: Update<CardOperation> }) {}
}

export class UpdateCardOperations implements Action {
  readonly type = CardOperationActionTypes.UpdateCardOperations;

  constructor(public payload: { cardOperations: Update<CardOperation>[] }) {}
}

export class DeleteCardOperation implements Action {
  readonly type = CardOperationActionTypes.DeleteCardOperation;

  constructor(public payload: { id: string }) {}
}

export class DeleteCardOperations implements Action {
  readonly type = CardOperationActionTypes.DeleteCardOperations;

  constructor(public payload: { ids: string[] }) {}
}

export class ClearCardOperations implements Action {
  readonly type = CardOperationActionTypes.ClearCardOperations;
}

export type CardOperationActions =
 LoadCardOperations
 | LoadCardOperationsSuccess
 | LoadCardOperationsFail
 | AddCardOperation
 | UpsertCardOperation
 | AddCardOperations
 | UpsertCardOperations
 | UpdateCardOperation
 | UpdateCardOperations
 | DeleteCardOperation
 | DeleteCardOperations
 | ClearCardOperations;
