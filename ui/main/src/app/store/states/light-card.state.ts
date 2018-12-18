import {createEntityAdapter, EntityAdapter, EntityState} from "@ngrx/entity";
import {LightCard} from "@ofModel/light-card.model";

export interface LightCardStateEntity extends EntityState<LightCard> {
    selectedCardId: number | string;
    loading: boolean;
    error: string;
}

export const LightCardAdapter: EntityAdapter<LightCard> = createEntityAdapter<LightCard>();

export const lightCardInitialState: LightCardStateEntity = LightCardAdapter.getInitialState(
    {
        selectedCardId: null, loading: false, error: ''
    });