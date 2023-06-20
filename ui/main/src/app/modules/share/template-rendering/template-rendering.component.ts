/* Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
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
import {HandlebarsService} from '../../../business/services/card/handlebars.service';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {State} from '@ofModel/processes.model';
import {DetailContext} from '@ofModel/detail-context.model';
import {UserContext} from '@ofModel/user-context.model';
import {map, skip, takeUntil} from 'rxjs/operators';
import {Observable, Subject, zip} from 'rxjs';
import {User} from '@ofModel/user.model';
import {OpfabLoggerService} from 'app/business/services/logs/opfab-logger.service';
import {DisplayContext} from '@ofModel/template.model';
import {TemplateCssService} from 'app/business/services/card/template-css.service';
import {GlobalStyleService} from 'app/business/services/global-style.service';
import {CurrentUserStore} from 'app/business/store/current-user.store';
import {UserService} from 'app/business/services/users/user.service';
import {OpfabAPIService} from 'app/business/services/opfabAPI.service';


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
        private currentUserStore: CurrentUserStore,
        private templateCssService: TemplateCssService,
        private globalStyleService: GlobalStyleService,
        private userService: UserService,
        private opfabAPIService: OpfabAPIService,
        private logger: OpfabLoggerService
    ) {}

    public ngOnInit() {
        this.informTemplateWhenGlobalStyleChange();
    }

    // For certain types of template , we need to inform it to take into account
    // the new css style (for example with chart done with chart.js)
    private informTemplateWhenGlobalStyleChange() {
        this.globalStyleService
            .getStyleChange()
            .pipe(takeUntil(this.unsubscribeToGlobalStyle$), skip(1))
            .subscribe(() => this.opfabAPIService.templateInterface.setStyleChange());
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.screenSize && this.templateLoaded) this.opfabAPIService.templateInterface.setScreenSize(this.screenSize);
        else this.render();
    }

    private render() {
        this.isLoadingSpinnerToDisplay = false;
        this.opfabAPIService.initTemplateInterface();
        this.enableSpinnerForTemplate();
        this.getUserContextAndRenderTemplate();
    }

    private enableSpinnerForTemplate() {
        const that = this;
        this.opfabAPIService.currentCard.displayLoadingSpinner = function () {
            that.isLoadingSpinnerToDisplay = true;
        };
        this.opfabAPIService.currentCard.hideLoadingSpinner= function () {
            that.isLoadingSpinnerToDisplay = false;
        };
    }

    private getUserContextAndRenderTemplate() {
        if (!this.userContext) {
            const user = this.userService.getCurrentUserWithPerimeters().userData;
            const token = this.currentUserStore.getToken();
            this.userContext = new UserContext(
                user.login,
                token,
                user.firstName,
                user.lastName,
                this.user.groups,
                this.user.entities
            );
        }
        this.computeAndRenderTemplate();
    }

    private computeAndRenderTemplate() {
        if (this.cardState.templateName) {
            this.isLoadingSpinnerToDisplay = true;
            if (this.functionToCallBeforeRendering) this.functionToCallBeforeRendering.call(this.parentComponent);
            this.opfabAPIService.currentCard.displayContext = this.displayContext;

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

    private callTemplateJsPostRenderingFunctions() {
        if (this.functionToCallAfterRendering) this.functionToCallAfterRendering.call(this.parentComponent);
        this.opfabAPIService.templateInterface.setScreenSize(this.screenSize);
        this.opfabAPIService.currentCard.applyChildCards();
        setTimeout(() => this.opfabAPIService.templateInterface.setTemplateRenderingComplete(), 10);
    }

    public ngAfterViewChecked() {
        this.computeRenderingHeight();
    }

    private computeRenderingHeight() {
        const htmlElementForCardRendering = document.getElementById('opfab-div-card-template');
        if (htmlElementForCardRendering) {
            const renderingRect = htmlElementForCardRendering.getBoundingClientRect();
            let renderingHeight = window.innerHeight - renderingRect.top - this.fixedBottomOffset;

            if (this.cardFooterHtmlElementId) {
                const cardFooterElement = document.getElementById(this.cardFooterHtmlElementId);
                if (cardFooterElement) {
                    renderingHeight -= cardFooterElement.scrollHeight;
                }
            }
            htmlElementForCardRendering.style.height = `${renderingHeight}px`;
        }
    }

    ngOnDestroy() {
        this.opfabAPIService.initTemplateInterface();
        this.unsubscribeToGlobalStyle$.next();
        this.unsubscribeToGlobalStyle$.complete();
    }
}
