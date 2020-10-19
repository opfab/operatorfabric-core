/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {Component, ElementRef, Input, OnDestroy, OnInit} from '@angular/core';
import {Card, Detail} from '@ofModel/card.model';
import {ProcessesService} from '@ofServices/processes.service';
import {HandlebarsService} from '../../../cards/services/handlebars.service';
import {DomSanitizer, SafeHtml, SafeResourceUrl} from '@angular/platform-browser';
import {DetailContext} from '@ofModel/detail-context.model';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {selectAuthenticationState} from '@ofSelectors/authentication.selectors';
import {selectGlobalStyleState} from '@ofSelectors/global-style.selectors';
import {UserContext} from '@ofModel/user-context.model';
import {skip, switchMap, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';


@Component({
    selector: 'of-card-preview',
    templateUrl: './card-preview.component.html'
})
export class CardPreviewComponent implements OnInit, OnDestroy {

    @Input() card: Card;
    @Input() currentPath: string;

    public active = false;
    unsubscribe$: Subject<void> = new Subject<void>();
    readonly hrefsOfCssLink = new Array<SafeResourceUrl>();
    private _htmlContent: SafeHtml;
    private _userContext: UserContext;
    private detail: Detail;


    constructor(private element: ElementRef, private businessconfigService: ProcessesService,
                private handlebars: HandlebarsService, private sanitizer: DomSanitizer,
                private store: Store<AppState>) {

        this.store.select(selectAuthenticationState).subscribe(authState => {
            this._userContext = new UserContext(
                authState.identifier,
                authState.token,
                authState.firstName,
                authState.lastName
            );
        });
        this.reloadTemplateWhenGlobalStyleChange();
    }

    ngOnInit() {
        this.getTemplateAndStyle();

    }

    private getTemplateAndStyle() {
        this.businessconfigService.queryProcess(this.card.process, this.card.processVersion)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(businessconfig => {
                    if (!!businessconfig) {
                        const state = businessconfig.extractState(this.card);
                        if (!!state) {
                            // Take the first detail, new card preview only compatible with one detail per card
                            this.detail = state.details[0];
                        }
                        this.initializeHrefsOfCssLink();
                        this.initializeHandlebarsTemplates();
                    }
                },
                error => console.log(`something went wrong while trying to fetch process for ${this.card.process}`
                    + ` with ${this.card.processVersion} version.`)
            );
    }

    // for certain types of template, we need to reload it to take into account
    // the new css style (for example with chart done with chart.js)
    private reloadTemplateWhenGlobalStyleChange() {
        this.store.select(selectGlobalStyleState)
            .pipe(takeUntil(this.unsubscribe$), skip(1))
            .subscribe(style => this.initializeHandlebarsTemplates());
    }

    private initializeHrefsOfCssLink() {
        if (!!this.detail && !!this.detail.styles) {
            const process = this.card.process;
            const processVersion = this.card.processVersion;
            this.detail.styles.forEach(style => {
                const cssUrl = this.businessconfigService.computeBusinessconfigCssUrl(process, style, processVersion);
                // needed to instantiate href of link for css in component rendering
                const safeCssUrl = this.sanitizer.bypassSecurityTrustResourceUrl(cssUrl);
                this.hrefsOfCssLink.push(safeCssUrl);
            });
        }
    }

    private initializeHandlebarsTemplates() {

        this.businessconfigService.queryProcessFromCard(this.card).pipe(
            takeUntil(this.unsubscribe$),
            switchMap(process => {
                return this.handlebars.executeTemplate(this.detail.templateName,
                    new DetailContext(this.card, this._userContext, null));
            })
        )
            .subscribe(
                html => {
                    this._htmlContent = this.sanitizer.bypassSecurityTrustHtml(html);
                    setTimeout(() => { // wait for DOM rendering
                        this.reinsertScripts();
                    }, 10);
                }, () =>  {
                    console.log('WARNING impossible to load template ', this.detail.templateName);
                    this._htmlContent = this.sanitizer.bypassSecurityTrustHtml('');
                }
            );
    }

    get htmlContent() {
        return this._htmlContent;
    }

    reinsertScripts(): void {
        const scripts = <HTMLScriptElement[]>this.element.nativeElement.getElementsByTagName('script');
        Array.prototype.forEach.call(scripts, script => { // scripts.foreach does not work...
            const scriptCopy = document.createElement('script');
            scriptCopy.type = !!script.type ? script.type : 'text/javascript';
            if (!!script.innerHTML) scriptCopy.innerHTML = script.innerHTML;
            scriptCopy.async = false;
            script.parentNode.replaceChild(scriptCopy, script);
        });
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
