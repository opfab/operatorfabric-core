import {EntityState, EntityAdapter, createEntityAdapter} from '@ngrx/entity';
import {CardOperation} from './card-operation.model';
import {CardOperationActions, CardOperationActionTypes} from './card-operation.actions';

export interface State extends EntityState<CardOperation> {
    selectCardOperationId: string | number;
    loading: boolean;
    error: string;
}

export const adapter: EntityAdapter<CardOperation> = createEntityAdapter<CardOperation>();

export const initialState: State = adapter.getInitialState({
    selectCardOperationId: null, loading: false, error: null
});

export function reducer(
    state = initialState,
    action: CardOperationActions
): State {
    switch (action.type) {
        case CardOperationActionTypes.AddCardOperation: {
            return adapter.addOne(action.payload.cardOperation, state);
        }

        case CardOperationActionTypes.UpsertCardOperation: {
            return adapter.upsertOne(action.payload.cardOperation, state);
        }

        case CardOperationActionTypes.AddCardOperations: {
            return adapter.addMany(action.payload.cardOperations, state);
        }

        case CardOperationActionTypes.UpsertCardOperations: {
            return adapter.upsertMany(action.payload.cardOperations, state);
        }

        case CardOperationActionTypes.UpdateCardOperation: {
            return adapter.updateOne(action.payload.cardOperation, state);
        }

        case CardOperationActionTypes.UpdateCardOperations: {
            return adapter.updateMany(action.payload.cardOperations, state);
        }

        case CardOperationActionTypes.DeleteCardOperation: {
            return adapter.removeOne(action.payload.id, state);
        }

        case CardOperationActionTypes.DeleteCardOperations: {
            return adapter.removeMany(action.payload.ids, state);
        }

        case CardOperationActionTypes.LoadCardOperations: {
            return {
                ...adapter.removeAll(state),
                loading: true,
                error: ''
            };
        }

        case CardOperationActionTypes.LoadCardOperationsSuccess: {
            return {
                ...adapter.addAll(action.payload.cardOperations, state),
                loading: false
            };
        }

        case CardOperationActionTypes.LoadCardOperationsFail: {
            return {
                ...state,
                loading: false,
                error: 'error while loading lightCard Operations'
            };
        }

        case CardOperationActionTypes.ClearCardOperations: {
            return adapter.removeAll(state);
        }

        default: {
            return state;
        }
    }
}

export const {
    selectIds,
    selectEntities,
    selectAll,
    selectTotal,
} = adapter.getSelectors();

export const getSelectedId = (state: State) => state.selectCardOperationId;
export const getLoading = (state: State) => state.loading;
export const getError = (state: State) => state.error;
