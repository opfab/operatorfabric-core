/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
import {ConfigService} from 'app/services/config/ConfigService';
import {NavbarMenu, NavbarMenuElement} from './navbarPage';
import {UsersService} from '@ofServices/users/UsersService';
import {PermissionEnum} from '@ofServices/groups/model/PermissionEnum';
import {RouterService} from 'app/business/services/router.service';
import {GlobalStyleService} from '@ofServices/style/global-style.service';
import {RouterStore} from 'app/business/store/router.store';
import {Subject, skip, takeUntil} from 'rxjs';
import {TranslationService} from '@ofServices/translation/TranslationService';

export class NavbarMenuView {
    private static readonly ADMIN_MENUS = ['admin', 'externaldevicesconfiguration'];
    private static readonly VISIBLE_RIGHT_MENUS_IN_COLLAPSED_MODE = [
        'settings',
        'feedconfiguration',
        'nightdaymode',
        'logout'
    ];
    private readonly navbarMenu: NavbarMenu;
    private readonly destroy$ = new Subject<void>();
    private menuChangeListener: Function;

    constructor() {
        this.navbarMenu = new NavbarMenu();
        this.computeUpperMenuElements();
        this.computeRightIconsVisibility();
        this.computeRightMenuElements();
        this.computeRightMenuCollapsedElements();
        this.reComputeTranslations();
    }

    private computeUpperMenuElements(): void {
        const upperMenuElements: NavbarMenuElement[] = [];
        ConfigService.getMenuConfig().navigationBar?.forEach((menuElementConfig: any) => {
            if (!this.isUserAllowedToSeeMenuElement(menuElementConfig)) return;
            const navbarMenuElement = this.getUpperMenuElement(menuElementConfig);
            if (navbarMenuElement) {
                upperMenuElements.push(navbarMenuElement);
            }
        });
        this.navbarMenu.upperMenuElements = upperMenuElements;
    }

    private isUserAllowedToSeeMenuElement(menuElementConfig: any): boolean {
        if (
            NavbarMenuView.ADMIN_MENUS.includes(menuElementConfig.opfabCoreMenuId) &&
            !UsersService.hasCurrentUserAnyPermission([PermissionEnum.ADMIN])
        )
            return false;
        if (
            menuElementConfig.opfabCoreMenuId === 'useractionlogs' &&
            !UsersService.hasCurrentUserAnyPermission([PermissionEnum.VIEW_USER_ACTION_LOGS, PermissionEnum.ADMIN])
        )
            return false;
        if (!menuElementConfig.showOnlyForGroups || menuElementConfig.showOnlyForGroups.length === 0) return true;

        const userGroups = UsersService.getCurrentUserWithPerimeters().userData?.groups;
        return userGroups?.some((group: string) => menuElementConfig.showOnlyForGroups.includes(group));
    }

    private getUpperMenuElement(menuElementConfig: any): NavbarMenuElement | null {
        const navbarMenuElement = new NavbarMenuElement();
        if (menuElementConfig.entries) {
            navbarMenuElement.id = menuElementConfig.id;
            navbarMenuElement.label = TranslationService.getTranslation(menuElementConfig.label);
            navbarMenuElement.dropdownMenu = this.getDropdownMenuElements(menuElementConfig.entries);
            if (navbarMenuElement.dropdownMenu.length !== 0) {
                if (
                    navbarMenuElement.dropdownMenu.length > 1 ||
                    ConfigService.getMenuConfig().showDropdownMenuEvenIfOnlyOneEntry
                ) {
                    return navbarMenuElement;
                } else {
                    return navbarMenuElement.dropdownMenu[0];
                }
            }
        } else {
            this.setMenuElementProperties(navbarMenuElement, menuElementConfig);
            return navbarMenuElement;
        }
        return null;
    }

    private getDropdownMenuElements(entries: any[]): NavbarMenuElement[] {
        return entries
            .filter((subMenuConfig) => {
                return this.isUserAllowedToSeeMenuElement(subMenuConfig);
            })
            .map((subMenuConfig: any) => {
                const navbarSubLink = new NavbarMenuElement();
                this.setMenuElementProperties(navbarSubLink, subMenuConfig);
                return navbarSubLink;
            });
    }

    private setMenuElementProperties(navbarMenuElement: NavbarMenuElement, menuElementConfig: any): void {
        navbarMenuElement.dropdownMenu = [];
        navbarMenuElement.id = menuElementConfig.opfabCoreMenuId || menuElementConfig.customMenuId;
        navbarMenuElement.isCoreMenu = !!menuElementConfig.opfabCoreMenuId;
        navbarMenuElement.label = this.getTranslation(menuElementConfig);
        navbarMenuElement.url = menuElementConfig.url;
        navbarMenuElement.linkType = menuElementConfig.linkType;
    }

    private getTranslation(menuElementConfig): string {
        if (menuElementConfig.opfabCoreMenuId === 'nightdaymode') {
            if (GlobalStyleService.getStyle() === GlobalStyleService.DAY)
                return TranslationService.getTranslation('menu.switchToNightMode');
            else return TranslationService.getTranslation('menu.switchToDayMode');
        }
        return TranslationService.getTranslation(
            menuElementConfig.opfabCoreMenuId ? 'menu.' + menuElementConfig.opfabCoreMenuId : menuElementConfig.label
        );
    }

    private computeRightIconsVisibility(): void {
        ConfigService.getMenuConfig().topRightIconMenus?.forEach((menuElementConfig: any) => {
            if (
                menuElementConfig?.opfabCoreMenuId &&
                menuElementConfig.visible &&
                this.isUserAllowedToSeeMenuElement(menuElementConfig)
            ) {
                if (menuElementConfig.opfabCoreMenuId === 'calendar') {
                    this.navbarMenu.isCalendarIconVisible = true;
                } else if (menuElementConfig.opfabCoreMenuId === 'usercard') {
                    this.navbarMenu.isCreateUserCardIconVisible = true;
                }
            }
        });
    }

    private computeRightMenuElements(): void {
        const rightMenuElements: NavbarMenuElement[] = [];
        ConfigService.getMenuConfig().topRightMenus?.forEach((menuElementConfig: any) => {
            if (!this.isUserAllowedToSeeMenuElement(menuElementConfig)) return;
            if (!menuElementConfig.visible) return;
            const navbarMenuElement = new NavbarMenuElement();
            this.setMenuElementProperties(navbarMenuElement, menuElementConfig);
            rightMenuElements.push(navbarMenuElement);
        });
        this.navbarMenu.rightMenuElements = rightMenuElements;
    }

    private computeRightMenuCollapsedElements(): void {
        this.navbarMenu.rightMenuCollapsedElements = this.navbarMenu.rightMenuElements.filter((menuElement) =>
            NavbarMenuView.VISIBLE_RIGHT_MENUS_IN_COLLAPSED_MODE.includes(menuElement.id)
        );
    }

    public setCurrentSelectedMenuEntryListener(func: Function): void {
        RouterStore.getCurrentRouteEvent()
            .pipe(takeUntil(this.destroy$))
            .subscribe((route) => {
                const currentRouteWithoutParams = route.split('?')[0];
                if (currentRouteWithoutParams.split('/')[1] === 'businessconfigparty')
                    func(currentRouteWithoutParams.split('/')[2]);
                else if (currentRouteWithoutParams === '/') func('feed');
                else func(currentRouteWithoutParams.split('/')[1]);
            });
    }

    private reComputeTranslations(): void {
        ConfigService.getConfigValueAsObservable('settings.locale')
            .pipe(takeUntil(this.destroy$), skip(1))
            .subscribe(() => {
                this.computeUpperMenuElements();
                this.computeRightMenuElements();
                this.computeRightMenuCollapsedElements();
                if (this.menuChangeListener) this.menuChangeListener();
            });
    }

    public setMenuChangeListener(menuChangeListener): void {
        this.menuChangeListener = menuChangeListener;
    }

    public getNavbarMenu(): NavbarMenu {
        return this.navbarMenu;
    }

    public onMenuClick(navbarMenuElement: NavbarMenuElement, isClickOnNewTabIcon = false): void {
        if (navbarMenuElement.isCoreMenu) {
            if (navbarMenuElement.id === 'nightdaymode') {
                if (GlobalStyleService.getStyle() === GlobalStyleService.DAY) {
                    GlobalStyleService.switchToNightMode();
                } else {
                    GlobalStyleService.switchToDayMode();
                }
                this.changeTitleForNightDayModeMenu();
            } else RouterService.navigateTo(navbarMenuElement.id);
        } else if (navbarMenuElement.linkType === 'TAB' || isClickOnNewTabIcon) {
            const openedWindow = window.open(this.addOpfabThemeParamToUrl(navbarMenuElement.url), '_blank');
            openedWindow.opener = null;
        } else
            RouterService.navigateTo(
                'businessconfigparty/' + encodeURIComponent(encodeURIComponent(navbarMenuElement.id)) + '/'
            );
    }

    private changeTitleForNightDayModeMenu() {
        this.navbarMenu.rightMenuElements
            .filter((menu) => menu.id === 'nightdaymode')
            .forEach((menu) => {
                if (GlobalStyleService.getStyle() === GlobalStyleService.DAY) {
                    menu.label = TranslationService.getTranslation('menu.switchToNightMode');
                } else {
                    menu.label = TranslationService.getTranslation('menu.switchToDayMode');
                }
            });
    }

    private addOpfabThemeParamToUrl(url: string): string {
        return this.addParamsToUrl(url, 'opfab_theme=' + GlobalStyleService.getStyle());
    }

    private addParamsToUrl(url: string, params: string): string {
        let newUrl = url;
        if (params) {
            newUrl += url.includes('?') ? '&' : '?';
            newUrl += params;
        }
        return newUrl;
    }

    public destroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
