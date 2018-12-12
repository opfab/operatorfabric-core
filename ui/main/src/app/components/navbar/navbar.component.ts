import {Component, OnInit} from '@angular/core';
import {navigationRoutes} from "../../app-routing.module";
import {select, Store} from "@ngrx/store";
import {AppState} from "@state/app.interface";
import {getCurrentUrl} from "@state/app.reducer";
import {TryToLogOut} from "@state/identification/identification.actions";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

    navbarCollapsed = true;
    navigationRoutes = navigationRoutes;
    // getRoutePE: Observable<any>;
    currentPath: any;

    constructor(private store: Store<AppState>) {
        // this.getRoutePE = this.store.select(selectRouterState);
    }

    ngOnInit() {
        this.store.pipe(select(getCurrentUrl)).subscribe(url => this.currentPath = url);
    }


    logOut(){
        this.store.dispatch(new TryToLogOut());
    }
}
