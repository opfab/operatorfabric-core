/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {NgbModal, NgbModalOptions, NgbPopover} from '@ng-bootstrap/ng-bootstrap';
import {SessionManagerService} from 'app/business/services/session-manager.service';
import {NavbarView} from 'app/business/view/navbar/navbar.view';
import {NavbarMenuElement, NavbarPage} from 'app/business/view/navbar/navbarPage';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {TranslationService} from 'app/business/services/translation/translation.service';
import {NavbarMenuView} from 'app/business/view/navbar/navbarMenu.view';

@Component({
    selector: 'of-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {
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

    constructor(
        private router: Router,
        private modalService: NgbModal,
        private domSanitizationService: DomSanitizer,
        private translationService: TranslationService,
        private changeDetector: ChangeDetectorRef
    ) {
        this.navbarPage = new NavbarView().getNavbarPage();
        this.navbarMenuView = new NavbarMenuView(this.translationService);
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
        if (this.currentMenuId === 'feed') this.router.navigate(['/feed']);

        const options: NgbModalOptions = {
            size: 'usercard',
            backdrop: 'static'
        };
        this.modalService.open(this.userCardTemplate, options);
    }

    public clickOnMenu(menu: NavbarMenuElement, openInNewTab: boolean = false): void {
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
}
