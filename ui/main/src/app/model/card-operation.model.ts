

import {LightCard} from './light-card.model';

export class CardOperation implements CardOperation {
    /* istanbul ignore next */
    constructor(
        readonly number: number,
        readonly publicationDate: number,
        readonly type: CardOperationType,
        readonly cards?: LightCard[],
        readonly cardIds?: string[]
    ) {
    }

    static convertTypeIntoEnum(key:string, value:string){
        if(key === 'type'){
            return CardOperationType[value]
        }
        return value;
    }

}

export enum CardOperationType {
    ADD , UPDATE, DELETE
}
