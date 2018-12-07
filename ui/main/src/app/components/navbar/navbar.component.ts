import {Component, OnInit} from '@angular/core';
import {navigationRoutes} from "../../app-routing.module";
import {Store} from "@ngrx/store";
import {AppState} from "@state/app.interface";
import {getCurrentUrl} from "@state/app.reducer";

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
        this.store.select(getCurrentUrl).subscribe(url => this.currentPath = url);
    }

}
