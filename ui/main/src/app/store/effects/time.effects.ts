import {Injectable} from "@angular/core";
import {AppState} from "@ofStore/index";
import {Action, Store} from "@ngrx/store";
import {Actions, Effect, ofType} from "@ngrx/effects";
import {Observable, of, throwError} from "rxjs";
import {TimeService} from "@ofServices/time.service";
import {AuthenticationActionTypes} from "@ofActions/authentication.actions";
import {catchError, map, switchMap} from "rxjs/operators";
import {TimeReference} from "@ofModel/time.model";
import {FailToUpdateTimeReference, Tick, UpdateTimeReference} from "@ofActions/time.actions";
import * as moment from 'moment-timezone';
import {selectTimeReference} from "@ofSelectors/time.selectors";
import {Message, MessageLevel} from "@ofModel/message.model";
import {I18n} from "@ofModel/i18n.model";
import {Map} from "@ofModel/map" ;

@Injectable()
export class TimeEffects {

    private currentTimeReference: TimeReference;

    constructor(private store: Store<AppState>,
                private actions$: Actions,
                private service: TimeService
    ) {
        this.store.select(selectTimeReference).subscribe(
            timeRef => this.currentTimeReference = timeRef
        );
    }

    /**
     *This Observable send a tick corresponding to the heart beat of the application.
     *
     */

    @Effect()
    heartBeat: Observable<Action> = this.actions$
        .pipe(
            ofType(AuthenticationActionTypes.AcceptLogIn),
            switchMap(() => this.service.pulsate()
                .pipe(map(() => {
                        return new Tick({currentTime: this.currentTimeReference.computeNow(moment())});
                    })
                ))
        );
    /**
     *This Observable update the way time is managed in the application.
     *
     */
    @Effect()
    stickToVirtualTime: Observable<Action> = this.actions$
        .pipe(
            ofType(AuthenticationActionTypes.AcceptLogIn),
            switchMap(
                () => this.service.fetchTimeReferences().pipe(
                    map(timeRef => new UpdateTimeReference({timeReference: timeRef})),
                    catchError(error => {
                                console.error(error);
                                const i18nParameters = new Map<string>();
                                i18nParameters['message'] = error;

                                return of(new FailToUpdateTimeReference(
                                    {
                                        error: new Message(
                                            'something went wrong during Time Reference update from Time service',
                                            MessageLevel.ERROR,
                                            new I18n('time.error', i18nParameters))
                                    }))
                        }
                    )
                )
            )
        );

}
