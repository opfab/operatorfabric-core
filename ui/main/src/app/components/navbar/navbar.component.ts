/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, OnInit} from '@angular/core';
import {navigationRoutes} from '../../app-routing.module';
import {Store} from '@ngrx/store';
import {TryToLogOut} from '@ofActions/authentication.actions';
import {AppState} from '@ofStore/index';
import {selectCurrentUrl} from '@ofSelectors/router.selectors';
import {LoadMenu} from "@ofActions/menu.actions";
import {selectMenuStateMenu} from "@ofSelectors/menu.selectors";
import {Observable} from "rxjs";
import {ThirdMenu} from "@ofModel/thirds.model";
import {tap} from "rxjs/operators";
import * as _ from 'lodash';

@Component({
  selector: 'of-navbar',
  templateUrl: './navbar.component.html',
})
export class NavbarComponent implements OnInit {

    navbarCollapsed = true;
    navigationRoutes = navigationRoutes;
    currentPath: any;
    private _thirdMenus: Observable<ThirdMenu[]>;
    expandedMenu:boolean[]=[];

    constructor(private store: Store<AppState>) {
    }

    ngOnInit() {
        this.store.select(selectCurrentUrl).subscribe(url=>{
            if(url)
                this.currentPath = url.split('/')[1];
        });
        this._thirdMenus=this.store.select(selectMenuStateMenu)
            .pipe(tap(menus=>{
                this.expandedMenu=new Array<boolean>(menus.length);
                _.fill(this.expandedMenu,false);
            }));
        this.store.dispatch(new LoadMenu());
    }


    logOut(){
        this.store.dispatch(new TryToLogOut());
    }

    get thirdMenus(){
        return this._thirdMenus;
    }

    toggleMenu(index:number){
        this.expandedMenu[index]=!this.expandedMenu[index];
        if(this.expandedMenu[index])
            setTimeout(()=>this.expandedMenu[index]=false,5000);
    }
}
