/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.cards.publication.services;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Singular;
import org.lfenergy.operatorfabric.cards.publication.model.Card;
import org.lfenergy.operatorfabric.cards.publication.model.CardPublicationData;
import org.lfenergy.operatorfabric.cards.publication.model.Recipient;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.stream.Stream;

/**
 * Allows computation of the three following things for an input {@link Recipient} :
 * <ul>
 * <li>The list of concerned groups</li>
 * <li>The list of concerned orphan users (concerned users not belonging to any concerned group)</li>
 * <li>The main recipient if any. The main recipient is the responsible user for the associated card</li>
 * </ul>
 * <p>
 * TODO Load user cache
 */
@Component
public class RecipientProcessor {

    private Random random = new Random();

    private Map<String, List<String>> userCache = new HashMap<>();

    public Map<String, List<String>> getUserCache() {
        return this.userCache;
    }

    public void setUserCache(Map<String, List<String>> userCache) {
        this.userCache = userCache;
    }

    /**
     * <p>Process all recipient data associated with {@link CardPublicationData#getRecipient()} at the time of computation.</p>
     *
     * <p>Updates the argument {@link CardPublicationData}</p>
     *
     * @param card
     * @return
     */
    public ComputedRecipient processAll(CardPublicationData card) {
        Recipient recipient = card.getRecipient();
        ComputedRecipient computedRecipient = processAll(recipient);
        card.setMainRecipient(computedRecipient.getMain());
        card.setUserRecipients(new ArrayList<>(computedRecipient.getUsers()));
        card.setOrphanedUsers(new ArrayList<>(computedRecipient.getOrphanUsers()));
        card.setGroupRecipients(new ArrayList<>(computedRecipient.getGroups()));
        return computedRecipient;
    }

    /**
     * Process all recipient data associated with {{@link Recipient}} at the time of computation.
     *
     * @param recipient
     * @return a structure containing results (groups, orphaned users, main user)
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
                builder = processUser(recipient);
                break;
            case GROUP:
                builder = processGroup(recipient);
                break;
            case UNION:
                builder = processUnion(recipient, processed);
                break;
            case INTERSECT:
                builder = processIntersect(recipient, processed);
                break;
            case FAVORITE:
                builder = processFavorite(recipient, processed);
                break;
            case WEIGHTED:
                builder = processWeighted(recipient, processed);
                break;
            case RANDOM:
                builder = processRandom(processed);
                break;
            default:
                builder = ComputedRecipient.builder();
                break;
        }
        processed.stream()
                .flatMap(pr -> pr.getGroups().stream()).forEach(builder::group);
        ComputedRecipient computedRecipient = builder.build();
        Set<String> orphanUsers = new HashSet<>(computedRecipient.getUsers());
        orphanUsers.removeAll(computedRecipient.getGroups().stream()
                .flatMap(g -> {
                    List<String> users = userCache.get(g);
                    if (users == null)
                        return Stream.empty();
                    else
                        return users.stream();
                })
                .collect(Collectors.toSet()));
        computedRecipient.setOrphanUsers(orphanUsers);
        return computedRecipient;
    }

    /*
     * Computes {@link ComputedRecipient} builder data for a list of recipient using random rule
     *
     * @param processed
     * @return
     */
    private ComputedRecipient.ComputedRecipientBuilder processRandom(List<ComputedRecipient> processed) {
        Set<String> users = processed.stream().flatMap(pr -> pr.getUsers().stream()).collect(Collectors.toSet());
        return ComputedRecipient.builder()
                .users(users)
                .main(users.stream().skip(random.nextInt(users.size())).findFirst().orElse(null));
    }

    /*
     * Computes {@link ComputedRecipient} builder data for a list of recipient using random weighted rule
     *
     * @param  recipient
     * @param processed
     * @return
     */
    private ComputedRecipient.ComputedRecipientBuilder processWeighted(Recipient recipient, List<ComputedRecipient>
            processed) {
        Set<String> users = processed.stream().flatMap(pr -> pr.getUsers().stream()).collect(Collectors.toSet());
        Set<String> randomSource = new HashSet<>(users);

        if (users.contains(recipient.getIdentity()))
            IntStream.range(1, users.size()).forEach(i -> randomSource.add(recipient.getIdentity()));

        return ComputedRecipient.builder()
                .users(users)
                .main(randomSource.stream().skip(random.nextInt(users.size())).findFirst().orElse(null));
    }

    /*
     * Computes {@link ComputedRecipient} builder data for a list of recipient using the favorite rule
     * (the favorite user is main if available)
     *
     * @param  recipient
     * @param processed
     * @return
     */
    private ComputedRecipient.ComputedRecipientBuilder processFavorite(Recipient recipient, List<ComputedRecipient>
            processed) {
        Set<String> users = processed.stream().flatMap(pr -> pr.getUsers().stream()).collect(Collectors.toSet());
        ComputedRecipient.ComputedRecipientBuilder builder = ComputedRecipient.builder()
                .users(users);

        if (users.contains(recipient.getIdentity()))
            builder.main(recipient.getIdentity());
        else
            builder.main(users.stream().skip(random.nextInt(users.size())).findFirst().orElse(null));
        return builder;
    }

    /*
     * Computes {@link ComputedRecipient} builder data for a list of recipient using intersection
     *
     * @param  recipient
     * @param processed
     * @return
     */
    private ComputedRecipient.ComputedRecipientBuilder processIntersect(Recipient recipient, List<ComputedRecipient>
            processed) {
        ComputedRecipient.ComputedRecipientBuilder builder = ComputedRecipient.builder();
        Set<String> users = new HashSet<>();
        processed.stream().findFirst().ifPresent(r -> users.addAll(r.getUsers()));
        processed.stream().skip(1).forEach(r -> users.retainAll(r.getUsers()));
        processed.stream().forEach(r -> builder.groups(r.getGroups()));
        builder.users(users);

        if (recipient.getPreserveMain() != null && recipient.getPreserveMain()) {
            builder.main(
                    processed.stream()
                            .filter(pr -> pr.getMain() != null)
                            .map(ComputedRecipient::getMain)
                            .filter(users::contains)
                            .findFirst()
                            .orElse(null)
            );
        }
        return builder;
    }

    /*
     * Computes {@link ComputedRecipient} builder data for a list of recipient using union
     *
     * @param  recipient
     * @param processed
     * @return
     */
    private ComputedRecipient.ComputedRecipientBuilder processUnion(Recipient recipient, List<ComputedRecipient>
            processed) {
        ComputedRecipient.ComputedRecipientBuilder builder = ComputedRecipient.builder();
        processed.forEach(r -> {
            builder.users(r.getUsers());
            builder.groups(r.getGroups());
        });
        if (recipient.getPreserveMain() != null && recipient.getPreserveMain()) {
            builder.main(
                    processed.stream()
                            .filter(pr -> pr.getMain() != null)
                            .map(ComputedRecipient::getMain)
                            .findFirst()
                            .orElse(null)
            );
        }
        return builder;
    }

    /*
     * Computes {@link ComputedRecipient} builder data for a group recipient
     *
     * @param recipient
     * @return
     */
    private ComputedRecipient.ComputedRecipientBuilder processGroup(Recipient recipient) {
        List<String> users = getUserCache().get(recipient.getIdentity());
        if (users == null)
            users = Collections.emptyList();
        return ComputedRecipient.builder()
                .users(users)
                .group(recipient.getIdentity());
    }

    /*
     * Computes {@link ComputedRecipient} builder data for a user recipient
     *
     * @param recipient
     * @return
     */
    private ComputedRecipient.ComputedRecipientBuilder processUser(Recipient recipient) {
        return ComputedRecipient.builder()
                .user(recipient.getIdentity())
                .main(recipient.getIdentity());
    }

    public static ComputedRecipient empty() {
        return ComputedRecipient.builder().groups(Collections.emptySet()).users(Collections.emptySet()).build();
    }
}

