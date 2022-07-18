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
    ViewEncapsulation
} from '@angular/core';
import {Card} from '@ofModel/card.model';
import {ProcessesService} from '@ofServices/processes.service';
import {HandlebarsService} from '../../cards/services/handlebars.service';
import {DomSanitizer, SafeHtml, SafeResourceUrl} from '@angular/platform-browser';
import {State} from '@ofModel/processes.model';
import {DetailContext} from '@ofModel/detail-context.model';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {selectAuthenticationState} from '@ofSelectors/authentication.selectors';
import {selectGlobalStyleState} from '@ofSelectors/global-style.selectors';
import {UserContext} from '@ofModel/user-context.model';
import {skip, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {User} from '@ofModel/user.model';
import {OpfabLoggerService} from '@ofServices/logs/opfab-logger.service';
import {DisplayContext} from '@ofModel/templateGateway.model';

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
    @Input() screenSize ='md';
    @Input() functionToCallBeforeRendering : Function;
    @Input() functionToCallAfterRendering : Function;
    @Input() parentComponent : Component;
    @Input() displayContext: DisplayContext;

    @Output() renderingDone = new EventEmitter();

    public hrefsOfCssLink = new Array<SafeResourceUrl>();
    public htmlTemplateContent: SafeHtml;
    public isLoadingSpinnerToDisplay = false;

    private userContext: UserContext;
    private unsubscribeToGlobalStyle$: Subject<void> = new Subject<void>();

    constructor(
        private element: ElementRef,
        private businessconfigService: ProcessesService,
        private handlebars: HandlebarsService,
        private sanitizer: DomSanitizer,
        private store: Store<AppState>,
        private logger: OpfabLoggerService
    ) {}

    public ngOnInit() {
        this.reloadTemplateWhenGlobalStyleChange();
    }

    // For certain types of template , we need to reload it to take into account
    // the new css style (for example with chart done with chart.js)
    private reloadTemplateWhenGlobalStyleChange() {
        this.store
            .select(selectGlobalStyleState)
            .pipe(takeUntil(this.unsubscribeToGlobalStyle$), skip(1))
            .subscribe(() => this.getUserContextAndRenderTemplate());
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
        const templateName = this.cardState.templateName;
        this.isLoadingSpinnerToDisplay = true;
        if (!!templateName) {
            if (this.functionToCallBeforeRendering) this.functionToCallBeforeRendering.call(this.parentComponent);
            templateGateway.displayContext = this.displayContext;
            this.handlebars
                .executeTemplate(templateName, new DetailContext(this.card, this.userContext, this.cardState.response))
                .subscribe({
                    next: (html) => {
                        this.htmlTemplateContent = this.sanitizer.bypassSecurityTrustHtml(html);
                        setTimeout(() => {
                            // wait for DOM rendering
                            this.isLoadingSpinnerToDisplay = false;
                            this.reinsertScripts();
                            setTimeout(() => {
                                // Wait for template script execution
                                if (this.functionToCallAfterRendering) this.functionToCallAfterRendering.call(this.parentComponent);
                                templateGateway.setScreenSize(this.screenSize);
                                templateGateway.applyChildCards();
                                setTimeout(() => templateGateway.onTemplateRenderingComplete(), 10);

                            }, 10);
                        }, 10);
                    },
                    error: (error) => {
                        this.logger.error(`ERROR impossible to process template  ${templateName} : ${error} `);
                        this.htmlTemplateContent = this.sanitizer.bypassSecurityTrustHtml('');
                        this.isLoadingSpinnerToDisplay = false;
                    }
                });
        } else {
            this.htmlTemplateContent = ' TECHNICAL ERROR - NO TEMPLATE AVAILABLE';
            this.isLoadingSpinnerToDisplay = false;
            this.logger.error(
                `ERROR No template for process ${this.card.process} version ${this.card.processVersion} with state ${this.card.state}`
            );
        }
    }

    private reinsertScripts(): void {
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

    ngOnChanges(): void {
        this.render();
    }

    private render() {
        this.isLoadingSpinnerToDisplay = false;
        templateGateway.initTemplateGateway();
        this.enableSpinnerForTemplate();
        this.loadTemplateCssFiles();
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

    private loadTemplateCssFiles() {
        const styles = this.cardState.styles;
        this.hrefsOfCssLink = new Array<SafeResourceUrl>();
        if (!!styles) {
            const process = this.card.process;
            const processVersion = this.card.processVersion;
            styles.forEach((style) => {
                const cssUrl = this.businessconfigService.computeBusinessconfigCssUrl(process, style, processVersion);
                const safeCssUrl = this.sanitizer.bypassSecurityTrustResourceUrl(cssUrl);
                this.hrefsOfCssLink.push(safeCssUrl);
            });
        }
    }

    ngOnDestroy() {
        templateGateway.initTemplateGateway();
        this.unsubscribeToGlobalStyle$.next();
        this.unsubscribeToGlobalStyle$.complete();
    }
}
