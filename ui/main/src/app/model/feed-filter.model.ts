

import {LightCard} from "@ofModel/light-card.model";

/**
 * A Filter gather both the feed filtering behaviour and the filter status for
 * filtering parametrization and component state
 *
 * The function property funktion takes two arguments :
 *  * card: the card for which to evaluate filter
 *  * status: the status of the current filter
 *
 * Beware: we use a copy constructor for replication of filters as a store state so take care of funktion scope
 * in Filter implementation (Instanciation and Inheritance). This is the reason why we pass the filter status upon
 * funktion
 */
export class Filter {

    /* istanbul ignore next */
    constructor(
        readonly funktion: (LightCard,any) => boolean,
        public active:boolean,
        public status: any
    ) {
    }

    clone():Filter {
        return new Filter(
            this.funktion,
            this.active,
            this.status);
    }

    /**
     * apply the filter to the card, returns true if the card passes the filter, false otherwise
     * @param card
     */
    applyFilter(card: LightCard):boolean{
        if(this.active){
            return this.funktion(card,this.status);
        }
        return true;
    }

    /**
     * Apply this filter to a card, then a chain of filter recursively.
     * The recursion stops when the card is filtered out
     * @param card
     * @param next
     */
    chainFilter(card: LightCard, next: Filter[]){
        if(this.applyFilter(card))
            return !next || next.length == 0 || next[0].chainFilter(card,next.slice(1));
        return false
    }

    /**
     * Sequentially applies a chain of filters to a card
     * @param card
     * @param next
     */
    static chainFilter(card: LightCard, next: Filter[]){
        return !next||next.length == 0 || next[0].chainFilter(card,next.slice(1));
    }
}
