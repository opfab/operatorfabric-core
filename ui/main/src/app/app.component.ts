import {Component, OnInit} from '@angular/core';
import {navigationRoutes} from './app-routing.module';
import {Store} from '@ngrx/store';
import {AppState} from '@state/app.interface';
import {Observable} from 'rxjs';
import {getCurrentUrl, selectRouterState} from '@state/app.reducer';
import {TempAutomticLogIn} from '@state/authentication/authentication.actions';
import {LoadLightCards} from '@state/light-card/light-card.actions';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    title = 'Operator Fabric';
    navigationRoutes = navigationRoutes;
    getRoutePE: Observable<any>;
    currentPath: any;

    constructor(private store: Store<AppState>) {
        this.getRoutePE = this.store.select(selectRouterState);
    }

    ngOnInit() {
        this.store.select(getCurrentUrl).subscribe(url => this.currentPath = url);
        this.store.dispatch(new TempAutomticLogIn());
    }


}
