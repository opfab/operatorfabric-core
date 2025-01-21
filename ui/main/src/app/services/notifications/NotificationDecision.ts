/* Copyright (c) 2024-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Card} from 'app/model/Card';
import {CardAction} from 'app/model/CardAction';
import {Severity} from 'app/model/Severity';

export class NotificationDecision {
    /* We allow a 30-minute window for a card to be considered 'recent'. This accounts for potential network issues that
     * might delay the card's delivery. For instance, a notification might sound 20 minutes after the card's publication.
     */
    static readonly RECENT_THRESHOLD = 18000000; // in milliseconds , 30 minutes
    static readonly ERROR_MARGIN = 4000; // in milliseconds
    static readonly CLEAN_CARDS_PERIOD: number = 60 * 1000;

    private static soundEnabled: Map<Severity, boolean>;
    private static systemNotificationEnabled: Map<Severity, boolean>;
    private static playSoundWhenSessionEnd;

    private static lastSentCards: Map<string, number> = new Map();
    private static lastUserAction: number;

    public static init() {
        NotificationDecision.soundEnabled = new Map<Severity, boolean>();
        NotificationDecision.soundEnabled.set(Severity.ALARM, false);
        NotificationDecision.soundEnabled.set(Severity.ACTION, false);
        NotificationDecision.soundEnabled.set(Severity.COMPLIANT, false);
        NotificationDecision.soundEnabled.set(Severity.INFORMATION, false);
        NotificationDecision.playSoundWhenSessionEnd = false;
        NotificationDecision.systemNotificationEnabled = new Map<Severity, boolean>();
        NotificationDecision.systemNotificationEnabled.set(Severity.ALARM, false);
        NotificationDecision.systemNotificationEnabled.set(Severity.ACTION, false);
        NotificationDecision.systemNotificationEnabled.set(Severity.COMPLIANT, false);
        NotificationDecision.systemNotificationEnabled.set(Severity.INFORMATION, false);
        NotificationDecision.lastSentCards = new Map();
        NotificationDecision.lastUserAction = new Date().valueOf();
        NotificationDecision.cleanSentCards();
    }

    public static setLastUserAction(lastUserActionDate: number) {
        NotificationDecision.lastUserAction = lastUserActionDate;
    }

    public static addSentCard(cardId: string) {
        NotificationDecision.lastSentCards.set(cardId, new Date().valueOf());
    }

    public static hasSentCard(cardId: string) {
        return NotificationDecision.lastSentCards.has(cardId);
    }

    public static setSoundEnabledForSeverity(severity, enabled: boolean) {
        this.soundEnabled.set(severity, enabled);
        this.setSoundForSessionEndWhenAtLeastOneSoundForASeverityIsActivated();
    }

    private static setSoundForSessionEndWhenAtLeastOneSoundForASeverityIsActivated() {
        this.playSoundWhenSessionEnd = false;
        for (const soundEnabled of this.soundEnabled.values()) {
            if (soundEnabled) this.playSoundWhenSessionEnd = true;
        }
    }

    public static isPlaySoundWhenSessionEndEnabled() {
        return this.playSoundWhenSessionEnd;
    }

    public static isSoundToBePlayedForCard(card: Card) {
        if (this.lastSentCards.get(card.id) && !this.checkSentCardIsRecentlyPublished(card))
            return false; // no sound as the card was sent by the current user
        else {
            return (
                !card.hasBeenRead &&
                this.checkCardHasBeenPublishAfterLastUserAction(card) &&
                this.checkCardIsRecent(card)
            );
        }
    }

    public static isNotificationNeededForChildCard(card: Card) {
        return (
            card.actions?.includes(CardAction.PROPAGATE_READ_ACK_TO_PARENT_CARD) &&
            (!this.lastSentCards.get(card.id) || this.checkSentCardIsRecentlyPublished(card))
        );
    }

    public static isSystemNotificationToBeShownForCard(card: Card) {
        if (this.lastSentCards.get(card.id) && !this.checkSentCardIsRecentlyPublished(card))
            return false; // no sound as the card was sent by the current user
        else {
            return !card.hasBeenRead && this.checkCardIsRecent(card);
        }
    }

    public static isPlaySoundForSeverityEnabled(severity: Severity) {
        return this.soundEnabled.get(severity);
    }

    public static isAtLeastOneSoundActivated(): boolean {
        let activated = false;
        this.soundEnabled.forEach((soundForSeverity) => {
            if (soundForSeverity) activated = true;
        });
        return activated;
    }

    public static setSystemNotificationEnabledForSeverity(severity, enabled: boolean) {
        this.systemNotificationEnabled.set(severity, enabled);
    }

    public static isSystemNotificationEnabledForSeverity(severity) {
        return this.systemNotificationEnabled.get(severity);
    }

    public static isAtLeastOneSystemNotificationSeverityEnabled(): boolean {
        for (const entry of this.systemNotificationEnabled.entries()) {
            if (entry[1]) {
                return true;
            }
        }
        return false;
    }

    private static checkCardHasBeenPublishAfterLastUserAction(card: Card) {
        return card.publishDate + NotificationDecision.ERROR_MARGIN - NotificationDecision.lastUserAction > 0;
    }

    private static checkCardIsRecent(card: Card): boolean {
        return new Date().getTime() - card.publishDate <= NotificationDecision.RECENT_THRESHOLD;
    }

    private static checkSentCardIsRecentlyPublished(card: Card): boolean {
        return card.publishDate > this.lastSentCards.get(card.id) + NotificationDecision.ERROR_MARGIN;
    }

    private static cleanSentCards() {
        const now = new Date().valueOf();
        const toRemove = [];
        NotificationDecision.lastSentCards.forEach((timestamp, cardId) => {
            if (timestamp <= now - NotificationDecision.RECENT_THRESHOLD) toRemove.push(cardId);
        });
        toRemove.forEach((cardId) => NotificationDecision.lastSentCards.delete(cardId));
        setTimeout(() => {
            this.cleanSentCards();
        }, this.CLEAN_CARDS_PERIOD);
    }
}
