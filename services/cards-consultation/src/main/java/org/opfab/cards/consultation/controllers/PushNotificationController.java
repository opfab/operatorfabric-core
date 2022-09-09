/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.consultation.controllers;

import lombok.extern.slf4j.Slf4j;
import org.opfab.cards.consultation.model.PushSubscriptionData;
import org.opfab.cards.consultation.services.PushNotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class PushNotificationController {

    private final PushNotificationService pushNotificationService;

    @Autowired
    public PushNotificationController(PushNotificationService pushNotificationService) {
        this.pushNotificationService = pushNotificationService;
    }

    public void saveSubscription(String login, PushSubscriptionData subscription) {
        subscription.setLogin(login);
        pushNotificationService.savePushSubscription(subscription);
    }

    public void deleteSubscription(String login) {
        pushNotificationService.deleteSubscription(login);
    }

    public void pushMessageToSubscriptions(String message) {
        pushNotificationService.pushMessageToSubscriptions(message);
    }
}
