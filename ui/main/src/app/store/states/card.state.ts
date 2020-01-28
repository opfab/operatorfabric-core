
import {Card} from '@ofModel/card.model';

export interface CardState {
    selected: Card;
    loading: boolean;
    error: string;
    actionsAppear: string[];
}

export const cardInitialState: CardState = {
    selected: null,
    loading: false,
    error: null,
    actionsAppear: []
};
