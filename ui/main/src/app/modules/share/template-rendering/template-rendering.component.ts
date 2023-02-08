/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {
    AfterViewChecked,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
    ViewEncapsulation
} from '@angular/core';
import {Card} from '@ofModel/card.model';
import {HandlebarsService} from '../../card/services/handlebars.service';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {State} from '@ofModel/processes.model';
import {DetailContext} from '@ofModel/detail-context.model';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {selectAuthenticationState} from '@ofSelectors/authentication.selectors';
import {selectGlobalStyleState} from '@ofSelectors/global-style.selectors';
import {UserContext} from '@ofModel/user-context.model';
import {map, skip, takeUntil} from 'rxjs/operators';
import {Observable, Subject, zip} from 'rxjs';
import {User} from '@ofModel/user.model';
import {OpfabLoggerService} from 'app/business/services/logs/opfab-logger.service';
import {DisplayContext} from '@ofModel/templateGateway.model';
import {TemplateCssService} from 'app/business/services/template-css.service';

declare const templateGateway: any;

@Component({
    selector: 'of-template-rendering',
    templateUrl: './template-rendering.component.html',
    styleUrls: ['./template-rendering.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class TemplateRenderingComponent implements OnChanges, OnInit, OnDestroy, AfterViewChecked {
    @Input() cardState: State;
    @Input() card: Card;
    @Input() user: User;
    @Input() fixedBottomOffset = 0;
    @Input() cardFooterHtmlElementId: string;
    @Input() screenSize = 'md';
    @Input() functionToCallBeforeRendering: Function;
    @Input() functionToCallAfterRendering: Function;
    @Input() parentComponent: Component;
    @Input() displayContext: DisplayContext;

    @Output() renderingDone = new EventEmitter();

    public htmlTemplateContent: SafeHtml;
    public isLoadingSpinnerToDisplay = false;

    private userContext: UserContext;
    private unsubscribeToGlobalStyle$: Subject<void> = new Subject<void>();
    private templateLoaded: boolean;

    constructor(
        private element: ElementRef,
        private handlebars: HandlebarsService,
        private sanitizer: DomSanitizer,
        private store: Store<AppState>,
        private templateCssService: TemplateCssService,
        private logger: OpfabLoggerService
    ) {}

    public ngOnInit() {
        this.informTemplateWhenGlobalStyleChange();
    }

    // For certain types of template , we need to inform it to take into account
    // the new css style (for example with chart done with chart.js)
    private informTemplateWhenGlobalStyleChange() {
        this.store
            .select(selectGlobalStyleState)
            .pipe(takeUntil(this.unsubscribeToGlobalStyle$), skip(1))
            .subscribe(() => templateGateway.onStyleChange());
    }

    ngOnChanges(changes: SimpleChanges) {
        if (!!changes.screenSize && this.templateLoaded) templateGateway.setScreenSize(this.screenSize);
        else this.render();
    }

    private render() {
        this.isLoadingSpinnerToDisplay = false;
        templateGateway.initTemplateGateway();
        this.enableSpinnerForTemplate();
        this.getUserContextAndRenderTemplate();
    }

    private enableSpinnerForTemplate() {
        const that = this;
        templateGateway.displayLoadingSpinner = function () {
            that.isLoadingSpinnerToDisplay = true;
        };
        templateGateway.hideLoadingSpinner = function () {
            that.isLoadingSpinnerToDisplay = false;
        };
    }

    private getUserContextAndRenderTemplate() {
        if (!this.userContext) {
            this.store.select(selectAuthenticationState).subscribe((authState) => {
                this.userContext = new UserContext(
                    authState.identifier,
                    authState.token,
                    authState.firstName,
                    authState.lastName,
                    this.user.groups,
                    this.user.entities
                );
                this.computeAndRenderTemplate();
            });
        } else {
            this.computeAndRenderTemplate();
        }
    }

    private computeAndRenderTemplate() {
        if (!!this.cardState.templateName) {
            this.isLoadingSpinnerToDisplay = true;
            if (this.functionToCallBeforeRendering) this.functionToCallBeforeRendering.call(this.parentComponent);
            templateGateway.displayContext = this.displayContext;

            this.getHTMLFromTemplate().subscribe({
                next: (html) => {
                    this.htmlTemplateContent = html;
                    setTimeout(() => {
                        // wait for DOM rendering
                        this.isLoadingSpinnerToDisplay = false;
                        this.loadTemplateJSScripts();
                        setTimeout(() => {
                            // Wait for template script execution
                            this.callTemplateJsPostRenderingFunctions();
                            this.templateLoaded = true;
                        }, 10);
                    }, 10);
                },
                error: (error) => {
                    this.logger.error(
                        `ERROR impossible to process template  ${this.cardState.templateName} : ${error} `
                    );
                    this.htmlTemplateContent = this.sanitizer.bypassSecurityTrustHtml('');
                    this.isLoadingSpinnerToDisplay = false;
                }
            });
        } else {
            this.htmlTemplateContent = ' TECHNICAL ERROR - NO TEMPLATE AVAILABLE';
            this.logger.error(
                `ERROR No template for process ${this.card.process} version ${this.card.processVersion} with state ${this.card.state}`
            );
        }
    }

    private getHTMLFromTemplate(): Observable<SafeHtml> {
        const htmlContent$ = this.handlebars.executeTemplate(
            this.cardState.templateName,
            new DetailContext(this.card, this.userContext, this.cardState.response)
        );
        const cssContent$ = this.getCssFilesContent();
        const html = zip(htmlContent$, cssContent$)
            .pipe(map(([html, css]) => `${html} <style> ${css} </style>`))
            .pipe(map((html) => this.sanitizer.bypassSecurityTrustHtml(html)));
        return html;
    }

    private getCssFilesContent(): Observable<string> {
        const styles = this.cardState.styles;
        return this.templateCssService.getCssFilesContent(this.card.process, this.card.processVersion, styles);
    }

    private loadTemplateJSScripts(): void {
        const scripts = <HTMLScriptElement[]> this.element.nativeElement.getElementsByTagName('script');
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

    private callTemplateJsPostRenderingFunctions() {
        if (this.functionToCallAfterRendering) this.functionToCallAfterRendering.call(this.parentComponent);
        templateGateway.setScreenSize(this.screenSize);
        templateGateway.applyChildCards();
        setTimeout(() => templateGateway.onTemplateRenderingComplete(), 10);
    }

    public ngAfterViewChecked() {
        this.computeRenderingHeight();
    }

    private computeRenderingHeight() {
        const htmlElementForCardRendering = document.getElementById('opfab-div-card-template');
        if (!!htmlElementForCardRendering) {
            const renderingRect = htmlElementForCardRendering.getBoundingClientRect();
            let renderingHeight = window.innerHeight - renderingRect.top - this.fixedBottomOffset;

            if (!!this.cardFooterHtmlElementId) {
                const cardFooterElement = document.getElementById(this.cardFooterHtmlElementId);
                if (cardFooterElement) {
                    renderingHeight -= cardFooterElement.scrollHeight;
                }
            }
            htmlElementForCardRendering.style.height = `${renderingHeight}px`;
        }
    }

    ngOnDestroy() {
        templateGateway.initTemplateGateway();
        this.unsubscribeToGlobalStyle$.next();
        this.unsubscribeToGlobalStyle$.complete();
    }
}
