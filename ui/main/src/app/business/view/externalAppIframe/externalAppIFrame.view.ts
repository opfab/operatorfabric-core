/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ConfigService} from 'app/business/services/config.service';
import {GlobalStyleService} from 'app/business/services/global-style.service';
import {RouterStore} from 'app/business/store/router.store';
import {Observable, ReplaySubject, skip, Subject, takeUntil} from 'rxjs';

export class ExternalAppIFrameView {
    urlSubject: Subject<string> = new ReplaySubject<string>(1);
    unsubscribe$: Subject<void> = new Subject<void>();

    constructor(
        private configService: ConfigService,
        private routerStore: RouterStore,
        private globalStyleService: GlobalStyleService
    ) {
        this.listenForExternalAppRoute();
        this.reloadIframeWhenGlobalStyleChange();
    }

    private listenForExternalAppRoute() {
        this.routerStore
            .getCurrentRouteEvent()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((route) => {
                if (route.startsWith('/businessconfigparty')) {
                    this.computeURL(route);
                }
            });
    }

    private computeURL(route: string) {
        // WARNING : HACK
        //
        // When user makes a reload (for example via F5) or use a bookmark link, the browser encodes what is after #
        // if user makes a second reload, the browser encodes again the encoded link
        // and after if user reload again, this time it is not encoded anymore by the browser
        // So it ends up with 3 possible links: a none encoded link, an encoded link or a twice encoding link
        // and we have no way to know which one it is when processing the url
        //
        // To solve the problem we encode two times the url before giving it to the browser
        // so we always have a unique case : a double encoded url
        // that is why we need a double decoding here

        const splitedRoute = decodeURIComponent(decodeURIComponent(route)).slice(1).split('/');
        const menuId = splitedRoute[1];
        const menuEntryId = splitedRoute[2].split('?')[0];
        const menuEntryParams = splitedRoute[2].split('?')[1];
        const deeplink = splitedRoute.slice(3).join('/');
        const deeplinkWithoutParams = deeplink?.split('?')[0];
        const deeplinkParams = deeplink?.split('?')[1];

        this.configService.queryMenuEntryURL(menuId, menuEntryId).subscribe((menuUrl) => {
            let url = menuUrl;
            if (deeplinkWithoutParams) url += deeplinkWithoutParams;
            url = this.addParamsToUrl(url, menuEntryParams);
            url = this.addParamsToUrl(url, deeplinkParams);
            url = this.addOpfabThemeParamToUrl(url);
            this.urlSubject.next(url);
        });
    }

    private addParamsToUrl(url, params) {
        let newUrl = url;
        if (params) {
            newUrl += url.includes('?') ? '&' : '?';
            newUrl += params;
        }
        return newUrl;
    }

    private addOpfabThemeParamToUrl(url: string): string {
        return this.addParamsToUrl(url, 'opfab_theme=' + this.globalStyleService.getStyle());
    }

    private reloadIframeWhenGlobalStyleChange() {
        this.globalStyleService
            .getStyleChange()
            .pipe(takeUntil(this.unsubscribe$), skip(1))
            .subscribe(() => this.computeURL(this.routerStore.getCurrentRoute()));
    }

    public getExternalAppUrl(): Observable<string> {
        return this.urlSubject.asObservable();
    }

    public destroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
