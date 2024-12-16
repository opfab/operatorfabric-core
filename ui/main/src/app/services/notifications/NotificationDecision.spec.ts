/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {CardAction, Severity} from '@ofModel/light-card.model';
import {NotificationDecision} from './NotificationDecision';
import {getOneLightCard} from '@tests/helpers';

describe('Sound decisions', () => {
    beforeEach(() => {
        jasmine.clock().install();
        jasmine.clock().mockDate(new Date(100));
        NotificationDecision.init();
    });

    afterEach(() => {
        jasmine.clock().uninstall();
    });

    describe('Check sound and system notification', () => {
        it('Sound and system notification for new card ', (done) => {
            const publishDate = new Date().getTime();
            const card = getOneLightCard({publishDate: publishDate});
            NotificationDecision.setLastUserAction(publishDate - NotificationDecision.ERROR_MARGIN);
            expect(NotificationDecision.isSoundToBePlayedForCard(card)).toBeTrue();
            expect(NotificationDecision.isSystemNotificationToBeShownForCard(card)).toBeTrue();
            done();
        });

        it('No sound and system notification for cards recently sent by the user', (done) => {
            const publishDate = new Date().getTime();
            const card1 = getOneLightCard({publishDate: publishDate});
            const card2 = getOneLightCard({publishDate: publishDate});
            NotificationDecision.setLastUserAction(publishDate - NotificationDecision.ERROR_MARGIN);
            NotificationDecision.addSentCard(card1.id);
            NotificationDecision.addSentCard(card2.id);
            expect(NotificationDecision.isSoundToBePlayedForCard(card1)).toBeFalse();
            expect(NotificationDecision.isSoundToBePlayedForCard(card2)).toBeFalse();
            expect(NotificationDecision.isSystemNotificationToBeShownForCard(card1)).toBeFalse();
            expect(NotificationDecision.isSystemNotificationToBeShownForCard(card2)).toBeFalse();
            done();
        });

        it('No sound and no system notification if card has been read', (done) => {
            const publishDate = new Date().getTime();
            const card = getOneLightCard({
                hasBeenRead: true,
                publishDate: publishDate
            });
            NotificationDecision.setLastUserAction(publishDate - NotificationDecision.ERROR_MARGIN);

            expect(NotificationDecision.isSoundToBePlayedForCard(card)).toBeFalse();
            expect(NotificationDecision.isSystemNotificationToBeShownForCard(card)).toBeFalse();

            done();
        });

        it('No sound and no system notification if card is too old', (done) => {
            const publishDate = new Date().getTime();
            const card = getOneLightCard({
                hasBeenRead: false,
                publishDate: publishDate
            });
            jasmine.clock().tick(NotificationDecision.RECENT_THRESHOLD + NotificationDecision.ERROR_MARGIN);
            expect(NotificationDecision.isSoundToBePlayedForCard(card)).toBeFalse();
            expect(NotificationDecision.isSystemNotificationToBeShownForCard(card)).toBeFalse();
            done();
        });

        it('System notification and NO sound for card sent before last user action', (done) => {
            const publishDate = new Date().getTime() - NotificationDecision.ERROR_MARGIN;
            const card = getOneLightCard({publishDate: publishDate});
            NotificationDecision.setLastUserAction(new Date().getTime());
            expect(NotificationDecision.isSoundToBePlayedForCard(card)).toBeFalse();
            expect(NotificationDecision.isSystemNotificationToBeShownForCard(card)).toBeTrue();
            done();
        });

        it('Sound and system notification if card is in lastSentCards and publish date is after sent timestamp plus error margin', (done) => {
            /* This use case arises when a different user updates a card originally created by the current user.
             * We detect this scenario by verifying that the card's publish date is later than the date when the current user sent the card.
             */
            const publishDate = new Date().getTime();
            let card = getOneLightCard({publishDate: publishDate});
            NotificationDecision.addSentCard(card.id);
            expect(NotificationDecision.isSoundToBePlayedForCard(card)).toBeFalse();
            expect(NotificationDecision.isSystemNotificationToBeShownForCard(card)).toBeFalse();

            jasmine.clock().tick(1000);
            card = {...card, publishDate: new Date().getTime()};
            expect(NotificationDecision.isSoundToBePlayedForCard(card)).toBeFalse();
            expect(NotificationDecision.isSystemNotificationToBeShownForCard(card)).toBeFalse();

            jasmine.clock().tick(NotificationDecision.ERROR_MARGIN);
            card = {...card, publishDate: new Date().getTime()};
            expect(NotificationDecision.isSoundToBePlayedForCard(card)).toBeTrue();
            expect(NotificationDecision.isSystemNotificationToBeShownForCard(card)).toBeTrue();
            done();
        });

        it('Initial setting of sound for severity', (done) => {
            expect(NotificationDecision.isPlaySoundForSeverityEnabled(Severity.ALARM)).toBeFalse();
            expect(NotificationDecision.isPlaySoundForSeverityEnabled(Severity.ACTION)).toBeFalse();
            expect(NotificationDecision.isPlaySoundForSeverityEnabled(Severity.COMPLIANT)).toBeFalse();
            expect(NotificationDecision.isPlaySoundForSeverityEnabled(Severity.INFORMATION)).toBeFalse();
            done();
        });

        it('Enable/disable sound for severity', (done) => {
            NotificationDecision.setSoundEnabledForSeverity(Severity.ALARM, true);
            NotificationDecision.setSoundEnabledForSeverity(Severity.ACTION, true);
            expect(NotificationDecision.isPlaySoundForSeverityEnabled(Severity.ALARM)).toBeTrue();
            expect(NotificationDecision.isPlaySoundForSeverityEnabled(Severity.ACTION)).toBeTrue();
            expect(NotificationDecision.isPlaySoundForSeverityEnabled(Severity.COMPLIANT)).toBeFalse();
            expect(NotificationDecision.isPlaySoundForSeverityEnabled(Severity.INFORMATION)).toBeFalse();
            NotificationDecision.setSoundEnabledForSeverity(Severity.ACTION, false);
            expect(NotificationDecision.isPlaySoundForSeverityEnabled(Severity.ACTION)).toBeFalse();
            done();
        });

        it('Initial setting of system notification for severity', (done) => {
            expect(NotificationDecision.isSystemNotificationEnabledForSeverity(Severity.ALARM)).toBeFalse();
            expect(NotificationDecision.isSystemNotificationEnabledForSeverity(Severity.ACTION)).toBeFalse();
            expect(NotificationDecision.isSystemNotificationEnabledForSeverity(Severity.COMPLIANT)).toBeFalse();
            expect(NotificationDecision.isSystemNotificationEnabledForSeverity(Severity.INFORMATION)).toBeFalse();
            done();
        });

        it('Enable/disable system notification for severity', (done) => {
            NotificationDecision.setSystemNotificationEnabledForSeverity(Severity.ALARM, true);
            NotificationDecision.setSystemNotificationEnabledForSeverity(Severity.ACTION, true);
            expect(NotificationDecision.isSystemNotificationEnabledForSeverity(Severity.ALARM)).toBeTrue();
            expect(NotificationDecision.isSystemNotificationEnabledForSeverity(Severity.ACTION)).toBeTrue();
            expect(NotificationDecision.isSystemNotificationEnabledForSeverity(Severity.COMPLIANT)).toBeFalse();
            expect(NotificationDecision.isSystemNotificationEnabledForSeverity(Severity.INFORMATION)).toBeFalse();
            NotificationDecision.setSystemNotificationEnabledForSeverity(Severity.ACTION, false);
            expect(NotificationDecision.isSystemNotificationEnabledForSeverity(Severity.ACTION)).toBeFalse();
            done();
        });

        it('Check is at least one sound activated', (done) => {
            expect(NotificationDecision.isAtLeastOneSoundActivated()).toBeFalse();
            NotificationDecision.setSoundEnabledForSeverity(Severity.INFORMATION, true);
            expect(NotificationDecision.isAtLeastOneSoundActivated()).toBeTrue();
            done();
        });

        it('Check is at least one system notification activated', (done) => {
            expect(NotificationDecision.isAtLeastOneSystemNotificationSeverityEnabled()).toBeFalse();
            NotificationDecision.setSystemNotificationEnabledForSeverity(Severity.INFORMATION, true);
            expect(NotificationDecision.isAtLeastOneSystemNotificationSeverityEnabled()).toBeTrue();
            done();
        });

        it('Play sound for session end if at least one severity is activated', (done) => {
            expect(NotificationDecision.isPlaySoundWhenSessionEndEnabled()).toBeFalse();
            NotificationDecision.setSoundEnabledForSeverity(Severity.INFORMATION, true);
            expect(NotificationDecision.isPlaySoundWhenSessionEndEnabled()).toBeTrue();
            done();
        });

        it('Clean sent cards after configured retention period', (done) => {
            const publishDate = new Date().getTime();
            const card1 = getOneLightCard({publishDate: publishDate});
            NotificationDecision.addSentCard(card1.id);
            expect(NotificationDecision.hasSentCard(card1.id)).toBeTrue();
            jasmine.clock().tick(NotificationDecision.RECENT_THRESHOLD + NotificationDecision.CLEAN_CARDS_PERIOD);
            expect(NotificationDecision.hasSentCard(card1.id)).toBeFalse();
            done();
        });
    });

    it('Sound and system notification for child card with PROPAGATE_READ_ACK_TO_PARENT_CARD', (done) => {
        const publishDate = new Date().getTime();
        const card = getOneLightCard({
            publishDate: publishDate,
            parentCardId: '123456',
            actions: [CardAction.PROPAGATE_READ_ACK_TO_PARENT_CARD]
        });
        expect(NotificationDecision.isNotificationNeededForChildCard(card)).toBeTrue();
        done();
    });

    it('No Sound and no system notification for child card without PROPAGATE_READ_ACK_TO_PARENT_CARD', (done) => {
        const publishDate = new Date().getTime();
        const card = getOneLightCard({
            publishDate: publishDate,
            parentCardId: '123456',
            actions: []
        });
        expect(NotificationDecision.isNotificationNeededForChildCard(card)).toBeFalse();
        done();
    });

    it('No sound and no system notification if child card with PROPAGATE_READ_ACK_TO_PARENT_CARD is in lastSentCards', (done) => {
        const publishDate = new Date().getTime();
        const card = getOneLightCard({
            publishDate: publishDate,
            parentCardId: '123456',
            actions: [CardAction.PROPAGATE_READ_ACK_TO_PARENT_CARD]
        });
        NotificationDecision.addSentCard(card.id);
        expect(NotificationDecision.isNotificationNeededForChildCard(card)).toBeFalse();
        done();
    });

    it('Sound and system notification if child card with PROPAGATE_READ_ACK_TO_PARENT_CARD is in lastSentCards and publish date is after sent timestamp plus error margin', (done) => {
        /* This use case arises when a different user from the same entity modifies a response child card originally sent by the current user.
         * We detect this scenario by verifying that the card's publish date is later than the date when the current user sent the child card.
         */
        const publishDate = new Date().getTime();
        let card = getOneLightCard({
            publishDate: publishDate,
            parentCardId: '123456',
            actions: [CardAction.PROPAGATE_READ_ACK_TO_PARENT_CARD]
        });
        NotificationDecision.addSentCard(card.id);
        expect(NotificationDecision.isNotificationNeededForChildCard(card)).toBeFalse();

        jasmine.clock().tick(1000);
        card = {...card, publishDate: new Date().getTime()};
        expect(NotificationDecision.isNotificationNeededForChildCard(card)).toBeFalse();

        jasmine.clock().tick(NotificationDecision.ERROR_MARGIN);
        card = {...card, publishDate: new Date().getTime()};
        expect(NotificationDecision.isNotificationNeededForChildCard(card)).toBeTrue();
        done();
    });
});
