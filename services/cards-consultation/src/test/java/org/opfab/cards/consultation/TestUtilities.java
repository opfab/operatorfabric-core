/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.consultation;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.opfab.cards.consultation.model.*;
import org.springframework.data.domain.Page;

import java.io.IOException;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.UUID;
import java.util.function.Predicate;

public class TestUtilities {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(TestUtilities.class);

    private static DateTimeFormatter ZONED_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
            .withZone(ZoneOffset.UTC);

    public static String format(Instant now) {
        return ZONED_FORMATTER.format(now);
    }

    public static String format(Long now) {
        return ZONED_FORMATTER.format(Instant.ofEpochMilli(now));
    }

    // as date are stored in millis in mongo , we should not use nanos otherwise
    // we will have different results when comparing date send and date stored
    // resulting in failed test
    public static Instant roundingToMillis(Instant instant) {
        return Instant.ofEpochMilli(instant.toEpochMilli());
    }

    /* Utilities regarding Cards */

    public static Card createSimpleCard(int processSuffix,
            Instant publication,
            Instant start,
            Instant end) {
        return createSimpleCard(Integer.toString(processSuffix), publication, start, end, null, null,
                null, null, null, null);
    }

    public static Card createSimpleCardWithOtherProcessState(int processSuffix,
            Instant publication,
            Instant start,
            Instant end) {
        return createSimpleCardWithOtherProcessState(Integer.toString(processSuffix), publication, start, end, null,
                null,
                null, null, null, null);
    }

    public static Card createSimpleCard(int processSuffix,
            Instant publication,
            Instant start,
            Instant end,
            String[] userAcks,
            String[] userReads) {
        return createSimpleCard(Integer.toString(processSuffix), publication, start, end, null, null,
                null, userAcks, userReads, null);
    }

    public static Card createSimpleCard(int processSuffix,
            Instant publication,
            Instant start,
            Instant end,
            String login,
            String[] groups,
            String[] entities) {
        return createSimpleCard(Integer.toString(processSuffix), publication, start, end, login, groups, entities,
                null, null, null);
    }

    public static Card createSimpleCard(int processSuffix,
            Instant publication,
            Instant start,
            Instant end,
            String login,
            String[] groups,
            String[] entities,
            String[] userAcks,
            String[] userReads,
            String[] entitiesAcks) {
        return createSimpleCard(Integer.toString(processSuffix), publication, start, end, login, groups, entities,
                userAcks, userReads, entitiesAcks);
    }

    public static Card createSimpleCard(String processSuffix,
            Instant publication,
            Instant start,
            Instant end,
            String login,
            String[] groups,
            String[] entities) {
        return createSimpleCard(processSuffix, publication, start, end, login, groups, entities, null,
                null, null);
    }

    public static Card createSimpleCard(String processSuffix,
            Instant publication,
            Instant start,
            Instant end,
            String login,
            String[] groups,
            String[] entities,
            String[] userAcks,
            String[] userReads,
            String[] entitiesAcks) {
        Card card = new Card();
        card.process = "PROCESS";
        card.processInstanceId = "PROCESS" + processSuffix;
        card.publisher = "PUBLISHER";
        card.processVersion = "0";
        card.state = "anyState";
        card.startDate = start;
        card.endDate = end != null ? end : null;
        card.severity = SeverityEnum.ALARM;
        card.title = new I18n("title", null);
        card.summary = new I18n("summary", null);
        card.usersAcks = userAcks != null ? Arrays.asList(userAcks) : null;
        card.usersReads = userReads != null ? Arrays.asList(userReads) : null;
        card.entitiesAcks = entitiesAcks != null ? Arrays.asList(entitiesAcks) : null;

        if (groups != null && groups.length > 0)
            card.groupRecipients = Arrays.asList(groups);
        if (entities != null && entities.length > 0)
            card.entityRecipients = Arrays.asList(entities);
        if (login != null)
            card.userRecipients = Arrays.asList(login);
        prepareCard(card, publication);
        return card;
    }

    public static Card createSimpleCardWithOtherProcessState(String processSuffix,
            Instant publication,
            Instant start,
            Instant end,
            String login,
            String[] groups,
            String[] entities,
            String[] userAcks,
            String[] userReads,
            String[] entitiesAcks) {
        Card card = new Card();
        card.process = "A_PROCESS";
        card.processInstanceId = "A_PROCESS" + processSuffix;
        card.publisher = "PUBLISHER";
        card.processVersion = "0";
        card.state = "A_State";
        card.startDate = start;
        card.endDate = end != null ? end : null;
        card.severity = SeverityEnum.ALARM;
        card.title = new I18n("title", null);
        card.summary = new I18n("summary", null);
        card.usersAcks = userAcks != null ? Arrays.asList(userAcks) : null;
        card.usersReads = userReads != null ? Arrays.asList(userReads) : null;
        card.entitiesAcks = entitiesAcks != null ? Arrays.asList(entitiesAcks) : null;
        card.externalRecipients = Arrays.asList("externalRecipient1", "externalRecipient2");
        card.hasBeenAcknowledged = false;
        card.hasBeenRead = false;

        if (groups != null && groups.length > 0)
            card.groupRecipients = Arrays.asList(groups);
        if (entities != null && entities.length > 0)
            card.entityRecipients = Arrays.asList(entities);
        if (login != null)
            card.userRecipients = Arrays.asList(login);
        prepareCard(card, publication);
        return card;
    }

    public static CardOperation readCardOperation(ObjectMapper mapper, String s) {
        try {
            return mapper.readValue(s, CardOperation.class);
        } catch (IOException e) {
            log.error(String.format("Unable to delinearize %s", CardOperation.class.getSimpleName()), e);
            return null;
        }
    }

    public static void prepareCard(Card card, Instant publishDate) {
        card.uid = UUID.randomUUID().toString();
        card.publishDate = publishDate;
        card.lastUpdate = publishDate;
        card.id = card.process + "." + card.processInstanceId;
        card.processStateKey = card.process + "." + card.state;
    }

    public static void logCardOperation(CardOperation o) {
        log.info("op publication: " + format(o.card().publishDate));
        if (o.card() != null)
            log.info(String.format("card [%s]: %s", o.card().id, format(o.card().startDate)));
    }

    /* Utilities regarding archived Cards */
    public static ArchivedCard createSimpleArchivedCard(int processSuffix,
            String publisher,
            Instant publication,
            Instant start,
            Instant end) {
        return createSimpleArchivedCard(Integer.toString(processSuffix), publisher, publication, start, end, null, null,
                null);
    }

    public static ArchivedCard createSimpleArchivedCard(int processSuffix,
            String publisher,
            Instant publication,
            Instant start,
            Instant end,
            String login,
            String[] groups,
            String[] entities) {
        return createSimpleArchivedCard(Integer.toString(processSuffix), publisher, publication, start, end, login,
                groups, entities);
    }

    public static ArchivedCard createSimpleArchivedCard(String processSuffix,
            String publisher,
            Instant publishDate,
            Instant start,
            Instant end,
            String login,
            String[] groups,
            String[] entities) {
        ArchivedCard archivedCard = new ArchivedCard();
        archivedCard.id = UUID.randomUUID().toString();
        archivedCard.processInstanceId = "PROCESS" + processSuffix;
        archivedCard.process = "PROCESS";
        archivedCard.publishDate = publishDate;
        archivedCard.publisher = publisher;
        archivedCard.processVersion = "0";
        archivedCard.startDate = start;
        archivedCard.state = "anyState";
        archivedCard.processStateKey = "PROCESS.anyState";
        archivedCard.endDate = end != null ? end : null;
        archivedCard.severity = SeverityEnum.ALARM;
        archivedCard.title = new I18n("title", null);
        archivedCard.summary = new I18n("summary", null);
        archivedCard.publisherType = PublisherTypeEnum.EXTERNAL;

        if (groups != null && groups.length > 0)
            archivedCard.groupRecipients = Arrays.asList(groups);
        if (entities != null && entities.length > 0)
            archivedCard.entityRecipients = Arrays.asList(entities);
        if (login != null)
            archivedCard.userRecipients = Arrays.asList(login);
        return archivedCard;
    }

    public static boolean checkIfCardActiveInRange(Card card, Instant rangeStart, Instant rangeEnd) {

        Instant cardStart = card.startDate;
        Instant cardEnd = card.endDate;

        boolean result = true;

        if (rangeStart != null && rangeEnd != null) {
            result = (
            // Case 1: Card start date is included in query filter range
            (cardStart.compareTo(rangeStart) >= 0 && cardStart.compareTo(rangeEnd) <= 0) ||
            // Case 2: Card start date is before start of query filter range and end date
            // after start of query filter
                    (cardStart.compareTo(rangeStart) <= 0 && cardEnd.compareTo(rangeStart) >= 0));
        } else if (rangeStart != null) {
            result = cardStart.compareTo(rangeStart) >= 0 || cardEnd.compareTo(rangeStart) >= 0;
        } else if (rangeEnd != null) {
            result = cardStart.compareTo(rangeEnd) <= 0;
        }

        return result;
    }

    public static boolean checkIfPageIsSorted(Page<Card> page) {

        if (page.getContent() == null || page.getContent().isEmpty()) {
            return true;
        } else if (page.getContent().size() == 1) {
            return true;
        } else {
            for (int i = 1; i < page.getContent().size(); i++) {
                if (page.getContent().get(i - 1).publishDate.isBefore(page.getContent().get(i).publishDate)) {
                    return false;
                }
            }
            return true;
        }
    }

    public static boolean checkIfCardsFromPageMeetCriteria(Page<Card> page, Predicate<Card> criteria) {

        if (page.getContent() == null || page.getContent().isEmpty()) {
            return true;
        } else {
            for (int i = 0; i < page.getContent().size(); i++) {
                if (criteria.negate().test(page.getContent().get(i))) {
                    return false;
                }
            }
            return true;
        }
    }

    public static Card configureRecipientReferencesAndStartDate(Card card,
            String user,
            Instant startDate,
            String[] groups,
            String[] entities,
            String process,
            String state,
            String[] entitiesForInformation) {
        card.startDate = startDate;
        card.groupRecipients = groups != null ? Arrays.asList(groups) : null;
        card.entityRecipients = entities != null ? Arrays.asList(entities) : null;
        card.entityRecipientsForInformation = entitiesForInformation != null ? Arrays.asList(entitiesForInformation)
                : null;
        card.userRecipients = Arrays.asList(user);

        if (process != null)
            card.process = process;
        if (state != null)
            card.state = state;
        card.processStateKey = card.process + "." + card.state;
        return card;
    }

    public static Card instantiateOneCardConsultationData() {
        return createSimpleCardWithOtherProcessState(1,
                Instant.now().truncatedTo(ChronoUnit.MILLIS),
                Instant.now().plus(1, ChronoUnit.DAYS).truncatedTo(ChronoUnit.MILLIS),
                Instant.now().plus(2, ChronoUnit.DAYS).truncatedTo(ChronoUnit.MILLIS));
    }
}
