/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Card, CardWithChildCards, convertCardToLightCard} from '@ofServices/cards/model/Card';
import {Severity} from '@ofModel/light-card.model';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {map} from 'rxjs/operators';
import {DisplayContext} from '@ofModel/template.model';
import {CardsService} from '@ofServices/cards/CardsService';
import {Observable} from 'rxjs';
import {UserCardView} from 'app/business/view/userCard/userCard.view';
import {
    EditionMode,
    InputFieldName,
    MultiselectItem,
    UserCardUIControl
} from 'app/business/view/userCard/userCard.model';
import {MultiSelectConfig, MultiSelectOption} from 'app/modules/share/multi-select/model/MultiSelect';
import {MultiSelectComponent} from '../share/multi-select/multi-select.component';
import {EntitiesService} from '@ofServices/entities/EntitiesService';
import {ConfigService} from 'app/services/config/ConfigService';
import {UsersService} from '@ofServices/users/UsersService';
import {NgIf, NgFor, NgClass} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {SimplifiedCardViewComponent} from '../share/simplified-card-view/simplified-card-view.component';
import {SpinnerComponent} from '../share/spinner/spinner.component';
import {LightCardModule} from '../share/light-card/light-card.module';
import {Entity} from '@ofServices/entities/model/Entity';

@Component({
    selector: 'of-usercard',
    templateUrl: './usercard.component.html',
    styleUrls: ['./usercard.component.scss'],
    standalone: true,
    imports: [
        NgIf,
        TranslateModule,
        FormsModule,
        ReactiveFormsModule,
        MultiSelectComponent,
        NgFor,
        NgClass,
        LightCardModule,
        SimplifiedCardViewComponent,
        SpinnerComponent
    ]
})
export class UserCardComponent implements OnDestroy, UserCardUIControl, AfterViewInit {
    @Input() userCardModal;
    @Input() cardIdToEdit: string = null;
    @Input() cardIdToCopy: string = null;

    @ViewChild('processGroupSelect') processGroupSelect: MultiSelectComponent;
    @ViewChild('processSelect') processSelect: MultiSelectComponent;

    public processGroupMultiSelectConfig: MultiSelectConfig = {
        labelKey: 'shared.filters.processGroup',
        multiple: false,
        search: true
    };
    public processMultiSelectConfig: MultiSelectConfig = {
        labelKey: 'shared.filters.process',
        multiple: false,
        sortOptions: false,
        search: true
    };
    public stateMultiSelectConfig: MultiSelectConfig = {
        labelKey: 'shared.filters.state',
        sortOptions: false,
        multiple: false,
        search: true
    };
    public publisherMultiSelectConfig: MultiSelectConfig = {
        labelKey: 'shared.cardPublisher',
        multiple: false,
        search: true
    };
    public recipientsMultiSelectConfig: MultiSelectConfig = {
        labelKey: 'userCard.filters.recipients',
        sortOptions: true,
        labelRenderer: this.entityRecipientLabelRenderer
    };
    public recipientsForInformationMultiSelectConfig: MultiSelectConfig = {
        labelKey: 'userCard.filters.recipientsForInformation',
        sortOptions: true,
        labelRenderer: this.entityRecipientLabelRenderer
    };

    private readonly userCardForm = new FormGroup({
        cardPublisher: new FormControl(''),
        endDate: new FormControl(''),
        expirationDate: new FormControl(''),
        lttd: new FormControl(''),
        severity: new FormControl(''),
        keepChildCards: new FormControl(true),
        startDate: new FormControl(''),
        userCardRecipients: new FormControl([]),
        userCardRecipientsForInformation: new FormControl([]),
        userCardProcess: new FormControl(''),
        userCardProcessGroup: new FormControl(''),
        userCardState: new FormControl('')
    });

    public cardLoadingInProgress = true;
    public cardPreview: Card;
    public childCardsPreview: Card[] = [];
    public connectedRecipients = new Set();
    public displayContext = DisplayContext.PREVIEW;
    public displayPreview = false;
    public lightCardPreview: Card;
    public prepareCardForPreviewInProgress = false;
    public recipients = [];
    public recipientsForInformationOptions: Array<MultiSelectOption> = [];
    public recipientsOptions: Array<MultiSelectOption> = [];
    public selectedProcess;
    public selectedProcessGroup;
    public selectedPublisher;
    public selectedRecipients;
    public selectedRecipientsForInformation;
    public selectedState;
    public stateOptions: Array<MultiSelectOption> = [];
    public templateLoadingInProgress = false;
    public useDescriptionFieldForEntityList = false;
    public userAllowedToSendCard = true;
    public userCardTemplate: SafeHtml;
    public userCardView: UserCardView;
    public processGroupOptions: Array<MultiSelectOption> = [];
    public processOptions: Array<MultiSelectOption> = [];
    public publisherOptions: Array<MultiSelectOption> = [];
    public sendingCardInProgress = false;
    private intervalIdForConnectedRecipientsUpdate: any;

    constructor(
        private readonly sanitizer: DomSanitizer,
        private readonly element: ElementRef
    ) {
        this.userCardView = new UserCardView(this);
        this.cardLoadingInProgress = true;
        this.useDescriptionFieldForEntityList = ConfigService.getConfigValue(
            'usercard.useDescriptionFieldForEntityList',
            false
        );
    }

    async ngAfterViewInit() {
        // Use promise to avoid angular warning ExpressionChangedAfterItHasBeenCheckedError
        await Promise.resolve();
        if (this.cardIdToEdit) {
            await this.userCardView.init(this.cardIdToEdit, EditionMode.EDITION);
        } else if (this.cardIdToCopy) {
            await this.userCardView.init(this.cardIdToCopy, EditionMode.COPY);
        } else {
            await this.userCardView.init();
        }
        this.cardLoadingInProgress = false;
    }

    public lockProcessAndProcessGroupSelection(lock: boolean): void {
        this.processSelect.disable();
        this.processGroupSelect.disable();
    }

    public async renderTemplate(html: string) {
        // No security issue hera as the html is generated by handlerbars that has already sanitized the input
        this.userCardTemplate = this.sanitizer.bypassSecurityTrustHtml(html) ?? ''; //NOSONAR

        await new Promise<void>((resolve) =>
            setTimeout(() => {
                // wait for DOM rendering
                this.reinsertScripts();
                resolve();
            }, 10)
        );
    }

    public entityRecipientLabelRenderer(data) {
        const childEntities = EntitiesService.resolveChildEntities(data.value);
        let label = data.label;
        if (childEntities.length) {
            label =
                label +
                ' <i style="color: var(--opfab-color-grey);text-overflow: ellipsis">(' +
                UserCardComponent.formatEntitiesNamesAsString(childEntities);
            label = label + ')</i>';
        }
        return label;
    }

    hasChildEntities(entityId) {
        const childEntities = EntitiesService.resolveChildEntities(entityId);
        return childEntities?.length > 0;
    }

    getChildEntitiesNames(entityId: string) {
        return UserCardComponent.formatEntitiesNamesAsString(EntitiesService.resolveChildEntities(entityId));
    }

    public static formatEntitiesNamesAsString(entities: Entity[]): string {
        return entities ? entities.map((entity) => entity.name).join(',') : '';
    }

    public setUserNotAllowedToSendCard(): void {
        this.userAllowedToSendCard = false;
    }
    public setInputVisibility(inputName: InputFieldName, visible: boolean): void {
        if (visible) document.getElementById('opfab-usercard-input-' + inputName).removeAttribute('hidden');
        else document.getElementById('opfab-usercard-input-' + inputName).setAttribute('hidden', '');
    }
    public setSeverity(severity: Severity): void {
        this.userCardForm.get('severity').setValue(severity);
    }
    public setKeepChildCards(keepChildCards: boolean): void {
        this.userCardForm.get('keepChildCards')?.setValue(keepChildCards);
    }
    public setRecipientsList(recipients: MultiselectItem[]) {
        this.recipientsOptions = recipients.map((entity) => new MultiSelectOption(entity.id, entity.label));
    }

    public setSelectedRecipients(selected: string[]) {
        this.selectedRecipients = selected;
    }
    public setRecipientsForInformationList(recipients: MultiselectItem[]) {
        this.recipientsForInformationOptions = recipients.map(
            (entity) => new MultiSelectOption(entity.id, entity.label)
        );
    }
    public setSelectedRecipientsForInformation(selected: string[]) {
        this.selectedRecipientsForInformation = selected;
    }
    public setDate(inputName: InputFieldName, value: number) {
        this.userCardForm.get(inputName).setValue(this.epochDateToString(value));
    }
    private epochDateToString(epochDate: number): string {
        const dateObject = new Date(epochDate);
        return (
            dateObject.getFullYear() +
            '-' +
            String(dateObject.getMonth() + 1).padStart(2, '0') +
            '-' +
            String(dateObject.getDate()).padStart(2, '0') +
            'T' +
            String(dateObject.getHours()).padStart(2, '0') +
            ':' +
            String(dateObject.getMinutes()).padStart(2, '0')
        );
    }
    public setPublisherList(publishers: MultiselectItem[], selected: string) {
        this.publisherOptions = publishers.map((publisher) => new MultiSelectOption(publisher.id, publisher.label));
        this.selectedPublisher = selected;
    }

    public setProcessGroupList(processGroups: MultiselectItem[], selected: string) {
        this.processGroupOptions = processGroups.map(
            (processGroup) => new MultiSelectOption(processGroup.id, processGroup.label)
        );
        this.selectedProcessGroup = selected;
    }

    public setProcessList(processes: MultiselectItem[], selected: string) {
        this.processOptions = processes.map((process) => new MultiSelectOption(process.id, process.label));
        this.selectedProcess = selected;
    }

    public setStatesList(states: MultiselectItem[], selected: string) {
        this.stateOptions = states.map((state) => new MultiSelectOption(state.id, state.label));
        this.selectedState = selected;
    }

    public setLoadingTemplateInProgress(loading: boolean) {
        this.templateLoadingInProgress = loading;
    }

    public onProcessGroupChoiceChanged(processGroup: any) {
        this.userCardView.userClicksOnProcessGroup(processGroup);
    }

    public onProcessChoiceChanged(process: any) {
        this.userCardView.userClicksOnProcess(process);
    }

    public onStateChoiceChanged(state: any) {
        this.userCardView.userClicksOnState(state);
    }

    public onSeverityChoiceChanged(event: Event) {
        this.userCardView.userSelectsSeverity((<HTMLInputElement>event.target).value as Severity);
    }

    public onKeepChildCardsChoiceChanged(event: Event) {
        this.userCardView.userSelectsKeepChildCards((<HTMLInputElement>event.target).checked);
    }

    public onStartDateChange() {
        this.userCardView.userSetStartDate(this.getDateAsEpoch('startDate'));
    }

    public onEndDateChange() {
        this.userCardView.userSetEndDate(this.getDateAsEpoch('endDate'));
    }

    public onLttdChange() {
        this.userCardView.userSetLttd(this.getDateAsEpoch('lttd'));
    }

    public onExpirationDateChange() {
        this.userCardView.userSetExpirationDate(this.getDateAsEpoch('expirationDate'));
    }

    private getDateAsEpoch(dateField: string): number {
        return Date.parse(this.userCardForm.get(dateField).value);
    }

    public onPublisherChoiceChanged(selected: any) {
        this.userCardView.userSetPublisher(selected);
    }

    public onRecipientChoiceChanged(selected: any) {
        this.userCardView.userSetRecipients(selected);
    }

    public onRecipientForInformationChoiceChanged(selected: any) {
        this.userCardView.userSetRecipientsForInformation(selected);
    }

    private reinsertScripts(): void {
        //bug eslint/prettier
        const scripts = <HTMLCollection>this.element.nativeElement.getElementsByTagName('script'); //eslint-disable-line
        Array.from(scripts).forEach((script) => {
            const scriptCopy = document.createElement('script');
            scriptCopy.type = (<HTMLScriptElement>script).type ? (<HTMLScriptElement>script).type : 'text/javascript';
            if (script.innerHTML) {
                scriptCopy.innerHTML = script.innerHTML;
            }
            scriptCopy.async = false;
            script.parentNode.replaceChild(scriptCopy, script);
        });
    }

    public getEntityName(id: string): string {
        if (this.useDescriptionFieldForEntityList)
            return EntitiesService.getEntities().find((entity) => entity.id === id).description;
        else return EntitiesService.getEntities().find((entity) => entity.id === id).name;
    }

    private updateRegularlyConnectedUsers() {
        this.getConnectedRecipients().subscribe();
        this.intervalIdForConnectedRecipientsUpdate = setInterval(() => {
            this.getConnectedRecipients().subscribe();
        }, 2000);
    }

    private getConnectedRecipients(): Observable<void> {
        return CardsService.fetchConnectedRecipients(this.lightCardPreview).pipe(
            map((connectedRecipients) => {
                this.connectedRecipients.clear();
                connectedRecipients.forEach((recipient) => {
                    this.connectedRecipients.add(recipient);
                });
            })
        );
    }

    public cancel(): void {
        this.userCardModal.close();
    }

    public async openPreview() {
        this.prepareCardForPreviewInProgress = true;
        await this.userCardView.prepareCardToSend();
        const cardWithChildCards = this.userCardView.getCardWithChildCardsForPreview();
        this.cardPreview = cardWithChildCards.card;
        this.childCardsPreview = cardWithChildCards.childCards;
        this.prepareCardForPreviewInProgress = false;
        if (this.cardPreview !== undefined) {
            this.buildLightCardPreview(cardWithChildCards);
            this.recipients = this.cardPreview.entityRecipients.filter(
                (entity) => !this.cardPreview.entityRecipientsForInformation?.includes(entity)
            );
            this.displayPreview = true;
            this.updateRegularlyConnectedUsers();
        }
    }

    private buildLightCardPreview(cardWithChildCards: CardWithChildCards) {
        const userEntities = UsersService.getCurrentUserWithPerimeters().userData.entities;
        const hasChildCardFromCurrentUserEntity =
            cardWithChildCards.childCards?.some((child) => userEntities.includes(child.publisher)) ?? false;
        this.lightCardPreview = {...convertCardToLightCard(this.cardPreview), hasChildCardFromCurrentUserEntity};
    }

    public cancelPreview(): void {
        this.stopUpdateRegularlyConnectedUser();
        this.displayPreview = false;
    }

    public async sendCard() {
        this.displayPreview = false;
        this.sendingCardInProgress = true;
        await this.userCardView.sendCardAncChildCard();
        this.userCardModal.dismiss('Close');
    }

    private stopUpdateRegularlyConnectedUser() {
        this.connectedRecipients = new Set();
        clearInterval(this.intervalIdForConnectedRecipientsUpdate);
    }

    ngOnDestroy() {
        if (this.intervalIdForConnectedRecipientsUpdate) {
            this.stopUpdateRegularlyConnectedUser();
        }
    }
}
