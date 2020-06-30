/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



import {Component, ElementRef, Input, OnChanges, Output, EventEmitter, OnInit, OnDestroy} from '@angular/core';
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
import { switchMap, skip, map, takeUntil } from 'rxjs/operators';
import { selectLastCards } from '@ofStore/selectors/feed.selectors';
import { CardService } from '@ofServices/card.service';
import { Observable, zip, Subject } from 'rxjs';
import { LightCard } from '@ofModel/light-card.model';
import { AppService, PageType } from '@ofServices/app.service';

declare const ext_form: any;

@Component({
    selector: 'of-detail',
    templateUrl: './detail.component.html',
})
export class DetailComponent implements OnChanges, OnInit, OnDestroy {

    @Output() responseData = new EventEmitter<Response>();

    public active = false;
    @Input() detail: Detail;
    @Input() card: Card;
    @Input() childCards: Card[];
    currentCard: Card;
    unsubscribe$: Subject<void> = new Subject<void>();
    readonly hrefsOfCssLink = new Array<SafeResourceUrl>();
    private _htmlContent: SafeHtml;
    private userContext: UserContext;
    private lastCards$: Observable<LightCard[]>;

    ngOnInit() {

        if (this._appService.pageType == PageType.FEED) {

            this.lastCards$ = this.store.select(selectLastCards);

            this.lastCards$
                    .pipe(
                        takeUntil(this.unsubscribe$),
                        map(lastCards =>
                                lastCards.filter(card =>
                                    card.parentCardId == this.card.uid &&
                                    !this.childCards.map(childCard => childCard.uid).includes(card.uid))
                        ),
                        map(childCards => childCards.map(c => this.cardService.loadCard(c.id)))
                    )
                    .subscribe(childCardsObs => {
                        zip(...childCardsObs)
                            .pipe(map(cards => cards.map(cardData => cardData.card)))
                            .subscribe(newChildCards => {

                                const reducer = (accumulator, currentValue) => {
                                    accumulator[currentValue.id] = currentValue;
                                    return accumulator;
                                };

                                this.childCards = Object.values({
                                    ...this.childCards.reduce(reducer, {}),
                                    ...newChildCards.reduce(reducer, {}),
                                });

                                ext_form.childCards = this.childCards;
                                ext_form.applyChildCards();
                            })
                    })
        }
    }

    constructor(private element: ElementRef,
                private processesService: ProcessesService,
                private handlebars: HandlebarsService,
                private sanitizer: DomSanitizer,
                private store: Store<AppState>,
                private translate: TranslateService,
                private cardService: CardService,
                private _appService: AppService ) {

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
                return this.handlebars.executeTemplate(this.detail.templateName, new DetailContext(this.card, this.childCards, this.userContext, responseData));
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
