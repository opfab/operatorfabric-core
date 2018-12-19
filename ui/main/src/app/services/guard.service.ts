/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {select, Store} from '@ngrx/store';
import {map, tap} from 'rxjs/operators';
import {RouterGo} from 'ngrx-router';
import {isInTheFuture} from './authentication.service';
import {AppState} from '../store/index';
import {selectExpirationTime} from '../store/selectors/authentication.selectors';

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