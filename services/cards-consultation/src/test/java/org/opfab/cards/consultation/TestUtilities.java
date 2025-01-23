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
import lombok.extern.slf4j.Slf4j;
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

@Slf4j
public class TestUtilities {

    private static DateTimeFormatter ZONED_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss").withZone(ZoneOffset.UTC);

    public static String format(Instant now) {
        return ZONED_FORMATTER.format(now);
    }

    public static String format(Long now) {
        return ZONED_FORMATTER.format(Instant.ofEpochMilli(now));
    }

    // as date are stored in millis in mongo , we should not use nanos otherwise
    // we will have different results when comparing date send and date stored 
    // resulting  in failed test 
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
        return createSimpleCardWithOtherProcessState(Integer.toString(processSuffix), publication, start, end, null, null,
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
        Card.CardBuilder cardBuilder = Card.builder()
                .process("PROCESS")
                .processInstanceId("PROCESS" + processSuffix)
                .publisher("PUBLISHER")
                .processVersion("0")
                .state("anyState")
                .startDate(start)
                .endDate(end != null ? end : null)
                .severity(SeverityEnum.ALARM)
                .title(new I18n("title",null))
                .summary(new I18n("summary",null))
                .usersAcks(userAcks != null ? Arrays.asList(userAcks) : null)
                .usersReads(userReads != null ? Arrays.asList(userReads) : null)
                .entitiesAcks(entitiesAcks != null ? Arrays.asList(entitiesAcks) : null);

        if (groups != null && groups.length > 0)
            cardBuilder.groupRecipients(Arrays.asList(groups));
        if (entities != null && entities.length > 0)
            cardBuilder.entityRecipients(Arrays.asList(entities));
        if (login != null)
            cardBuilder.userRecipient(login);
        Card card = cardBuilder.build();
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
        Card.CardBuilder cardBuilder = Card.builder()
                .process("A_PROCESS")
                .processInstanceId("A_PROCESS" + processSuffix)
                .publisher("PUBLISHER")
                .processVersion("0")
                .state("A_State")
                .startDate(start)
                .endDate(end != null ? end : null)
                .severity(SeverityEnum.ALARM)
                .title(new I18n("title",null))
                .summary(new I18n("summary",null))
                .usersAcks(userAcks != null ? Arrays.asList(userAcks) : null)
                .usersReads(userReads != null ? Arrays.asList(userReads) : null)
                .entitiesAcks(entitiesAcks != null ? Arrays.asList(entitiesAcks) : null)
                .externalRecipients(Arrays.asList("externalRecipient1", "externalRecipient2"))
                .hasBeenAcknowledged(false)
                .hasBeenRead(false);

        if (groups != null && groups.length > 0)
            cardBuilder.groupRecipients(Arrays.asList(groups));
        if (entities != null && entities.length > 0)
            cardBuilder.entityRecipients(Arrays.asList(entities));
        if (login != null)
            cardBuilder.userRecipient(login);
        Card card = cardBuilder.build();
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
        card.setUid(UUID.randomUUID().toString());
        card.setPublishDate(publishDate);
        card.setLastUpdate(publishDate);
        card.setId(card.getProcess() + "." + card.getProcessInstanceId());
        card.setProcessStateKey(card.getProcess() + "." + card.getState());
    }


    public static void logCardOperation(CardOperation o) {
        log.info("op publication: " + format(o.card().getPublishDate()));
        if (o.card() != null)
            log.info(String.format("card [%s]: %s", o.card().getId(), format(o.card().getStartDate())));
    }

    /* Utilities regarding archived Cards */

    public static ArchivedCard createSimpleArchivedCard(int processSuffix,
                                                                        String publisher,
                                                                        Instant publication,
                                                                        Instant start,
                                                                        Instant end) {
        return createSimpleArchivedCard(Integer.toString(processSuffix), publisher, publication, start, end, null, null, null);
    }

    public static ArchivedCard createSimpleArchivedCard(int processSuffix,
                                                                        String publisher,
                                                                        Instant publication,
                                                                        Instant start,
                                                                        Instant end,
                                                                        String login,
                                                                        String[] groups,
                                                                        String[] entities) {
        return createSimpleArchivedCard(Integer.toString(processSuffix), publisher, publication, start, end, login, groups, entities);
    }

    public static ArchivedCard createSimpleArchivedCard(String processSuffix,
                                                                        String publisher,
                                                                        Instant publishDate,
                                                                        Instant start,
                                                                        Instant end,
                                                                        String login,
                                                                        String[] groups,
                                                                        String[] entities) {
        ArchivedCard.ArchivedCardBuilder archivedCardBuilder = ArchivedCard.builder()
                .id(UUID.randomUUID().toString())
                .processInstanceId("PROCESS" + processSuffix)
                .process("PROCESS")
                .publishDate(publishDate)
                .publisher(publisher)
                .processVersion("0")
                .startDate(start)
                .state("anyState")
                .processStateKey("PROCESS.anyState")
                .endDate(end != null ? end : null)
                .severity(SeverityEnum.ALARM)
                .title(new I18n("title",null))
                .summary(new I18n("summary",null))
                .publisherType(PublisherTypeEnum.EXTERNAL)
                ;

        if (groups != null && groups.length > 0)
            archivedCardBuilder.groupRecipients(Arrays.asList(groups));
        if (entities != null && entities.length > 0)
            archivedCardBuilder.entityRecipients(Arrays.asList(entities));
        if (login != null)
            archivedCardBuilder.userRecipient(login);
        return archivedCardBuilder.build();
    }


    public static boolean checkIfCardActiveInRange(Card card, Instant rangeStart, Instant rangeEnd) {

        Instant cardStart = card.getStartDate();
        Instant cardEnd = card.getEndDate();

        boolean result = true;

        if (rangeStart != null && rangeEnd != null) {
            result = (
                    //Case 1: Card start date is included in query filter range
                    (cardStart.compareTo(rangeStart) >= 0 && cardStart.compareTo(rangeEnd) <= 0) ||
                            //Case 2: Card start date is before start of query filter range and end date after start of query filter
                            (cardStart.compareTo(rangeStart) <= 0 && cardEnd.compareTo(rangeStart) >= 0)
            );
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
                if (page.getContent().get(i - 1).getPublishDate().isBefore(page.getContent().get(i).getPublishDate())) {
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
        card.setStartDate(startDate);
        card.setGroupRecipients(groups != null ? Arrays.asList(groups) : null);
        card.setEntityRecipients(entities != null ? Arrays.asList(entities) : null);
        card.setEntityRecipientsForInformation(entitiesForInformation != null ? Arrays.asList(entitiesForInformation) : null);
        card.setUserRecipients(Arrays.asList(user));

        if (process != null) card.setProcess(process);
        if (state != null) card.setState(state);
        card.setProcessStateKey(card.getProcess() + "." + card.getState());
        return card;
    }

    public static Card instantiateOneCardConsultationData(){
        return createSimpleCardWithOtherProcessState(1,
                Instant.now().truncatedTo(ChronoUnit.MILLIS),
                Instant.now().plus(1, ChronoUnit.DAYS).truncatedTo(ChronoUnit.MILLIS),
                Instant.now().plus(2, ChronoUnit.DAYS).truncatedTo(ChronoUnit.MILLIS));
    }
}
