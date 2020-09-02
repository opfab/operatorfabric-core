/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {AfterViewChecked, Component, ElementRef, Input, OnChanges, OnDestroy, OnInit} from '@angular/core';
import {Card, Detail} from '@ofModel/card.model';
import {ProcessesService} from '@ofServices/processes.service';
import {HandlebarsService} from '../../services/handlebars.service';
import {DomSanitizer, SafeHtml, SafeResourceUrl} from '@angular/platform-browser';
import {Response} from '@ofModel/processes.model';
import {DetailContext} from '@ofModel/detail-context.model';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {selectAuthenticationState} from '@ofSelectors/authentication.selectors';
import {selectGlobalStyleState} from '@ofSelectors/global-style.selectors';
import {UserContext} from '@ofModel/user-context.model';
import {TranslateService} from '@ngx-translate/core';
import {map, skip, switchMap, take, takeUntil} from 'rxjs/operators';
import {fetchLightCard, selectLastCards} from '@ofStore/selectors/feed.selectors';
import {CardService} from '@ofServices/card.service';
import {Observable, Subject, zip} from 'rxjs';
import {LightCard, Severity} from '@ofModel/light-card.model';
import {AppService, PageType} from '@ofServices/app.service';
import {User} from '@ofModel/user.model';
import {Map} from '@ofModel/map';
import {RightsEnum, userRight, UserWithPerimeters} from '@ofModel/userWithPerimeters.model';
import {UpdateALightCard} from '@ofStore/actions/light-card.actions';

declare const templateGateway: any;

class Message {
    text: string;
    display: boolean;
    color: ResponseMsgColor;
}

class FormResult {
    valid: boolean;
    errorMsg: string;
    formData: any;
}

const enum ResponseI18nKeys {
    FORM_ERROR_MSG = 'response.error.form',
    SUBMIT_ERROR_MSG = 'response.error.submit',
    SUBMIT_SUCCESS_MSG = 'response.submitSuccess',
    BUTTON_TITLE = 'response.btnTitle'
}

const enum AckI18nKeys {
    BUTTON_TEXT_ACK = 'cardAcknowledgment.button.ack',
    BUTTON_TEXT_UNACK = 'cardAcknowledgment.button.unack',
    ERROR_MSG = 'response.error.ack'
}

const enum AckButtonColors {
    PRIMARY = 'btn-primary',
    DANGER = 'btn-danger'
}

const enum ResponseMsgColor {
    GREEN = 'alert-success',
    RED = 'alert-danger'
}

@Component({
    selector: 'of-detail',
    templateUrl: './detail.component.html'
})
export class DetailComponent implements OnChanges, OnInit, OnDestroy, AfterViewChecked {

    @Input() detail: Detail;
    @Input() card: Card;
    @Input() childCards: Card[];
    @Input() user: User;
    @Input() userWithPerimeters: UserWithPerimeters;
    @Input() currentPath: string;

    public active = false;
    unsubscribe$: Subject<void> = new Subject<void>();
    readonly hrefsOfCssLink = new Array<SafeResourceUrl>();
    private _htmlContent: SafeHtml;
    private _userContext: UserContext;
    private _lastCards$: Observable<LightCard[]>;
    private _responseData: Response;
    private _hasPrivilegeToRespond = false;
    private _acknowledgementAllowed: boolean;
    message: Message = {display: false, text: undefined, color: undefined};

    constructor(private element: ElementRef, private businessconfigService: ProcessesService,
                private handlebars: HandlebarsService, private sanitizer: DomSanitizer,
                private store: Store<AppState>, private translate: TranslateService,
                private cardService: CardService, private _appService: AppService) {

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

    // -------------------------- [OC-980] -------------------------- //
    adaptTemplateSize() {
        const cardTemplate = document.getElementById('div-card-template');
        const diffWindow = cardTemplate.getBoundingClientRect();
        const divMsg = document.getElementById('div-detail-msg');
        const divBtn = document.getElementById('div-detail-btn');

        let cardTemplateHeight = window.innerHeight - diffWindow.top;
        if (divMsg) {
            cardTemplateHeight -= divMsg.scrollHeight + 35;
        }
        if (divBtn) {
            cardTemplateHeight -= divBtn.scrollHeight + 50;
        }

        cardTemplate.style.maxHeight = `${cardTemplateHeight}px`;
        cardTemplate.style.overflowX = 'hidden';
    }

    ngAfterViewChecked() {
        this.adaptTemplateSize();
        window.onresize = this.adaptTemplateSize;
        window.onload = this.adaptTemplateSize;
    }

    // -------------------------------------------------------------- //

    ngOnInit() {


        if (this._appService.pageType === PageType.FEED) {

            this._lastCards$ = this.store.select(selectLastCards);

            this._lastCards$
                .pipe(
                    takeUntil(this.unsubscribe$),
                    map(lastCards =>
                        lastCards.filter(card =>
                            card.parentCardUid === this.card.uid &&
                            !this.childCards.map(childCard => childCard.uid).includes(card.uid))
                    ),
                    map(childCards => childCards.map(c => this.cardService.loadCard(c.id)))
                )
                .subscribe(childCardsObs => {
                    zip(...childCardsObs)
                        .pipe(takeUntil(this.unsubscribe$), map(cards => cards.map(cardData => cardData.card)))
                        .subscribe(newChildCards => {

                            const reducer = (accumulator, currentValue) => {
                                accumulator[currentValue.id] = currentValue;
                                return accumulator;
                            };

                            this.childCards = Object.values({
                                ...this.childCards.reduce(reducer, {}),
                                ...newChildCards.reduce(reducer, {}),
                            });

                            templateGateway.childCards = this.childCards;
                            templateGateway.applyChildCards();
                        });
                });
        }
        this.markAsRead();
    }

    get i18nPrefix() {
        return `${this.card.process}.${this.card.processVersion}.`;
    }

    get isArchivePageType() {
        return this._appService.pageType === PageType.ARCHIVE;
    }

    get responseDataParameters(): Map<string> {
        return this._responseData.btnText ? this._responseData.btnText.parameters : undefined;
    }

    get btnColor(): string {
        return this.businessconfigService.getResponseBtnColorEnumValue(this._responseData.btnColor);
    }

    get btnText(): string {
        return this._responseData.btnText ?
            this.i18nPrefix + this._responseData.btnText.key : ResponseI18nKeys.BUTTON_TITLE;
    }

    get responseDataExists(): boolean {
        return this._responseData != null && this._responseData !== undefined;
    }

    get isActionEnabled(): boolean {
        if (!this.card.entitiesAllowedToRespond) {
            console.log('Card error : no field entitiesAllowedToRespond');
            return false;
        }

        if (this._responseData != null && this._responseData !== undefined) {
            this.getPrivilegetoRespond(this.card, this._responseData);
        }

        return this.card.entitiesAllowedToRespond.includes(this.user.entities[0])
            && this._hasPrivilegeToRespond;
    }

    getPrivilegetoRespond(card: Card, responseData: Response) {

        this.userWithPerimeters.computedPerimeters.forEach(perim => {
            if ((perim.process === card.process) && (perim.state === responseData.state)
                && (this.compareRightAction(perim.rights, RightsEnum.Write)
                    || this.compareRightAction(perim.rights, RightsEnum.ReceiveAndWrite))) {
                this._hasPrivilegeToRespond = true;
            }

        });
    }

    compareRightAction(userRights: RightsEnum, rightsAction: RightsEnum): boolean {
        return (userRight(userRights) - userRight(rightsAction)) === 0;
    }

    get btnAckText(): string {
        return this.card.hasBeenAcknowledged ? AckI18nKeys.BUTTON_TEXT_UNACK : AckI18nKeys.BUTTON_TEXT_ACK;
    }

    get btnAckColor(): string {
        return this.card.hasBeenAcknowledged ? AckButtonColors.DANGER : AckButtonColors.PRIMARY;
    }

    get isAcknowledgementAllowed(): boolean {
        return this._acknowledgementAllowed ? this._acknowledgementAllowed : false;
    }

    submitResponse() {

        const formResult: FormResult = templateGateway.validyForm();

        if (formResult.valid) {

            const card: Card = {
                uid: null,
                id: null,
                publishDate: null,
                publisher: this.user.entities[0],
                processVersion: this.card.processVersion,
                process: this.card.process,
                processInstanceId: `${this.card.processInstanceId}_${this.user.entities[0]}`,
                state: this._responseData.state,
                startDate: this.card.startDate,
                endDate: this.card.endDate,
                severity: Severity.INFORMATION,
                hasBeenAcknowledged: false,
                hasBeenRead: false,
                entityRecipients: this.card.entityRecipients,
                externalRecipients: [this.card.publisher],
                title: this.card.title,
                summary: this.card.summary,
                data: formResult.formData,
                recipient: this.card.recipient,
                parentCardUid: this.card.uid
            };

            this.cardService.postResponseCard(card)
                .pipe(takeUntil(this.unsubscribe$))
                .subscribe(
                    rep => {
                        if (rep['count'] === 0 && rep['message'].includes('Error')) {
                            this.displayMessage(ResponseI18nKeys.SUBMIT_ERROR_MSG);
                            console.error(rep);

                        } else {
                            console.log(rep);
                            this.displayMessage(ResponseI18nKeys.SUBMIT_SUCCESS_MSG, ResponseMsgColor.GREEN);
                        }
                    },
                    err => {
                        this.displayMessage(ResponseI18nKeys.SUBMIT_ERROR_MSG);
                        console.error(err);
                    }
                );

        } else {
            (formResult.errorMsg && formResult.errorMsg !== '') ?
                this.displayMessage(formResult.errorMsg) :
                this.displayMessage(ResponseI18nKeys.FORM_ERROR_MSG);
        }
    }

    private displayMessage(text: string, color: ResponseMsgColor = ResponseMsgColor.RED) {
        this.message = {
            text: text,
            color: color,
            display: true
        };
    }

    acknowledge() {
        if (this.card.hasBeenAcknowledged) {
            this.cardService.deleteUserAcnowledgement(this.card).subscribe(resp => {
                if (resp.status === 200 || resp.status === 204) {
                    this.card = {...this.card, hasBeenAcknowledged: false};
                    this.updateAcknowledgementOnLightCard(false);
                } else {
                    console.error('the remote acknowledgement endpoint returned an error status(%d)', resp.status);
                    this.displayMessage(AckI18nKeys.ERROR_MSG);
                }
            });
        } else {
            this.cardService.postUserAcnowledgement(this.card).subscribe(resp => {
                if (resp.status === 201 || resp.status === 200) {
                    this.updateAcknowledgementOnLightCard(true);
                    this.closeDetails();
                } else {
                    console.error('the remote acknowledgement endpoint returned an error status(%d)', resp.status);
                    this.displayMessage(AckI18nKeys.ERROR_MSG);
                }
            });
        }
    }

    updateAcknowledgementOnLightCard(hasBeenAcknowledged: boolean) {
        this.store.select(fetchLightCard(this.card.id)).pipe(take(1))
            .subscribe((lightCard: LightCard) => {
                const updatedLighCard = {...lightCard, hasBeenAcknowledged: hasBeenAcknowledged};
                this.store.dispatch(new UpdateALightCard({card: updatedLighCard}));
            });
    }

    markAsRead() {
        if (this.card.hasBeenRead === false) {
            this.cardService.postUserCardRead(this.card).subscribe(resp => {
                if (resp.status === 201 || resp.status === 200) {
                    this.updateReadOnLightCard(true);
                }
            });
        }
    }

    updateReadOnLightCard(hasBeenRead: boolean) {
        this.store.select(fetchLightCard(this.card.id)).pipe(take(1))
            .subscribe((lightCard: LightCard) => {
                const updatedLighCard = {...lightCard, hasBeenRead: hasBeenRead};
                this.store.dispatch(new UpdateALightCard({card: updatedLighCard}));
            });
    }

    closeDetails() {
        this._appService.closeDetails(this.currentPath);
    }

    // for certain types of template , we need to reload it to take into account
    // the new css style (for example with chart done with chart.js)
    private reloadTemplateWhenGlobalStyleChange() {
        this.store.select(selectGlobalStyleState)
            .pipe(takeUntil(this.unsubscribe$), skip(1))
            .subscribe(style => this.initializeHandlebarsTemplates());
    }

    ngOnChanges(): void {
        this.initializeHrefsOfCssLink();
        this.initializeHandlebarsTemplates();
        this.message = {display: false, text: undefined, color: undefined};
    }

    private initializeHrefsOfCssLink() {
        if (this.detail && this.detail.styles) {
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

        templateGateway.childCards = this.childCards;
        this.businessconfigService.queryProcessFromCard(this.card).pipe(
            takeUntil(this.unsubscribe$),
            switchMap(process => {
                
                const state = process.extractState(this.card);
                this._responseData = state.response;
                this._acknowledgementAllowed = state.acknowledgementAllowed;
                return this.handlebars.executeTemplate(this.detail.templateName,
                    new DetailContext(this.card,this._userContext, this._responseData));
            })
        )
            .subscribe(
                html => {
                    this._htmlContent = this.sanitizer.bypassSecurityTrustHtml(html);
                    setTimeout(() => { // wait for DOM rendering
                        this.reinsertScripts();
                    }, 10);
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

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
