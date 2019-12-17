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
import { buildConfigSelector } from '@ofStore/selectors/config.selectors';

@Component({
  selector: 'of-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

    navbarCollapsed = true;
    navigationRoutes = navigationRoutes;
    currentPath: string[];
    private _thirdMenus: Observable<ThirdMenu[]>;
    expandedMenu:boolean[]=[];
    expandedUserMenu=false;

    customLogo: string;
    height: Number;
    width: Number;
    limitSize: Boolean;

    constructor(private store: Store<AppState>) {
    }

    ngOnInit() {
        this.store.select(selectCurrentUrl).subscribe(url=>{
            if(url)
                this.currentPath = url.split('/');
        });
        this._thirdMenus=this.store.select(selectMenuStateMenu)
            .pipe(tap(menus=>{
                this.expandedMenu=new Array<boolean>(menus.length);
                _.fill(this.expandedMenu,false);
            }));
        this.store.dispatch(new LoadMenu());

        this.store.select(buildConfigSelector('logo.base64')).subscribe(
            data => {
              if (data) this.customLogo = `data:image/svg+xml;base64,${data}`
            }
        );

        this.store.select(buildConfigSelector('logo.height')).subscribe(
            height => {
              if (height) this.height = height;
            }
        );

        this.store.select(buildConfigSelector('logo.width')).subscribe(
            width => {
              if (width) this.width = width;
            }
        );
        this.store.select(buildConfigSelector('logo.limitSize')).subscribe(
            (limitSize:boolean) => {
                // BE CAREFUL, as a boolean it has to be test with undefined value to know if it has been set.
              if (limitSize!=undefined && typeof(limitSize) =='boolean') this.limitSize = limitSize;
            }
        );
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

    toggleUserMenu(){
        this.expandedUserMenu=!this.expandedUserMenu;
        if(this.expandedUserMenu)
            setTimeout(()=>this.expandedUserMenu=false,5000);
    }
}
