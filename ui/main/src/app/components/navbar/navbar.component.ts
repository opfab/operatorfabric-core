import {Component, OnInit} from '@angular/core';
import {navigationRoutes} from "../../app-routing.module";
import {select, Store} from "@ngrx/store";
import {TryToLogOut} from "@ofStore/authentication/authentication.actions";
import {AppState} from "@ofStore/index";
import {getCurrentUrl} from "@ofStore/app.reducer";

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
