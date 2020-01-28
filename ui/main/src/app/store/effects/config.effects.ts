
import {Inject, Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Action, Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {catchError, delay, filter, map, switchMap, withLatestFrom} from 'rxjs/operators';
import {ConfigService} from '@ofServices/config.service';
import {AppState} from "@ofStore/index";
import {ConfigActionTypes, LoadConfig, LoadConfigFailure, LoadConfigSuccess} from "@ofActions/config.actions";
import {selectConfigRetry} from "@ofSelectors/config.selectors";
import {CONFIG_LOAD_MAX_RETRIES} from "@ofStates/config.state";

// those effects are unused for the moment
@Injectable()
export class ConfigEffects {

    /* istanbul ignore next */
    constructor(private store: Store<AppState>,
                private actions$: Actions,
                private service: ConfigService,
                @Inject('configRetryDelay')
                private retryDelay: number = 5000,
    ) {

        if (this.retryDelay > 0)
            this.retryConfigurationLoading = this.actions$
                .pipe(
                    ofType<LoadConfigFailure>(ConfigActionTypes.LoadConfigFailure),
                    withLatestFrom(this.store.select(selectConfigRetry)),
                    filter(([action, retry]) => retry < CONFIG_LOAD_MAX_RETRIES),
                    map(() => new LoadConfig()),
                    delay(this.retryDelay)
                );
        else
            this.retryConfigurationLoading = this.actions$
                .pipe(
                    ofType<LoadConfigFailure>(ConfigActionTypes.LoadConfigFailure),
                    withLatestFrom(this.store.select(selectConfigRetry)),
                    filter(([action, retry]) => retry < CONFIG_LOAD_MAX_RETRIES),
                    map(() => new LoadConfig())
                );
    }

    /**
     * Manages configuration load -> service request -> success/message
     */
    @Effect()
    loadConfiguration: Observable<Action> = this.actions$
        .pipe(
            ofType<LoadConfig>(ConfigActionTypes.LoadConfig),
            switchMap(action => this.service.fetchConfiguration()),
            map((config: any) => {
                return new LoadConfigSuccess({config: config});
            }),
            catchError((err, caught) => {
                this.store.dispatch(new LoadConfigFailure(err));
                return caught;
            })
        );

    /**
     * Manages load retry upon message
     */
    @Effect()
    retryConfigurationLoading: Observable<Action>;
    
}
