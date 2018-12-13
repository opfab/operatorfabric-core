import {Component, OnInit} from '@angular/core';
import {navigationRoutes} from "../../app-routing.module";
import {select, Store} from "@ngrx/store";
import {AppState} from "@state/app.interface";
import {getCurrentUrl} from "@state/app.reducer";
import {TryToLogOut} from "@state/authentication/authentication.actions";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

    navbarCollapsed = true;
    navigationRoutes = navigationRoutes;
    currentPath: any;

    constructor(private store: Store<AppState>) {
    }

    ngOnInit() {
        this.store.pipe(select(getCurrentUrl)).subscribe(url => this.currentPath = url);
    }


    logOut(){
        this.store.dispatch(new TryToLogOut());
    }
}
