import {LightCard} from '@state/light-card/light-card.model';

export interface CardOperation {
  number: number;
  publicationDate: number;
  type: CardOperationType;
  cards?: LightCard[];
}

export class CardOperation implements  CardOperation{
  number: number;
  publicationDate: number;
  type: CardOperationType;
  cards?: LightCard[];

  constructor(data?: string) {
    if (data) {
      const parsedData = JSON.parse(data);
      Object.assign(this, parsedData);
    }

  }
}

export enum CardOperationType {
  ADD, UPDATE, DELETE
}
