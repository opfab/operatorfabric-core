/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Action} from '@ngrx/store';
import {Update} from '@ngrx/entity';
import {Card} from './card.model';

export enum CardActionTypes {
  LoadCards = '[Card] Load Cards',
  LoadCardsSuccess = '[Card] Load Cards Success',
  LoadCardsFail = '[Card] Load Cards Fail',
  LoadCard = '[Card] Load Card',
  LoadCardSuccess = '[Card] Load Card Success',
  LoadCardFail = '[Card] Load Card Fail',
  AddCard = '[Card] Add Card',
  AddCardSuccess = '[Card] Add Card Success',
  AddCardFailure = '[Card] Add card Fail',
  UpsetCard = '[Card] Upset Card',
  AddCards = '[Card] Add Cards',
  UpsetCards = '[Card] Upset Cards',
  UpdateCard = '[Card] Update Card',
  UpdateCards = '[Card] Update Cards',
  DeleteCard = '[Card] Delete Card',
  DeleteCards = '[Card] Delete Cards',
  ClearCards = '[Card] Clear Cards'
}

export class LoadCards implements Action {
  readonly type = CardActionTypes.LoadCards;
}

export class LoadCardsSuccess implements Action {
  readonly type = CardActionTypes.LoadCardsSuccess;

  constructor(public payload: { cards: Card[] }) {
  }
}

export class LoadCardsFail implements Action {
  readonly type = CardActionTypes.LoadCardsFail;
}

export class LoadCard implements Action {
  readonly type = CardActionTypes.LoadCard;

  constructor(public payload: { id: string }) {
  }
}

export class LoadCardSuccess implements Action {
  readonly type = CardActionTypes.LoadCardSuccess;

  constructor(public payload: { card: Card }) {
  }
}

export class LoadCardFail implements Action {
  readonly type = CardActionTypes.LoadCardFail;
}

export class AddCard implements Action {
  readonly type = CardActionTypes.AddCard;

  constructor(public payload: { card: Card }) {
  }
}
export class AddCardSuccess implements Action {
  readonly type = CardActionTypes.AddCardSuccess;

  constructor(public payload: { card: Card }) {
  }
}
export class AddCardFailure implements Action {
  readonly type = CardActionTypes.AddCardFailure;

  constructor(public payload: { error: Error }) {
  }
}




export class UpsetCard implements Action {
  readonly type = CardActionTypes.UpsetCard;

  constructor(public payload: { card: Card }) {
  }
}

export class AddCards implements Action {
  readonly type = CardActionTypes.AddCards;

  constructor(public payload: { cards: Card[] }) {
  }
}

export class UpsetCards implements Action {
  readonly type = CardActionTypes.UpsetCards;

  constructor(public payload: { cards: Card[] }) {
  }
}

export class UpdateCard implements Action {
  readonly type = CardActionTypes.UpdateCard;

  constructor(public payload: { card: Update<Card> }) {
  }
}

export class UpdateCards implements Action {
  readonly type = CardActionTypes.UpdateCards;

  constructor(public payload: { cards: Update<Card>[] }) {
  }
}

export class DeleteCard implements Action {
  readonly type = CardActionTypes.DeleteCard;

  constructor(public payload: { id: string }) {
  }
}

export class DeleteCards implements Action {
  readonly type = CardActionTypes.DeleteCards;

  constructor(public payload: { ids: string[] }) {
  }
}

export class ClearCards implements Action {
  readonly type = CardActionTypes.ClearCards;
}

export type CardActions =
  LoadCards
  | LoadCardsSuccess
  | LoadCardsFail
  | LoadCard
  | LoadCardSuccess
  | LoadCardFail
  | AddCard
  | AddCardSuccess
  | AddCardFailure
  | UpsetCard
  | AddCards
  | UpsetCards
  | UpdateCard
  | UpdateCards
  | DeleteCard
  | DeleteCards
  | ClearCards;
