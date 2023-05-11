/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {navigationRoutes} from '../../router/app-routing.module';
import {CustomMenu} from '@ofModel/menu.model';
import {GlobalStyleService} from 'app/business/services/global-style.service';
import {Route, Router} from '@angular/router';
import {ConfigService} from 'app/business/services/config.service';
import {NgbModal, NgbModalOptions, NgbModalRef, NgbPopover} from '@ng-bootstrap/ng-bootstrap';
import {MenuService} from 'app/business/services/menu.service';
import {Observable} from 'rxjs';
import {AuthService} from 'app/authentication/auth.service';
import {RouterStore} from 'app/business/store/router.store';

@Component({
    selector: 'of-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

    navbarCollapsed = true;
    navigationRoutes: Route[] = [];
    currentRoute = '';
    businessconfigMenus: CustomMenu[];
    openDropdownPopover: NgbPopover;
    currentDropdownHovered;

    modalRef: NgbModalRef;
    @ViewChild('userCard') userCardTemplate: ElementRef;

    @ViewChild('about') aboutTemplate: ElementRef;

    customLogo: string;
    height: number;
    width: number;
    limitSize: boolean;
    displayAdmin: boolean;
    displayActivityArea: boolean;
    displayFeedConfiguration: boolean;
    displayRealTimeUsers: boolean;
    displayExternalDevicesConfiguration: boolean;
    displayUserActionLogs: boolean;
    displayCreateUserCard: boolean;
    displayCalendar: boolean;
    displaySettings: boolean;
    displayAbout: boolean;
    displayLogOut: boolean;
    displayChangePassword: boolean;
    displayEnvironmentName = false;
    environmentName: string;
    environmentColor: string;
    nightDayMode = false;
    logoutInProgress = false;

    styleMode : Observable<string>;

    constructor(
        private routerStore: RouterStore,
        private router: Router,
        private globalStyleService: GlobalStyleService,
        private configService: ConfigService,
        private menuService: MenuService,
        private modalService: NgbModal,
        private authService: AuthService
    ) {
    }

    ngOnInit() {

        this.routerStore.getCurrentRouteEvent().subscribe((route)=> {
            this.currentRoute = route.split('/')[1];
        });

        this.businessconfigMenus = this.menuService.getCurrentUserCustomMenus(this.configService.getMenus());

        const logo = this.configService.getConfigValue('logo.base64');
        if (logo) {
            this.customLogo = `data:image/svg+xml;base64,${logo}`;
        }
        const logo_height = this.configService.getConfigValue('logo.height');
        if (logo_height) {
            this.height = logo_height;
        }

        const logo_width = this.configService.getConfigValue('logo.width');
        if (logo_width) {
            this.width = logo_width;
        }

        const logo_limitSize = this.configService.getConfigValue('logo.limitSize');
        this.limitSize = logo_limitSize === true;

        const visibleCoreMenus = this.menuService.computeVisibleCoreMenusForCurrentUser();
        visibleCoreMenus.forEach(visibleCoreMenu => {
            const route = navigationRoutes.find(route => route.path === visibleCoreMenu);

            if (route) {
                this.navigationRoutes.push(route);
            }
        });

        this.displayAdmin = visibleCoreMenus.includes('admin');
        this.displayActivityArea = visibleCoreMenus.includes('activityarea');
        this.displayFeedConfiguration = visibleCoreMenus.includes('feedconfiguration');
        this.displayRealTimeUsers = visibleCoreMenus.includes('realtimeusers');
        this.displayExternalDevicesConfiguration = visibleCoreMenus.includes('externaldevicesconfiguration');
        this.displayUserActionLogs = visibleCoreMenus.includes('useractionlogs');
        this.displayCreateUserCard = visibleCoreMenus.includes('usercard');
        this.displayCalendar = visibleCoreMenus.includes('calendar');
        this.displaySettings = visibleCoreMenus.includes('settings');
        this.displayAbout = visibleCoreMenus.includes('about');
        this.displayLogOut = visibleCoreMenus.includes('logout');
        this.displayChangePassword = visibleCoreMenus.includes('changepassword');
        this.nightDayMode = visibleCoreMenus.includes('nightdaymode');

        this.environmentName = this.configService.getConfigValue('environmentName');
        this.environmentColor = this.configService.getConfigValue('environmentColor', 'blue');
        if (this.environmentName) this.displayEnvironmentName = true;

        this.styleMode = this.globalStyleService.getStyleChange();
    }

    logOut() {
        this.logoutInProgress = true;
        this.authService.logout();
    }

    toggleMenu(menu, p): void {
        if (this.openDropdownPopover) {
            this.openDropdownPopover.close();
        }
        this.openDropdownPopover = p;
        this.currentDropdownHovered = menu;
    }

    switchToNightMode() {
        this.globalStyleService.switchToNightMode()
    }

    switchToDayMode() {
        this.globalStyleService.switchToDayMode()
    }

    openCardCreation() {
        /**
     We can not have in the same time a card open in the feed and a preview of user card, so
     we close the card if one is open in the feed

     This lead to a BUG :

     In case the user was watching in the feed a card with response activated
     he may not be able to see child cards after closing the usercard form

     REASONS :

     The card template in the preview  may redefine listener set via opfab.currentCard.listenToChildCards
     This will override listener form the card on the feed
     As a consequence, the card on the feed will never receive new (or updated) child cards

     Furthermore, having the same template open twice in the application may cause unwanted behavior as
     we could have duplicated element html ids in the html document.
*/
        if (this.currentRoute === 'feed')  this.router.navigate(['/feed']);

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
