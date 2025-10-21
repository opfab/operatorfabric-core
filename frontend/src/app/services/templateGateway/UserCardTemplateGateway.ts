/* Copyright (c) 2024-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * this file is part of the OperatorFabric project.
 */

import {Severity} from 'app/model/Severity';
import {LoggerService as logger} from 'app/services/logs/LoggerService';

export class UserCardTemplateGateway {
    private static _editionMode: string;
    private static _endDate: number;
    private static _expirationDate: number;
    private static _initialKeepChildCards: boolean;
    private static _initialSeverity: Severity;
    private static _lttd: number;
    private static _processId: string;
    private static _selectedEntityRecipients: string[];
    private static _selectedEntityForInformationRecipients: string[];
    private static _state: string;
    private static _startDate: number;
    private static _userEntityChildCard: any;

    private static _functionToSetDropdownEntityRecipientList: Function;
    private static _functionToSetDropdownEntityRecipientForInformationList: Function;
    private static _functionToSetInitialSelectedRecipients: Function;
    private static _functionToSetInitialSelectedRecipientsForInformation: Function;
    private static _functionToSetSelectedRecipients: Function;
    private static _functionToSetSelectedRecipientsForInformation: Function;

    private static _functionToGetSpecficCardInformationFromTemplate: Function;
    private static _functionToSendEntityUsedForSendingCardToTemplate: Function;

    private static _functionToBeCalledBeforeCardSending: Function;

    public static init() {
        UserCardTemplateGateway._editionMode = null;
        UserCardTemplateGateway._endDate = null;
        UserCardTemplateGateway._expirationDate = null;
        UserCardTemplateGateway._initialSeverity = null;
        UserCardTemplateGateway._initialKeepChildCards = null;
        UserCardTemplateGateway._lttd = null;
        UserCardTemplateGateway._processId = null;
        UserCardTemplateGateway._state = null;
        UserCardTemplateGateway._startDate = null;
        UserCardTemplateGateway._selectedEntityRecipients = [];
        UserCardTemplateGateway._selectedEntityForInformationRecipients = [];
        UserCardTemplateGateway._userEntityChildCard = null;
        UserCardTemplateGateway._functionToSetDropdownEntityRecipientList = () => {};
        UserCardTemplateGateway._functionToSetDropdownEntityRecipientForInformationList = () => {};
        UserCardTemplateGateway._functionToSetInitialSelectedRecipients = () => {};
        UserCardTemplateGateway._functionToSetInitialSelectedRecipientsForInformation = () => {};
        UserCardTemplateGateway._functionToSetSelectedRecipients = () => {};
        UserCardTemplateGateway._functionToSetSelectedRecipientsForInformation = () => {};
        UserCardTemplateGateway._functionToBeCalledBeforeCardSending = () => {};
    }

    public static initTemplateFunctions() {
        UserCardTemplateGateway._functionToGetSpecficCardInformationFromTemplate = () => {
            logger.info(
                new Date().toISOString() +
                    ` Template : no getSpecificCardInformation method registered , valid set to false`
            );
            return {valid: false, errorMsg: 'Impossible to respond due to a technical error in the template'};
        };
        UserCardTemplateGateway._functionToSendEntityUsedForSendingCardToTemplate = () => {};
    }

    public static getEditionMode(): string {
        return UserCardTemplateGateway._editionMode;
    }

    public static getEndDate(): number {
        return UserCardTemplateGateway._endDate;
    }

    public static getExpirationDate(): number {
        return UserCardTemplateGateway._expirationDate;
    }

    public static getInitialKeepChildCards(): boolean {
        return UserCardTemplateGateway._initialKeepChildCards;
    }

    public static getInitialSeverity(): Severity {
        return UserCardTemplateGateway._initialSeverity;
    }

    public static getLttd(): number {
        return UserCardTemplateGateway._lttd;
    }

    public static getProcessId(): string {
        return UserCardTemplateGateway._processId;
    }

    public static getSelectedEntityRecipients(): string[] {
        return [...UserCardTemplateGateway._selectedEntityRecipients];
    }

    public static getSelectedEntityForInformationRecipients(): string[] {
        return [...UserCardTemplateGateway._selectedEntityForInformationRecipients];
    }

    public static getSpecificCardInformationFromTemplate(): any {
        return UserCardTemplateGateway._functionToGetSpecficCardInformationFromTemplate();
    }

    public static getState(): string {
        return UserCardTemplateGateway._state;
    }

    public static getStartDate(): number {
        return UserCardTemplateGateway._startDate;
    }

    public static getUserEntityChildCard(): any {
        return UserCardTemplateGateway._userEntityChildCard;
    }

    public static sendEntityUsedForSendingCardToTemplate(senderEntity: any) {
        UserCardTemplateGateway._functionToSendEntityUsedForSendingCardToTemplate(senderEntity);
    }

    public static setDropdownEntityRecipientList(recipients: string[]) {
        UserCardTemplateGateway._functionToSetDropdownEntityRecipientList(recipients);
    }

    public static setDropdownEntityRecipientForInformationList(recipients: string[]) {
        UserCardTemplateGateway._functionToSetDropdownEntityRecipientForInformationList(recipients);
    }

    public static setEditionMode(value: string) {
        UserCardTemplateGateway._editionMode = value;
    }

    public static setEndDate(value: number) {
        UserCardTemplateGateway._endDate = value;
    }

    public static setExpirationDate(value: number) {
        UserCardTemplateGateway._expirationDate = value;
    }

    public static setFunctionToBeCalledBeforeCardSending(functionToBeCalledBeforeCardSending: Function) {
        UserCardTemplateGateway._functionToBeCalledBeforeCardSending = functionToBeCalledBeforeCardSending;
    }

    public static async callFunctionToBeCalledBeforeCardSending(cardToBeSent: any) {
        await UserCardTemplateGateway._functionToBeCalledBeforeCardSending(cardToBeSent);
    }

    public static setFunctionToGetSpecificCardInformationFromTemplate(
        functionToGetSpecficCardInformationFromTemplate: Function
    ) {
        UserCardTemplateGateway._functionToGetSpecficCardInformationFromTemplate =
            functionToGetSpecficCardInformationFromTemplate;
    }

    public static setFunctionToSetDropdownEntityRecipientList(functionToSetDropdownEntityRecipientList: Function) {
        UserCardTemplateGateway._functionToSetDropdownEntityRecipientList = functionToSetDropdownEntityRecipientList;
    }

    public static setFunctionToSetDropdownEntityRecipientForInformationList(
        functionToSetDropdownEntityRecipientForInformationList: Function
    ) {
        UserCardTemplateGateway._functionToSetDropdownEntityRecipientForInformationList =
            functionToSetDropdownEntityRecipientForInformationList;
    }

    public static setFunctionToSetInitialSelectedRecipients(functionToSetInitialSelectedRecipients: Function) {
        UserCardTemplateGateway._functionToSetInitialSelectedRecipients = functionToSetInitialSelectedRecipients;
    }

    public static setFunctionToSetInitialSelectedRecipientsForInformation(
        functionToSetInitialSelectedRecipientsForInformation: Function
    ) {
        UserCardTemplateGateway._functionToSetInitialSelectedRecipientsForInformation =
            functionToSetInitialSelectedRecipientsForInformation;
    }

    public static setFunctionToSetSelectedRecipients(functionToSetSelectedRecipients: Function) {
        UserCardTemplateGateway._functionToSetSelectedRecipients = functionToSetSelectedRecipients;
    }

    public static setFunctionToSetSelectedRecipientsForInformation(
        functionToSetSelectedRecipientsForInformation: Function
    ) {
        UserCardTemplateGateway._functionToSetSelectedRecipientsForInformation =
            functionToSetSelectedRecipientsForInformation;
    }

    public static setInitialKeepChildCards(value: boolean) {
        UserCardTemplateGateway._initialKeepChildCards = value;
    }

    public static setInitialSelectedRecipients(value: string[]) {
        UserCardTemplateGateway._functionToSetInitialSelectedRecipients(value);
    }

    public static setInitialSelectedRecipientsForInformation(value: string[]) {
        UserCardTemplateGateway._functionToSetInitialSelectedRecipientsForInformation(value);
    }

    public static setInitialSeverity(value: Severity) {
        UserCardTemplateGateway._initialSeverity = value;
    }

    public static setLttd(value: number) {
        UserCardTemplateGateway._lttd = value;
    }

    public static setProcessId(value: string) {
        UserCardTemplateGateway._processId = value;
    }

    public static setSelectedEntityRecipientsForTemplate(value: string[]) {
        UserCardTemplateGateway._selectedEntityRecipients = value;
    }

    public static setSelectedEntityForInformationRecipientsForTemplate(value: string[]) {
        UserCardTemplateGateway._selectedEntityForInformationRecipients = value;
    }

    public static setSelectedRecipients(value: string[]) {
        UserCardTemplateGateway._functionToSetSelectedRecipients(value);
    }

    public static setSelectedRecipientsForInformation(value: string[]) {
        UserCardTemplateGateway._functionToSetSelectedRecipientsForInformation(value);
    }

    public static setState(value: string) {
        UserCardTemplateGateway._state = value;
    }

    public static setStartDate(value: number) {
        UserCardTemplateGateway._startDate = value;
    }

    public static setTemplateListenerForEntityUsedForSendingCard(listener: Function) {
        UserCardTemplateGateway._functionToSendEntityUsedForSendingCardToTemplate = listener;
    }

    public static setUserEntityChildCard(value: any) {
        UserCardTemplateGateway._userEntityChildCard = value;
    }
}
