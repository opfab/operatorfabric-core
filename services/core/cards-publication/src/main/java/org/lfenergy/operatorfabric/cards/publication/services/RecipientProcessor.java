/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.lfenergy.operatorfabric.cards.publication.services;

import org.lfenergy.operatorfabric.cards.publication.model.CardPublicationData;
import org.lfenergy.operatorfabric.cards.publication.model.Recipient;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Allows computation of the three following things for an input {@link Recipient} :
 * <ul>
 * <li>The list of concerned groups</li>
 * <li>The list of concerned orphan users (concerned users not belonging to any concerned group)</li>
 * </ul>
 * <p>
 */
@Component
public class RecipientProcessor {

    /**
     * <p>Processes all recipient data associated with {@link CardPublicationData#getRecipient()} at the time of computation.</p>
     *
     * <p>Updates the argument {@link CardPublicationData}</p>
     *
     * @param card card to compute recipient for
     * @return computed recipient that were affected to card
     */
    public ComputedRecipient processAll(CardPublicationData card) {
        Recipient recipient = card.getRecipient();
        ComputedRecipient computedRecipient = processAll(recipient);
        card.setUserRecipients(new ArrayList<>(computedRecipient.getUsers()));
        card.setGroupRecipients(new ArrayList<>(computedRecipient.getGroups()));
        return computedRecipient;
    }

    /**
     * Processes all recipient data associated with {{@link Recipient}} at the time of computation.
     *
     * @param recipient recipient to compute
     * @return a structure containing results (groups, users, main user)
     */
    public ComputedRecipient processAll(Recipient recipient) {
        if (recipient == null)
            return empty();
        ComputedRecipient.ComputedRecipientBuilder builder;
        List<ComputedRecipient> processed = Collections.emptyList();
        if (recipient.getRecipients() != null && !recipient.getRecipients().isEmpty()) {
            processed = recipient.getRecipients().stream()
                    .map(this::processAll).collect(Collectors.toList());
        }
        switch (recipient.getType()) {
            case USER:
                builder = processUser(recipient).builder();
                break;
            case GROUP:
                builder = processGroup(recipient).builder();
                break;
            case UNION:
                builder = processUnion(processed).builder();
                break;
            default:
                builder = ComputedRecipient.builder();
                break;
        }
        processed.stream().flatMap(pr -> pr.getGroups().stream()).forEach(builder::group);
        ComputedRecipient computedRecipient = builder.build();
        Set<String> orphanUsers = new HashSet<>(computedRecipient.getUsers());
        computedRecipient.setOrphanUsers(orphanUsers);
        return computedRecipient;
    }

    /**
     * Computes {@link ComputedRecipient} builder data for a list of recipient using union
     *
     * @param  recipient
     * @param processed
     * @return
     */
    private ComputedRecipient.BuilderEncapsulator processUnion(List<ComputedRecipient> processed) {
        ComputedRecipient.BuilderEncapsulator result = ComputedRecipient.encapsulatedBuilder();
        ComputedRecipient.ComputedRecipientBuilder builder = result.builder();
        processed.forEach(r -> {
            builder.users(r.getUsers());
            builder.groups(r.getGroups());
        });
        return result;
    }

    /**
     * Computes {@link ComputedRecipient} builder data for a group recipient
     *
     * @param recipient
     * @return
     */
    private ComputedRecipient.BuilderEncapsulator processGroup(Recipient recipient) {
        ComputedRecipient.BuilderEncapsulator result = ComputedRecipient.encapsulatedBuilder();
        result.builder()
            .group(recipient.getIdentity());
        return result;
    }

    /**
     * Computes {@link ComputedRecipient} builder data for a user recipient
     *
     * @param recipient
     * @return
     */
    private ComputedRecipient.BuilderEncapsulator processUser(Recipient recipient) {
        ComputedRecipient.BuilderEncapsulator result = ComputedRecipient.encapsulatedBuilder();
        result.builder().user(recipient.getIdentity());
        return result;
    }

    public static ComputedRecipient empty() {
        return ComputedRecipient.builder().groups(Collections.emptySet()).users(Collections.emptySet()).build();
    }
}

