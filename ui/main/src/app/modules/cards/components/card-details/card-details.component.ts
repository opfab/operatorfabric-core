import { Component, OnInit } from '@angular/core';
import { Card, Detail} from '@ofModel/card.model';
import { Store } from '@ngrx/store';
import { AppState } from '@ofStore/index';
import * as cardSelectors from '@ofStore/selectors/card.selectors';
import { ProcessesService } from "@ofServices/processes.service";
import { ClearLightCardSelection } from '@ofStore/actions/light-card.actions';
import { Router } from '@angular/router';
import { selectCurrentUrl } from '@ofStore/selectors/router.selectors';
import { Response} from '@ofModel/processes.model';
import { Map } from '@ofModel/map';
import { UserService } from '@ofServices/user.service';
import { selectIdentifier } from '@ofStore/selectors/authentication.selectors';
import { switchMap } from 'rxjs/operators';
import { Severity } from '@ofModel/light-card.model';
import { CardService } from '@ofServices/card.service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import { AppService, PageType } from '@ofServices/app.service';

import { User } from '@ofModel/user.model';
import { UserWithPerimeters, RightsEnum, userRight } from '@ofModel/userWithPerimeters.model';

import { id } from '@swimlane/ngx-charts';
declare const templateGateway: any;

const RESPONSE_FORM_ERROR_MSG_I18N_KEY = 'response.error.form';
const RESPONSE_SUBMIT_ERROR_MSG_I18N_KEY = 'response.error.submit';
const RESPONSE_SUBMIT_SUCCESS_MSG_I18N_KEY = 'response.submitSuccess';
const RESPONSE_BUTTON_TITLE_I18N_KEY = 'response.btnTitle';
const ACK_BUTTON_TEXTS_I18N_KEY = ['cardAcknowledgment.button.ack', 'cardAcknowledgment.button.unack'];
const ACK_BUTTON_COLORS = ['btn-primary', 'btn-danger'];
const RESPONSE_ACK_ERROR_MSG_I18N_KEY = 'response.error.ack';

@Component({
    selector: 'of-card-details',
    templateUrl: './card-details.component.html',
    styleUrls: ['./card-details.component.scss']
})
export class CardDetailsComponent implements OnInit {

    protected _i18nPrefix: string;
    card: Card;
    childCards: Card[];
    user: User;
    hasPrivilegetoRespond: boolean = false;
    userWithPerimeters: UserWithPerimeters;
    details: Detail[];
    acknowledgementAllowed: boolean;
    currentPath: any;
    responseData: Response;
    unsubscribe$: Subject<void> = new Subject<void>();
    messages = {
        submitError: {
            display: false,
            msg: RESPONSE_SUBMIT_ERROR_MSG_I18N_KEY,
            color: 'red'
        },
        formError: {
            display: false,
            msg: RESPONSE_FORM_ERROR_MSG_I18N_KEY,
            color: 'red'
        },
        submitSuccess: {
            display: false,
            msg: RESPONSE_SUBMIT_SUCCESS_MSG_I18N_KEY,
            color: 'green'
        }
    }


    constructor(private store: Store<AppState>,
        private businessconfigService: ProcessesService,
        private userService: UserService,
        private cardService: CardService,
        private router: Router,
        private _appService: AppService) {
    }

    get responseDataExists(): boolean {
        return this.responseData != null && this.responseData != undefined;
    }

    get isActionEnabled(): boolean {
        if (!this.card.entitiesAllowedToRespond) {
            console.log("Card error : no field entitiesAllowedToRespond");
            return false;
        }

        if (this.responseData != null && this.responseData != undefined) {
            this.getPrivilegetoRespond(this.card, this.responseData);
        }

        return this.card.entitiesAllowedToRespond.includes(this.user.entities[0])
            && this.hasPrivilegetoRespond;
    }

    get isArchivePageType(){
        return this._appService.pageType == PageType.ARCHIVE;
    }


    get i18nPrefix(): string {
        return this._i18nPrefix;
    }

    get btnColor(): string {
        return this.businessconfigService.getResponseBtnColorEnumValue(this.responseData.btnColor);
    }

    get btnText(): string {
        return this.responseData.btnText ?
            this.i18nPrefix + this.responseData.btnText.key : RESPONSE_BUTTON_TITLE_I18N_KEY;
    }

    get responseDataParameters(): Map<string> {
        return this.responseData.btnText ? this.responseData.btnText.parameters : undefined;
    }

    get isAcknowledgementAllowed(): boolean {
        return this.acknowledgementAllowed ? this.acknowledgementAllowed : false;
    }

    get btnAckText(): string {
        return this.card.hasBeenAcknowledged ? ACK_BUTTON_TEXTS_I18N_KEY[+this.card.hasBeenAcknowledged] : ACK_BUTTON_TEXTS_I18N_KEY[+false];
    }

    get btnAckColor(): string {
        return this.card.hasBeenAcknowledged ? ACK_BUTTON_COLORS[+this.card.hasBeenAcknowledged] : ACK_BUTTON_COLORS[+false];
    }

    ngOnInit() {
        this.store.select(cardSelectors.selectCardStateSelectedWithChildCards)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(([card, childCards]: [Card, Card[]]) => {
                this.card = card;
                this.childCards = childCards;
                if (card) {
                    this._i18nPrefix = `${card.process}.${card.processVersion}.`;
                    if (card.details) {
                        this.details = [...card.details];
                    } else {
                        this.details = [];
                    }
                    this.messages.submitError.display = false;
                    this.businessconfigService.queryProcess(this.card.process, this.card.processVersion)
                        .pipe(takeUntil(this.unsubscribe$))
                        .subscribe(businessconfig => {
                            if (businessconfig) {
                                const state = businessconfig.extractState(this.card);
                                if (state != null) {
                                    this.details.push(...state.details);
                                    this.acknowledgementAllowed = state.acknowledgementAllowed;
                                }
                            }
                        },
                            error => console.log(`something went wrong while trying to fetch process for ${this.card.process} with ${this.card.processVersion} version.`)
                        );
                }
            });

        this.store.select(selectCurrentUrl)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(url => {
                if (url) {
                    const urlParts = url.split('/');
                    this.currentPath = urlParts[1];
                }
            });

        this.store.select(selectIdentifier)
            .pipe(takeUntil(this.unsubscribe$))
            .pipe(switchMap(userId => this.userService.askUserApplicationRegistered(userId))).subscribe(user => {
                if (user) {
                    this.user = user
                }
            },
                error => console.log(`something went wrong while trying to ask user application registered service with user id : ${id} `)
            );

        this.userService.currentUserWithPerimeters()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(userWithPerimeters => {
                if (userWithPerimeters) {
                    this.userWithPerimeters = userWithPerimeters;
                }
            },
                error => console.log(`something went wrong while trying to have currentUser with perimeters `)
            );

    }



    getPrivilegetoRespond(card: Card, responseData: Response) {

        this.userWithPerimeters.computedPerimeters.forEach(perim => {
            if ((perim.process === card.process) && (perim.state === responseData.state)
                && (this.compareRightAction(perim.rights, RightsEnum.Write)
                    || this.compareRightAction(perim.rights, RightsEnum.ReceiveAndWrite))) {
                this.hasPrivilegetoRespond = true;
            }

        })
    }

    compareRightAction(userRights: RightsEnum, rightsAction: RightsEnum): boolean {
        return (userRight(userRights) - userRight(rightsAction)) === 0;
    }


    closeDetails() {
        this.store.dispatch(new ClearLightCardSelection());
        this.router.navigate(['/' + this.currentPath, 'cards']);
    }

    getResponseData($event) {
        this.responseData = $event;
    }



    submitResponse() {

        let formData = {};

        var formElement = document.getElementById("opfab-form") as HTMLFormElement;
        for (let [key, value] of [...new FormData(formElement)]) {
            (key in formData) ? formData[key].push(value) : formData[key] = [value];
        }

        templateGateway.validyForm(formData);

        if (templateGateway.isValid) {

            const card: Card = {
                uid: null,
                id: null,
                publishDate: null,
                publisher: this.user.entities[0],
                processVersion: this.card.processVersion,
                process: this.card.process,
                processInstanceId: `${this.card.processInstanceId}_${this.user.entities[0]}`,
                state: this.responseData.state,
                startDate: this.card.startDate,
                endDate: this.card.endDate,
                severity: Severity.INFORMATION,
                hasBeenAcknowledged: false,
                entityRecipients: this.card.entityRecipients,
                externalRecipients: [this.card.publisher],
                title: this.card.title,
                summary: this.card.summary,
                data: formData,
                recipient: this.card.recipient,
                parentCardId: this.card.uid
            }

            this.cardService.postResponseCard(card)
                .subscribe(
                    rep => {
                        if (rep['count'] == 0 && rep['message'].includes('Error')) {
                            this.messages.submitError.display = true;
                            console.error(rep);

                        } else {
                            console.log(rep);
                            this.messages.formError.display = false;
                            this.messages.submitSuccess.display = true;
                        }
                    },
                    err => {
                        this.messages.submitError.display = true;
                        console.error(err);
                    }
                )

        } else {

            this.messages.formError.display = true;
            this.messages.formError.msg = (templateGateway.formErrorMsg && templateGateway.formErrorMsg != '') ?
                templateGateway.formErrorMsg : RESPONSE_FORM_ERROR_MSG_I18N_KEY;
        }
    }

    acknowledge() {
        if (this.card.hasBeenAcknowledged == true) {
            this.cardService.deleteUserAcnowledgement(this.card).subscribe(resp => {
                if (resp.status == 200 || resp.status == 204) {
                    var tmp = { ... this.card };
                    tmp.hasBeenAcknowledged = false;
                    this.card = tmp;
                } else {
                    console.error("the remote acknowledgement endpoint returned an error status(%d)", resp.status);
                    this.messages.formError.display = true;
                    this.messages.formError.msg = RESPONSE_ACK_ERROR_MSG_I18N_KEY;
                }
            });
        } else {
            this.cardService.postUserAcnowledgement(this.card).subscribe(resp => {
                if (resp.status == 201 || resp.status == 200) {
                    this.closeDetails();
                } else {
                    console.error("the remote acknowledgement endpoint returned an error status(%d)", resp.status);
                    this.messages.formError.display = true;
                    this.messages.formError.msg = RESPONSE_ACK_ERROR_MSG_I18N_KEY;
                }
            });
        }
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
