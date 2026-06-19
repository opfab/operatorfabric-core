/* Copyright (c) 2018-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, ViewChild, inject} from '@angular/core';
import {NgbModal, NgbModalOptions, NgbPopover} from '@ng-bootstrap/ng-bootstrap';
import {SessionManagerService} from '@ofServices/sessionManager/SessionManagerService';
import {NavbarView} from 'app/components/navbar/view/NavbarView';
import {NavbarMenuElement, NavbarPage} from 'app/components/navbar/view/NavbarPage';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {NavbarMenuView} from 'app/components/navbar/view/NavbarMenuView';
import {TranslateDirective} from '@ngx-translate/core';
import {InfoComponent} from './info/InfoComponent';
import {UserCardComponent} from '../usercard/UserCardComponent';
import {AboutComponent} from '../core/about/AboutComponent';
import {SpinnerComponent} from '../share/spinner/SpinnerComponent';
import {NavigationService} from '@ofServices/navigation/NavigationService';

@Component({
    selector: 'of-navbar',
    templateUrl: './NavbarComponent.html',
    styleUrls: ['./NavbarComponent.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgbPopover, TranslateDirective, InfoComponent, UserCardComponent, AboutComponent, SpinnerComponent]
})
export class NavbarComponent {
    private readonly modalService = inject(NgbModal);
    private readonly domSanitizationService = inject(DomSanitizer);
    private readonly changeDetector = inject(ChangeDetectorRef);

    openDropdownPopover: NgbPopover;
    @ViewChild('userCard') userCardTemplate: ElementRef;
    @ViewChild('about') aboutTemplate: ElementRef;

    currentMenuId = '';
    logoutInProgress = false;

    navbarMenuView: NavbarMenuView;
    navbarPage: NavbarPage;
    upperMenuElements: NavbarMenuElement[];
    rightMenuElements: NavbarMenuElement[];
    rightMenuCollapsedElements: NavbarMenuElement[];

    constructor() {
        this.navbarPage = new NavbarView().getNavbarPage();
        this.navbarMenuView = new NavbarMenuView();
        this.upperMenuElements = this.navbarMenuView.getNavbarMenu().upperMenuElements;
        this.rightMenuElements = this.navbarMenuView.getNavbarMenu().rightMenuElements;
        this.rightMenuCollapsedElements = this.navbarMenuView.getNavbarMenu().rightMenuCollapsedElements;
        this.navbarMenuView.setCurrentSelectedMenuEntryListener((menuEntryId) => {
            this.currentMenuId = menuEntryId;
        });
        this.navbarMenuView.setMenuChangeListener(() => {
            this.upperMenuElements = this.navbarMenuView.getNavbarMenu().upperMenuElements;
            this.rightMenuElements = this.navbarMenuView.getNavbarMenu().rightMenuElements;
            this.changeDetector.markForCheck();
        });
    }

    toggleMenu(newDropdownPopover): void {
        if (this.openDropdownPopover) {
            this.openDropdownPopover.close();
        }
        this.openDropdownPopover = newDropdownPopover;
    }

    openCardCreation() {
        /**
     We can not have at the same time a card opened in the feed and a preview of a user card, so
     we close the card if one is opened in the feed

     This leads to a BUG :

     In case the user was watching in the feed a card with response activated
     he may not be able to see child cards after closing the usercard form

     REASONS :

     The card template in the preview  may redefine listener set via opfab.currentCard.listenToChildCards
     This will override listener form the card on the feed
     As a consequence, the card on the feed will never receive new (or updated) child cards

     Furthermore, having the same template open twice in the application may cause unwanted behavior as
     we could have duplicated element html ids in the html document.
*/
        if (this.currentMenuId === 'feed') NavigationService.navigateTo('/feed');

        const options: NgbModalOptions = {
            size: 'usercard',
            backdrop: 'static'
        };
        this.modalService.open(this.userCardTemplate, options);
    }

    public goToCoreMenu(menuId: string) {
        NavigationService.navigateTo(menuId);
    }

    public clickOnMenu(menu: NavbarMenuElement, openInNewTab: boolean = false, event?: any): void {
        if (event) event.currentTarget.blur();
        switch (menu.id) {
            case 'about':
                this.modalService.open(this.aboutTemplate, {centered: true});
                break;
            case 'logout':
                this.logoutInProgress = true;
                SessionManagerService.logout();
                break;
            default:
                this.navbarMenuView.onMenuClick(menu, openInNewTab);
        }
    }

    public getImage(): SafeUrl {
        return this.domSanitizationService.bypassSecurityTrustUrl(this.navbarPage.logo.base64Image); //NOSONAR
        // No security issue here as the image is provided by a configuration file
    }

    isSubMenuActive(menuElement: NavbarMenuElement): boolean {
        return menuElement.dropdownMenu.some((dropdownMenuElement) => dropdownMenuElement.id === this.currentMenuId);
    }
}
