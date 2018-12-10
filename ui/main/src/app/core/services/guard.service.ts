import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from "@angular/router";
import {Observable} from "rxjs";
import {select, Store} from "@ngrx/store";
import {AppState} from "@state/app.interface";
import {isAuthenticatedUntilTime} from "@state/identification/identification.reducer";
import {map} from "rxjs/operators";

@Injectable()
export class AuthenticationGuard implements CanActivate {

    readonly isSessionAuthenticated$: Observable<boolean>;

    constructor(private store: Store<AppState>) {
        this.isSessionAuthenticated$=this.store.pipe(
            select(state => isAuthenticatedUntilTime(state.identification)),
            map(expirationDate => {
                const currentDate = Date.now();
                return expirationDate > currentDate;
            })
        );
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
        Observable<boolean> | Promise<boolean> | boolean {
        return this.isSessionAuthenticated$;
    }
}

@Injectable()
export class UnAuthorizedGuard implements CanActivate {

    constructor(private authGuard: AuthenticationGuard){
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        return ! this.authGuard.canActivate(route, state);
    }
}