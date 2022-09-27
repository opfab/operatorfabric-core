/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.consultation.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import org.apache.http.HttpResponse;
import org.jose4j.lang.JoseException;
import org.opfab.cards.consultation.model.PushSubscriptionData;
import org.opfab.cards.consultation.repositories.PushSubscriptionRepository;
import org.opfab.springtools.error.model.ApiError;
import org.opfab.springtools.error.model.ApiErrorException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.security.NoSuchAlgorithmException;
import java.security.NoSuchProviderException;
import java.security.spec.InvalidKeySpecException;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

@Service
@Slf4j
public class PushNotificationService {
    @Autowired
    private PushSubscriptionRepository pushSubscriptionRepository;

    @Autowired
    private ObjectMapper objectMpper;

    @Value("${webPush.privateKey}")
    private String privateKey;

    @Value("${webPush.publicKey}")
    private String publicKey;

    @Value("${webPush.subject}")
    private String subject;

    public void savePushSubscription(PushSubscriptionData subscription) {
        pushSubscriptionRepository.save(subscription);
    }


    public void deleteSubscription(String endpoint, String login) {
        Optional<PushSubscriptionData> sub = findSubscription(endpoint);
        if (sub.isPresent()) pushSubscriptionRepository.delete(sub.get());
        else log.info("PushSubscription not found for user : " + login + " and endpoint:" + endpoint);
    }

    private Optional<PushSubscriptionData> findSubscription(String endpoint) {
        return pushSubscriptionRepository.findById(endpoint);
    }

    public void pushMessageToSubscriptions(String message) {
        pushSubscriptionRepository.findAll().forEach(s -> pushMessageToSubscription(message, s)
        );
    }

    private void pushMessageToSubscription(String message, PushSubscriptionData subscription) {
        Notification notification;
        PushService pushService = new PushService();
        try {
            pushService.setPrivateKey(privateKey);

            pushService.setPublicKey(publicKey);

            pushService.setSubject(subject);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        } catch (NoSuchProviderException e) {
            throw new RuntimeException(e);
        } catch (InvalidKeySpecException e) {
            throw new RuntimeException(e);
        }


        OpfabNotification notify = new OpfabNotification();
        notify.setTitle("OpFab notification");
        notify.setBody(message);
        Payload payload = new Payload(notify);



        // Create a notification with the endpoint, userPublicKey from the subscription and a custom payload
        try {
            String jsonPayload = objectMpper.writeValueAsString(payload);

            //"{\"notification\":{\"title\":\"OpFab notification\", \"body\":\"" + message +" \"}}";
            log.info("Sending notification to " + subscription.getLogin() + " payload = " + jsonPayload );

            notification = new Notification(
                    subscription.getEndpoint(),
                    subscription.getUserPublicKey(),
                    subscription.getAuthAsBytes(),
                    jsonPayload.getBytes()
            );
            HttpResponse res = pushService.send(notification);
            log.info("Notification sent response " + res);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Data
    @AllArgsConstructor
    class Payload {
        private OpfabNotification notification;
    }

    @Data
    class OpfabNotification {
        String title;
        String body;
    }
}
