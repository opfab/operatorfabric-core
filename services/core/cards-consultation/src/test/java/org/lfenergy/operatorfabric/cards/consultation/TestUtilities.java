/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


package org.lfenergy.operatorfabric.cards.consultation;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.jeasy.random.EasyRandom;
import org.jeasy.random.EasyRandomParameters;
import org.jeasy.random.FieldPredicates;
import org.jetbrains.annotations.NotNull;
import org.lfenergy.operatorfabric.cards.consultation.model.*;
import org.lfenergy.operatorfabric.cards.model.RecipientEnum;
import org.lfenergy.operatorfabric.cards.model.SeverityEnum;
import org.springframework.data.domain.Page;

import java.io.IOException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.function.Predicate;
import java.util.stream.Collectors;

import static java.nio.charset.Charset.forName;
import static org.lfenergy.operatorfabric.cards.model.RecipientEnum.*;

@Slf4j
public class TestUtilities {

    private static DateTimeFormatter ZONED_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss").withZone(ZoneOffset.UTC);

    @NotNull
    public static String format(Instant now) {
        return ZONED_FORMATTER.format(now);
    }

    @NotNull
    public static String format(Long now) {
        return ZONED_FORMATTER.format(Instant.ofEpochMilli(now));
    }

    /* Utilities regarding Cards */

    public static CardConsultationData createSimpleCard(int processSuffix, Instant publication, Instant start, Instant end) {
        return createSimpleCard(Integer.toString(processSuffix), publication, start, end, null, null, null);
    }

    public static CardConsultationData createSimpleCard(int processSuffix, Instant publication, Instant start, Instant end, String login, String[] groups, String[] entities) {
        return createSimpleCard(Integer.toString(processSuffix), publication, start, end, login, groups, entities);
    }

    public static CardConsultationData createSimpleCard(String processSuffix
            , Instant publication
            , Instant start
            , Instant end
            , String login, String[] groups, String[] entities) {
        CardConsultationData.CardConsultationDataBuilder cardBuilder = CardConsultationData.builder()
                .processId("PROCESS" + processSuffix)
                .publisher("PUBLISHER")
                .publisherVersion("0")
                .startDate(start)
                .endDate(end != null ? end : null)
                .severity(SeverityEnum.ALARM)
                .title(I18nConsultationData.builder().key("title").build())
                .summary(I18nConsultationData.builder().key("summary").build())
                .recipient(computeRecipient(login, groups));

        if (groups != null && groups.length > 0)
            cardBuilder.groupRecipients(Arrays.asList(groups));
        if (entities != null && entities.length > 0)
            cardBuilder.entityRecipients(Arrays.asList(entities));
        if (login != null)
            cardBuilder.orphanedUser(login);
        CardConsultationData card = cardBuilder.build();
        prepareCard(card, publication);
        return card;
    }

    private static Recipient computeRecipient(String login, String... groups) {
        Recipient userRecipient = null;
        Recipient groupRecipient = null;
        if (login != null) {
            userRecipient = RecipientConsultationData.builder()
                    .type(USER)
                    .identity(login)
                    .build();
        }

        if (groups != null && groups.length > 0) {
            RecipientConsultationData.RecipientConsultationDataBuilder groupRecipientBuilder = RecipientConsultationData.builder()
                    .type(UNION);
            for (String group : groups)
                groupRecipientBuilder.recipient(RecipientConsultationData.builder().type(GROUP).identity(group).build());
            groupRecipient = groupRecipientBuilder.build();
        }

        if (userRecipient != null && groupRecipient != null)
            return RecipientConsultationData.builder().type(UNION).recipient(userRecipient).recipient(groupRecipient).build();
        else if (userRecipient != null)
            return userRecipient;
        else if (groupRecipient != null)
            return groupRecipient;

        return RecipientConsultationData.builder()
                .type(RecipientEnum.DEADEND)
                .build();
    }

    public static CardOperation readCardOperation(ObjectMapper mapper, String s) {
        try {
            return mapper.readValue(s, CardOperationConsultationData.class);
        } catch (IOException e) {
            log.error(String.format("Unable to delinearize %s", CardOperationConsultationData.class.getSimpleName()), e);
            return null;
        }
    }


    public static void prepareCard(CardConsultationData card, Instant publishDate) {
        card.setUid(UUID.randomUUID().toString());
        card.setPublishDate(publishDate);
        card.setId(card.getPublisher() + "_" + card.getProcessId());
        card.setShardKey(Math.toIntExact(card.getStartDate().toEpochMilli() % 24 * 1000));
    }

    public static void logCardOperation(CardOperation o) {
        log.info("op publication: " + format(o.getPublishDate()));
        for (LightCard c : o.getCards()) {
            log.info(String.format("card [%s]: %s", c.getId(), format(c.getStartDate())));
        }
    }

    /* Utilities regarding archived Cards */

    public static ArchivedCardConsultationData createSimpleArchivedCard(int processSuffix, String publisher, Instant publication, Instant start, Instant end) {
        return createSimpleArchivedCard(Integer.toString(processSuffix), publisher, publication, start, end, null, null, null);
    }

    public static ArchivedCardConsultationData createSimpleArchivedCard(int processSuffix, String publisher, Instant publication, Instant start, Instant end, String login, String[] groups, String[] entities) {
        return createSimpleArchivedCard(Integer.toString(processSuffix), publisher, publication, start, end, login, groups, entities);
    }

    public static ArchivedCardConsultationData createSimpleArchivedCard(String processSuffix, String publisher, Instant publication, Instant start, Instant end, String login, String[] groups, String[] entities) {
        ArchivedCardConsultationData.ArchivedCardConsultationDataBuilder archivedCardBuilder = ArchivedCardConsultationData.builder()
                .processId("PROCESS" + processSuffix)
                .publisher(publisher)
                .publisherVersion("0")
                .startDate(start)
                .endDate(end != null ? end : null)
                .severity(SeverityEnum.ALARM)
                .title(I18nConsultationData.builder().key("title").build())
                .summary(I18nConsultationData.builder().key("summary").build())
                .recipient(computeRecipient(login, groups));

        if (groups != null && groups.length > 0)
            archivedCardBuilder.groupRecipients(Arrays.asList(groups));
        if (entities != null && entities.length > 0)
            archivedCardBuilder.entityRecipients(Arrays.asList(entities));
        if (login != null)
            archivedCardBuilder.userRecipient(login);
        ArchivedCardConsultationData archivedCard = archivedCardBuilder.build();
        prepareArchivedCard(archivedCard, publication);
        return archivedCard;
    }

    public static void prepareArchivedCard(ArchivedCardConsultationData archivedCard, Instant publishDate) {
        archivedCard.setId(UUID.randomUUID().toString());
        archivedCard.setPublishDate(publishDate);
        archivedCard.setShardKey(Math.toIntExact(archivedCard.getStartDate().toEpochMilli() % 24 * 1000));
    }

    public static boolean checkIfCardActiveInRange(LightCard card, Instant rangeStart, Instant rangeEnd) {

        Instant cardStart = card.getStartDate();
        Instant cardEnd = card.getEndDate();

        boolean result = true;

        if (rangeStart != null && rangeEnd != null) {
            result = (
                    //Case 1: Card start date is included in query filter range
                    (cardStart.compareTo(rangeStart) >= 0 && cardStart.compareTo(rangeEnd) <= 0) ||
                            //Case 2: Card start date is before start of query filter range
                            (cardStart.compareTo(rangeStart) <= 0 && (cardEnd == null || cardEnd.compareTo(rangeStart) >= 0))
            );
        } else if (rangeStart != null) {
            result = ((cardEnd == null) || cardEnd.compareTo(rangeStart) >= 0);
        } else if (rangeEnd != null) {
            result = cardStart.compareTo(rangeEnd) <= 0;
        }

        return result;
    }

    public static boolean checkIfPageIsSorted(Page<LightCard> page) {

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

    public static boolean checkIfCardsFromPageMeetCriteria(Page<LightCard> page, Predicate<LightCard> criteria) {

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

    /**
     * Returns true if <code>listA</code> contains any of the items in <code>listB</code> :
     *
     * @param listA only cards published earlier than this will be fetched
     * @param listB start of search range
     * @return boolean indicating whether listA contains any of the items in listB
     */
    public static boolean checkIfContainsAny(List<String> listA, List<String> listB) {
        if (listA == null || listA.isEmpty() || listB == null || listB.isEmpty()) {
            return false;
        }
        for (int i = 0; i < listB.size(); i++) {
            if (listA.contains(listB.get(i))) {
                return true;
            }
        }
        return false;
    }

    //TODO Method to check if a flux of pages are sorted
//
    public static CardConsultationData configureRecipientReferencesAndStartDate(CardConsultationData card, String user, Instant startDate, String[] groups, String[] entities) {
        card.setStartDate(startDate);
        card.setGroupRecipients(groups != null ? Arrays.asList(groups) : null);
        card.setEntityRecipients(entities != null ? Arrays.asList(entities) : null);
        card.setUserRecipients(Arrays.asList(user));
        return card;
    }

    public static List<CardConsultationData> instantiateCardConsultationData(EasyRandom generator,
                                                               int cardNumber) {
        return generator.objects(CardConsultationData.class, cardNumber).collect(Collectors.toList());
    }

    public static List<CardConsultationData> instantiateSeveralCardConsultationData(int cardNumber){
        return instantiateCardConsultationData(instantiateEasyRandom(),cardNumber);
    }

    public static CardConsultationData instantiateOneCardConsultationData(){
        return instantiateSeveralCardConsultationData(1).get(0);
    }

    @NotNull
    public static EasyRandom instantiateEasyRandom() {
        LocalDate today = LocalDate.now();
        LocalDate tomorrow = today.plus(1, ChronoUnit.DAYS);

        LocalTime nine = LocalTime.of(9, 0);
        LocalTime fifteen = LocalTime.of(17, 0);

        EasyRandomParameters parameters = new EasyRandomParameters()
                .seed(5467L)
                .objectPoolSize(100)
                .randomizationDepth(3)
                .charset(forName("UTF-8"))
                .timeRange(nine, fifteen)
                .dateRange(today, tomorrow)
                .stringLengthRange(5, 50)
                .collectionSizeRange(1, 10)
                .excludeField(FieldPredicates.named("data"))
                .excludeField(FieldPredicates.named("orphanedUsers"))
                .scanClasspathForConcreteTypes(true)
                .overrideDefaultInitialization(false)
                .ignoreRandomizationErrors(true);

        return new EasyRandom(parameters);
    }
}
