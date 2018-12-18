import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {select, Store} from '@ngrx/store';
import {map, tap} from 'rxjs/operators';
import {RouterGo} from 'ngrx-router';
import {isInTheFuture} from '@core/services/authentication.service';
import {AppState} from '@ofStore/index';
import {selectExpirationTime} from '@ofSelectors/authentication.selectors';

@Injectable()
export class AuthenticationGuard implements CanActivate {

    readonly isSessionAuthenticated$: Observable<boolean>;

    constructor(private store: Store<AppState>) {
        this.isSessionAuthenticated$ = this.store.pipe(
            select(selectExpirationTime),
            map(isInTheFuture)
        );
    }


    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
        Observable<boolean> | Promise<boolean> | boolean {
        return this.isSessionAuthenticated$.pipe(tap(this.dispatchRouterActionToLoginPageIfFalse ));
    }

    dispatchRouterActionToLoginPageIfFalse(isAuthenticated: boolean){
        if (!isAuthenticated) {
            this.store.dispatch(new RouterGo({path: ['/login']}));
        }
    }
}