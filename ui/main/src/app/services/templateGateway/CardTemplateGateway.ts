/* Copyright (c) 2024-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Card} from '@ofServices/cards/model/Card';
import {Utilities} from '../../business/common/utilities';
import {LoggerService as logger} from 'app/services/logs/LoggerService';

export class CardTemplateGateway {
    private static _card: Card;
    private static _childCards: Card[];
    private static _displayContext: string;
    private static _entitiesAllowedToRespond: string[];
    private static _entitiesUsableForUserResponse: string[];
    private static _responseLocked: boolean;
    private static _userAllowedToEdit: boolean;
    private static _userAllowedToRespond: boolean;
    private static _userMemberOfAnEntityRequiredToRespond: boolean;

    private static _functionToDisplayLoadingSpinner: Function;
    private static _functionToHideLoadingSpinner: Function;

    private static _functionToSendResponseLockToTemplate: Function;
    private static _functionToSendResponseUnlockToTemplate: Function;
    private static _functionToSendChildCardsToTemplate: Function;
    private static _functionToSendLttdExpiredToTemplate: Function;
    private static _functionToSendScreenSizeToTemplate: Function;
    private static _functionToSendStyleChangeToTemplate: Function;
    private static _functionToSendTemplateRenderingCompleteToTemplate: Function;

    private static _functionToGetUserResponseFromTemplate: Function;
    private static _functionToEditCard: Function;

    public static init() {
        CardTemplateGateway._card = undefined;
        CardTemplateGateway._childCards = [];
        CardTemplateGateway._displayContext = '';
        CardTemplateGateway._entitiesAllowedToRespond = [];
        CardTemplateGateway._entitiesUsableForUserResponse = [];
        CardTemplateGateway._responseLocked = false;
        CardTemplateGateway._userAllowedToEdit = false;
        CardTemplateGateway._userAllowedToRespond = false;
        CardTemplateGateway._userMemberOfAnEntityRequiredToRespond = false;

        CardTemplateGateway._functionToDisplayLoadingSpinner = () => {};
        CardTemplateGateway._functionToHideLoadingSpinner = () => {};
    }

    public static initTemplateFunctions() {
        CardTemplateGateway._functionToSendResponseLockToTemplate = () => {};
        CardTemplateGateway._functionToSendResponseUnlockToTemplate = () => {};
        CardTemplateGateway._functionToSendChildCardsToTemplate = (childCards: Card[]) => {};
        CardTemplateGateway._functionToSendLttdExpiredToTemplate = (lttdExpired: boolean) => {};
        CardTemplateGateway._functionToSendScreenSizeToTemplate = (size: string) => {};
        CardTemplateGateway._functionToSendStyleChangeToTemplate = () => {};
        CardTemplateGateway._functionToSendTemplateRenderingCompleteToTemplate = () => {};
        CardTemplateGateway._functionToGetUserResponseFromTemplate = (emitter: string) => {
            logger.info(` Template : no getUserResponse method provided , valid set to false`);
            return {valid: false, errorMsg: 'Impossible to respond due to a technical error in the template'};
        };

        CardTemplateGateway._functionToEditCard = () => {
            logger.info(`EditCard method not available`);
        };
    }

    public static registerFunctionToEditCard(editCard: Function) {
        CardTemplateGateway._functionToEditCard = editCard;
    }

    public static displayLoadingSpinner() {
        CardTemplateGateway._functionToDisplayLoadingSpinner();
    }

    public static editCard() {
        CardTemplateGateway._functionToEditCard();
    }

    public static getChildCards(): Card[] {
        return Utilities.cloneObj(CardTemplateGateway._childCards);
    }

    public static getCard(): Card {
        return Utilities.cloneObj(CardTemplateGateway._card);
    }

    public static getDisplayContext() {
        return CardTemplateGateway._displayContext;
    }

    public static getEntitiesAllowedToRespond() {
        return [...CardTemplateGateway._entitiesAllowedToRespond];
    }

    public static getEntitiesUsableForUserResponse() {
        return [...CardTemplateGateway._entitiesUsableForUserResponse];
    }

    public static getUserResponseFromTemplate(emitter: string) {
        return Utilities.cloneObj(CardTemplateGateway._functionToGetUserResponseFromTemplate(emitter));
    }

    public static hideLoadingSpinner() {
        CardTemplateGateway._functionToHideLoadingSpinner();
    }

    public static isResponseLocked() {
        return CardTemplateGateway._responseLocked;
    }

    public static isUserAllowedToEdit() {
        return CardTemplateGateway._userAllowedToEdit;
    }

    public static isUserAllowedToRespond() {
        return CardTemplateGateway._userAllowedToRespond;
    }

    public static isUserMemberOfAnEntityRequiredToRespond() {
        return CardTemplateGateway._userMemberOfAnEntityRequiredToRespond;
    }

    public static sendChildCardsToTemplate() {
        CardTemplateGateway._functionToSendChildCardsToTemplate(CardTemplateGateway.getChildCards());
    }

    public static sendLttdExpiredToTemplate(expired: boolean) {
        CardTemplateGateway._functionToSendLttdExpiredToTemplate(expired);
    }

    public static sendResponseLockToTemplate() {
        CardTemplateGateway._functionToSendResponseLockToTemplate();
    }

    public static sendResponseUnlockToTemplate() {
        CardTemplateGateway._functionToSendResponseUnlockToTemplate();
    }

    // size = 'md' for standard size
    // size = 'lg' for large size , i.e when the card is in full screen mode
    public static sendScreenSizeToTemplate(size: string) {
        CardTemplateGateway._functionToSendScreenSizeToTemplate(size);
    }

    // call this function when global style has changed
    public static sendStyleChangeToTemplate() {
        CardTemplateGateway._functionToSendStyleChangeToTemplate();
    }

    // call this method when all tasks regarding rendering template are finished :
    // it is called after applyChildCard(), lockAnswer(), setLttdExpired() and setScreenSize()
    public static sendTemplateRenderingCompleteToTemplate() {
        CardTemplateGateway._functionToSendTemplateRenderingCompleteToTemplate();
    }

    public static setCard(card: Card) {
        CardTemplateGateway._card = card;
    }

    public static setChildCards(value: Card[]) {
        CardTemplateGateway._childCards = value;
    }

    public static setDisplayContext(displayContext: string) {
        CardTemplateGateway._displayContext = displayContext;
    }

    public static setEntitiesAllowedToRespond(entitiesAllowedToRespond: string[]) {
        CardTemplateGateway._entitiesAllowedToRespond = entitiesAllowedToRespond;
    }

    public static setEntitiesUsableForUserResponse(entitiesUsableForUserResponse: string[]) {
        CardTemplateGateway._entitiesUsableForUserResponse = entitiesUsableForUserResponse;
    }

    public static setFunctionToGetUserResponseFromTemplate(functionToGetUserResponseFromTemplate: Function) {
        CardTemplateGateway._functionToGetUserResponseFromTemplate = functionToGetUserResponseFromTemplate;
    }

    public static setFunctionToHideLoadingSpinner(functionToHideLoadingSpinner: Function) {
        CardTemplateGateway._functionToHideLoadingSpinner = functionToHideLoadingSpinner;
    }

    public static setFunctionToDisplayLoadingSpinner(functionToDisplayLoadingSpinner: Function) {
        CardTemplateGateway._functionToDisplayLoadingSpinner = functionToDisplayLoadingSpinner;
    }

    public static setResponseLocked(responseLocked: boolean) {
        CardTemplateGateway._responseLocked = responseLocked;
    }

    public static setTemplateListenerForChildCards(listener: Function) {
        CardTemplateGateway._functionToSendChildCardsToTemplate = listener;
    }

    public static setTemplateListenerForLttdExpired(listener: Function) {
        CardTemplateGateway._functionToSendLttdExpiredToTemplate = listener;
    }

    public static setTemplateListenerForResponseLock(listener: Function) {
        CardTemplateGateway._functionToSendResponseLockToTemplate = listener;
    }

    public static setTemplateListenerForResponseUnlock(listener: Function) {
        CardTemplateGateway._functionToSendResponseUnlockToTemplate = listener;
    }

    public static setTemplateListenerForScreenSize(listener: Function) {
        CardTemplateGateway._functionToSendScreenSizeToTemplate = listener;
    }

    public static setTemplateListenerForStyleChange(listener: Function) {
        CardTemplateGateway._functionToSendStyleChangeToTemplate = listener;
    }

    public static setTemplateListenerForTemplateRenderingComplete(listener: Function) {
        CardTemplateGateway._functionToSendTemplateRenderingCompleteToTemplate = listener;
    }

    public static setUserAllowedToEdit(userAllowedToEdit: boolean) {
        CardTemplateGateway._userAllowedToEdit = userAllowedToEdit;
    }

    public static setUserAllowedToRespond(userAllowedToRespond: boolean) {
        CardTemplateGateway._userAllowedToRespond = userAllowedToRespond;
    }

    public static setUserMemberOfAnEntityRequiredToRespond(userMemberOfAnEntityRequiredToRespond: boolean) {
        CardTemplateGateway._userMemberOfAnEntityRequiredToRespond = userMemberOfAnEntityRequiredToRespond;
    }
}
