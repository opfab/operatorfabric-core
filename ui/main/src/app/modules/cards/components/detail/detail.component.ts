/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



import {Component, ElementRef, Input, OnChanges, Output, EventEmitter} from '@angular/core';
import {Card, Detail} from '@ofModel/card.model';
import {ProcessesService} from '@ofServices/processes.service';
import {HandlebarsService} from '../../services/handlebars.service';
import {DomSanitizer, SafeHtml, SafeResourceUrl} from '@angular/platform-browser';
import {Process, Response} from '@ofModel/processes.model';
import {DetailContext} from '@ofModel/detail-context.model';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {selectAuthenticationState} from '@ofSelectors/authentication.selectors';
import {selectGlobalStyleState} from '@ofSelectors/global-style.selectors';
import {UserContext} from '@ofModel/user-context.model';
import {TranslateService} from '@ngx-translate/core';
import {Subject} from 'rxjs';
import { switchMap,skip,takeUntil } from 'rxjs/operators';

@Component({
    selector: 'of-detail',
    templateUrl: './detail.component.html',
})
export class DetailComponent implements OnChanges {

    @Output() responseData = new EventEmitter<Response>();

    public active = false;
    @Input() detail: Detail;
    @Input() card: Card;
    currentCard: Card;
    readonly hrefsOfCssLink = new Array<SafeResourceUrl>();
    private _htmlContent: SafeHtml;
    private userContext: UserContext;
    unsubscribe$: Subject<void> = new Subject<void>();

    constructor(private element: ElementRef,
                private processesService: ProcessesService,
                private handlebars: HandlebarsService,
                private sanitizer: DomSanitizer,
                private store: Store<AppState>,
                private translate: TranslateService ) {

        this.store.select(selectAuthenticationState).subscribe(authState => {
            this.userContext = new UserContext(
                authState.identifier,
                authState.token,
                authState.firstName,
                authState.lastName
            );
        }); 
        this.reloadTemplateWhenGlobalStyleChange();


    }

    // for certains type of template , we need to reload it to take into account
    // the new css style (for example with chart done with chart.js)
    private reloadTemplateWhenGlobalStyleChange()
    {
        this.store.select(selectGlobalStyleState)
        .pipe(takeUntil(this.unsubscribe$),skip(1))
        .subscribe(style => this.initializeHandlebarsTemplates());
    }

    ngOnChanges(): void {
        this.initializeHrefsOfCssLink();
        this.initializeHandlebarsTemplates();

    }

    private initializeHrefsOfCssLink() {
        if (this.detail && this.detail.styles) {
            const process = this.card.process;
            const processVersion = this.card.processVersion;
            this.detail.styles.forEach(style => {
                const cssUrl = this.processesService.computeThirdCssUrl(process, style, processVersion);
                // needed to instantiate href of link for css in component rendering
                const safeCssUrl = this.sanitizer.bypassSecurityTrustResourceUrl(cssUrl);
                this.hrefsOfCssLink.push(safeCssUrl);
            });
        }
    }

    private initializeHandlebarsTemplates() {
        let responseData: Response;

        this.processesService.queryProcessFromCard(this.card).pipe(
            switchMap(process => {
                responseData = process.states[this.card.state].response;
                this.responseData.emit(responseData);
                return this.handlebars.executeTemplate(this.detail.templateName, new DetailContext(this.card, this.userContext, responseData));
            })
        )
            .subscribe(
                html => {
                    this._htmlContent = this.sanitizer.bypassSecurityTrustHtml(html);
                    setTimeout(() => { // wait for DOM rendering
                        this.reinsertScripts();
                    },10);
                }
            );
    }

    get htmlContent() {
        return this._htmlContent;
    }

    reinsertScripts(): void {
        const scripts = <HTMLScriptElement[]>this.element.nativeElement.getElementsByTagName('script');
        const scriptsInitialLength = scripts.length;
        for (let i = 0; i < scriptsInitialLength; i++) {
            const script = scripts[i];
            const scriptCopy = document.createElement('script');
            scriptCopy.type = script.type ? script.type : 'text/javascript';
            if (script.innerHTML) {
                scriptCopy.innerHTML = script.innerHTML;
            }
            scriptCopy.async = false;
            script.parentNode.replaceChild(scriptCopy, script);
        }
    }

    ngOnDestroy(){
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
      }
}
