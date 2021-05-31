/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {navigationRoutes} from '../../app-routing.module';
import {Store} from '@ngrx/store';
import {TryToLogOut} from '@ofActions/authentication.actions';
import {AppState} from '@ofStore/index';
import {selectCurrentUrl} from '@ofSelectors/router.selectors';
import {LoadMenu} from '@ofActions/menu.actions';
import {selectMenuStateMenu} from '@ofSelectors/menu.selectors';
import {BehaviorSubject, Observable} from 'rxjs';
import {Menu} from '@ofModel/menu.model';
import {map, tap} from 'rxjs/operators';
import * as _ from 'lodash-es';
import {GlobalStyleService} from '@ofServices/global-style.service';
import {Route} from '@angular/router';
import {ConfigService} from '@ofServices/config.service';
import {QueryAllEntities} from '@ofActions/user.actions';
import {UserService} from '@ofServices/user.service';
import {NgbModal, NgbModalOptions, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {AppService} from '@ofServices/app.service';

@Component({
    selector: 'of-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
    private static nightMode: BehaviorSubject<boolean>;

  navbarCollapsed = true;
  navigationRoutes: Route[];
  currentPath: string[];
  private _businessconfigMenus: Observable<Menu[]>;
  expandedMenu: boolean[] = [];
  
  modalRef: NgbModalRef;
  @ViewChild('userCard') userCardTemplate: ElementRef;

  @ViewChild('about') aboutTemplate: ElementRef;

  customLogo: string;
  height: number;
  width: number;
  limitSize: boolean;
  displayAdmin: boolean;
  displayFeedConfiguration: boolean;
  displayRealTimeUsers: boolean;
  displayCreateUserCard: boolean;
  displayCalendar: boolean;
  displayEnvironmentName = false;
  environmentName : string;
  environmentColor : string;
  nightDayMode = false;

  constructor(private store: Store<AppState>, private globalStyleService: GlobalStyleService, private configService: ConfigService
    , private userService: UserService, private modalService: NgbModal, private appService: AppService) {

      this.currentPath = ['']; // Initializing currentPath to avoid 'undefined' errors when it is used to determine 'active' look in template
  }

    ngOnInit() {
      this.store.select(selectCurrentUrl).subscribe(url => {
          if (url) {
              this.currentPath = url.split('/');
          }
      });
      this._businessconfigMenus = this.store.select(selectMenuStateMenu)
      .pipe(map(menus => this.getCurrentUserMenus(menus)),
        tap(menus => {
          this.expandedMenu = new Array<boolean>(menus.length);
          _.fill(this.expandedMenu, false);
      }));
      this.store.dispatch(new LoadMenu());
      this.store.dispatch(new QueryAllEntities());


    const logo = this.configService.getConfigValue('logo.base64');
    if (!!logo) {
      this.customLogo = `data:image/svg+xml;base64,${logo}`;
    }
    const logo_height = this.configService.getConfigValue('logo.height');
    if (!!logo_height) {
      this.height = logo_height;
    }

    const logo_width = this.configService.getConfigValue('logo.width');
    if (!!logo_width) {
      this.width = logo_width;
    }

    const logo_limitSize = this.configService.getConfigValue('logo.limitSize');
    this.limitSize = (logo_limitSize === true);


    const settings = this.configService.getConfigValue('settings');
    if (settings) {
      if (settings.nightDayMode) {
        this.nightDayMode = <boolean>settings.nightDayMode;
      }
      if (!this.nightDayMode) {
        if (settings.styleWhenNightDayModeDesactivated) {
          this.globalStyleService.setStyle(settings.styleWhenNightDayModeDesactivated);
        }
      } else {
        this.loadNightModeFromLocalStorage();
      }
    }

    const hiddenMenus = this.configService.getConfigValue('navbar.hidden', []);
    this.navigationRoutes = navigationRoutes.filter(route => !hiddenMenus.includes(route.path));
    this.displayAdmin = this.userService.isCurrentUserAdmin() && !this.configService.getConfigValue('admin.hidden');
    this.displayFeedConfiguration = !this.configService.getConfigValue('feedConfiguration.hidden');
    this.displayRealTimeUsers = this.userService.isCurrentUserAdmin() && !this.configService.getConfigValue('realTimeUsers.hidden');
    this.displayCreateUserCard = ! hiddenMenus.includes("usercard");
    this.displayCalendar = ! hiddenMenus.includes("calendar");
    this.environmentName = this.configService.getConfigValue('environmentName');
    this.environmentColor = this.configService.getConfigValue('environmentColor','blue');
    if (!!this.environmentName) this.displayEnvironmentName = true

  }

  private getCurrentUserMenus(menus: Menu[]): Menu[] {
    const filteredMenus = [];
    menus.forEach(m => {

      const entries = m.entries.filter(e => !e.showOnlyForGroups || this.userService.isCurrentUserInAnyGroup(e.showOnlyForGroups));
      if (entries.length > 0) {
        filteredMenus.push(new Menu(m.id, m.label, entries));
      }
    });
    return filteredMenus;
  }

  logOut() {
    this.store.dispatch(new TryToLogOut());
  }

  get businessconfigMenus() {
    return this._businessconfigMenus;
  }

  toggleMenu(index: number) {
    this.expandedMenu[index] = !this.expandedMenu[index];
    if (this.expandedMenu[index]) {
      setTimeout(() => this.expandedMenu[index] = false,5000);
    }
  }


  private loadNightModeFromLocalStorage() {
    NavbarComponent.nightMode = new BehaviorSubject<boolean>(true);
    const nightMode = localStorage.getItem('opfab.nightMode');
    if ((nightMode !== null) && (nightMode === 'false')) {
      NavbarComponent.nightMode.next(false);
      this.globalStyleService.setStyle('DAY');
    } else {
      this.globalStyleService.setStyle('NIGHT');
    }

  }

  switchToNightMode() {
    this.globalStyleService.setStyle('NIGHT');
    NavbarComponent.nightMode.next(true);
    localStorage.setItem('opfab.nightMode', 'true');
  }

  switchToDayMode() {
    this.globalStyleService.setStyle('DAY');
    NavbarComponent.nightMode.next(false);
    localStorage.setItem('opfab.nightMode', 'false');

  }

  getNightMode(): Observable<boolean> {
    return NavbarComponent.nightMode.asObservable();
  }

  openCardCreation()
  {

  /** 
  We can not have in the same time a card open in the feed and a preview of user card, so
  we close the card if one is open in the feed 
        
  This lead to a BUG :
  
  In case the user was watching in the feed a card with response activated
  he may not be able to see child cards after closing the usercard form 
   
  REASONS : 
  
  The card template in the preview  may redefine method templateGateway.applyChild 
  This will override method templateGateway.applyChild  form the card on the feed 
  As a consequence, the card on the feed will never receive new (or updated) child cards  

  Futhermore, having the same template open twice in the application may cause unwanted behavior as 
  we could have duplicated element html ids in the html document.

  */
  if (this.currentPath[1]==='feed') this.appService.closeDetails('feed');

  const options: NgbModalOptions = {
    size: 'usercard',
    backdrop: 'static'
};
  this.modalRef = this.modalService.open(this.userCardTemplate, options);
  }

  showAbout() {
    this.modalService.open(this.aboutTemplate, {centered: true});
  }
}



