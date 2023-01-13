/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {ActivatedRoute, Router} from '@angular/router';
import {map, skip, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {selectGlobalStyleState} from '@ofSelectors/global-style.selectors';
import {GlobalStyleService} from '@ofServices/global-style.service';
import {ConfigService} from 'app/business/config/config.service';
import {DOCUMENT} from '@angular/common';

@Component({
    selector: 'of-iframedisplay',
    templateUrl: './iframedisplay.component.html',
    styleUrls: ['./iframedisplay.component.scss']
})
export class IframeDisplayComponent implements OnInit, OnDestroy {
    public iframeURL: SafeUrl;
    unsubscribe$: Subject<void> = new Subject<void>();
    private menu_id;
    private menu_entry_id;

    constructor(
        private sanitizer: DomSanitizer,
        private route: ActivatedRoute,
        private businessconfigService: ConfigService,
        private store: Store<AppState>,
        private globalStyleService: GlobalStyleService,
        private router: Router,
        @Inject(DOCUMENT) private document: Document
    ) {}

    ngOnInit() {
        this.loadIframe();
        this.reloadIframeWhenGlobalStyleChange();
    }

    private loadIframe() {
        this.route.paramMap.subscribe((paramMap) => {
            this.menu_id = paramMap.get('menu_id');
            this.menu_entry_id = paramMap.get('menu_entry_id');
            this.businessconfigService
                .queryMenuEntryURL(this.menu_id, this.menu_entry_id)
                .pipe(
                    map((url) => this.addRoutingToUrl(url)),
                    map((url) => this.addOpfabThemeParamToUrl(url)),
                    map((url) => this.addParamToUrl(url)),
                    map((url) => this.sanitizer.bypassSecurityTrustResourceUrl(url)),
                    takeUntil(this.unsubscribe$)
                )
                .subscribe({
                    next: (url) => (this.iframeURL = url),
                    error: (err) => {
                        console.log('Error in business application redirection = ', err);
                        this.router.navigate(['/feed']);
                    }
                });
        });
    }

    private addRoutingToUrl(url: string): string {
        // Capture everything between the last part of the menu and the first occurrence of question mark. (to avoid messing with parameters).
        // example: /menu1/entry1/deeplink?someParam=param turns into "/deeplink"
        const additionalRouting = this.router.url.match(`.*${this.menu_id}\/${this.menu_entry_id}(\/[^?]*)`);
        return url + (additionalRouting ? additionalRouting[1] : '');
    }

    private addOpfabThemeParamToUrl(url: string): string {
        this.globalStyleService.getStyle();
        url += url.includes('?') ? '&' : '?';
        url += 'opfab_theme=';
        url += this.globalStyleService.getStyle();
        return url;
    }

    // If a business application is called form a card, it can be called with parameters
    // To do that, in the card the window.location is set with the url #/businessconfig/menu_id/menuItem_id
    // then is is possible to add params to the url
    // For example: #/businessconfig/menu_id/menuItem_id?myparam=param1&myotherparam=param2
    //
    // The user will be redirected to the url configured + the parameters

    private addParamToUrl(url) {
        const params = this.document.location.href.split('?');
        if (!!params[1]) return url + '&' + params[1];
        return url;
    }

    private reloadIframeWhenGlobalStyleChange() {
        this.store
            .select(selectGlobalStyleState)
            .pipe(takeUntil(this.unsubscribe$), skip(1))
            .subscribe(() => this.loadIframe());
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
