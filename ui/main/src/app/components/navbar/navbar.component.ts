import {Component, OnInit} from '@angular/core';
import {navigationRoutes} from '../../app-routing.module';
import {select, Store} from '@ngrx/store';
import {TryToLogOut} from '@ofActions/authentication.actions';
import {AppState} from '@ofStore/index';
import {selectCurrentUrl} from '@ofSelectors/router.selectors';

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
        this.store.pipe(select(selectCurrentUrl)).subscribe(url => this.currentPath = url);
    }


    logOut(){
        this.store.dispatch(new TryToLogOut());
    }
}
