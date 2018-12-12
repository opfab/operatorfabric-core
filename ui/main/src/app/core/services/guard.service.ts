import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from "@angular/router";
import {Observable} from "rxjs";
import {select, Store} from "@ngrx/store";
import {AppState} from "@state/app.interface";
import {map} from "rxjs/operators";
import {RouterGo} from "ngrx-router";
import {getExpirationTime} from "@state/authentication";

@Injectable()
export class AuthenticationGuard implements CanActivate {

    readonly isSessionAuthenticated$: Observable<boolean>;

    constructor(private store: Store<AppState>) {
        this.isSessionAuthenticated$ = this.store.pipe(
            select(getExpirationTime),
            map(expirationTime => expirationTime > Date.now())
        );
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
        Observable<boolean> | Promise<boolean> | boolean {
        return this.isSessionAuthenticated$.pipe(map((isAuthenticated: boolean) => {
            if (!isAuthenticated) {
                this.store.dispatch(new RouterGo({path: ['/login']}));
            }
            return isAuthenticated;
        }));
    }
}