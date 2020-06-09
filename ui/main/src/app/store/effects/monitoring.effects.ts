import {Injectable} from '@angular/core';
import {AppState} from '@ofStore/index';
import {CardService} from '@ofServices/card.service';
import {Action, Store} from '@ngrx/store';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Observable} from 'rxjs';
import {
    HandleUnexpectedError,
    MonitoringActionType,
    SendMonitoringQuery,
    UpdateMonitoringFilter
} from '@ofActions/monitoring.actions';
import {catchError, map, tap} from 'rxjs/operators';

@Injectable()
export class MonitoringEffects {
    constructor(private store: Store<AppState>
        , private actions$: Actions) {
    }

    @Effect()
    queryMonitoringResult: Observable<Action> = this.actions$.pipe(
        ofType(MonitoringActionType.SendMonitoringQuery),
        map((action: SendMonitoringQuery) => action.payload.params),
        map( (params: Map<string, string[]>) =>  new UpdateMonitoringFilter({filters: params})),
        catchError((error, caught) => {
            this.store.dispatch(new HandleUnexpectedError({error: error}));
            return caught;
        })
    );

}
