/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.cards.consultation;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.jetbrains.annotations.NotNull;
import org.lfenergy.operatorfabric.cards.consultation.model.*;
import org.lfenergy.operatorfabric.cards.model.RecipientEnum;
import org.lfenergy.operatorfabric.cards.model.SeverityEnum;
import org.lfenergy.operatorfabric.utilities.DateTimeUtil;

import java.io.IOException;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.UUID;

import static org.lfenergy.operatorfabric.cards.model.RecipientEnum.*;

@Slf4j
public class TestUtilities {

    private static DateTimeFormatter ZONED_FORMATTER = DateTimeUtil.OUT_DATETIME_FORMAT.withZone(ZoneOffset.UTC);

    public static CardConsultationData createSimpleCard(int processSuffix, Instant publication, Instant start, Instant end) {
        return createSimpleCard(Integer.toString(processSuffix), publication, start, end, null);
    }

    public static CardConsultationData createSimpleCard(int processSuffix, Instant publication, Instant start, Instant end, String login, String... groups) {
        return createSimpleCard(Integer.toString(processSuffix), publication, start, end, login, groups);
    }

    public static CardConsultationData createSimpleCard(String processSuffix, Instant publication, Instant start, Instant end, String login, String... groups) {
        CardConsultationData.CardConsultationDataBuilder cardBuilder = CardConsultationData.builder()
                .processId("PROCESS" + processSuffix)
                .publisher("PUBLISHER")
                .publisherVersion("0")
                .startDate(start.toEpochMilli())
                .endDate(end != null ? end.toEpochMilli() : null)
                .severity(SeverityEnum.ALARM)
                .title(I18nConsultationData.builder().key("title").build())
                .summary(I18nConsultationData.builder().key("summary").build())
                .recipient(computeRecipient(login, groups));

        if(groups!=null && groups.length>0)
            cardBuilder.groupRecipients(Arrays.asList(groups));
        if(login!=null)
            cardBuilder.orphanedUser(login);
        CardConsultationData card = cardBuilder.build();
        prepareCard(card, publication.toEpochMilli());
        return card;
    }

    private static Recipient computeRecipient(String login, String... groups) {
        Recipient userRecipient = null;
        Recipient groupRecipient = null;
        if (login != null){
            userRecipient = RecipientConsultationData.builder()
                    .type(USER)
                    .identity(login)
                    .build();
        }

        if(groups!=null && groups.length>0){
            RecipientConsultationData.RecipientConsultationDataBuilder groupRecipientBuilder = RecipientConsultationData.builder()
                    .type(UNION);
            for(String group:groups)
                groupRecipientBuilder.recipient(RecipientConsultationData.builder().type(GROUP).identity(group).build());
            groupRecipient = groupRecipientBuilder.build();
        }

        if(userRecipient!=null && groupRecipient!=null)
            return RecipientConsultationData.builder().type(UNION).recipient(userRecipient).recipient(groupRecipient).build();
        else if (userRecipient!=null)
            return userRecipient;
        else if (groupRecipient!=null)
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


    public static void prepareCard(CardConsultationData card, Long publishDate) {
        card.setUid(UUID.randomUUID().toString());
        card.setPublishDate(publishDate);
        card.setId(card.getPublisher() + "_" + card.getProcessId());
        card.setShardKey(Math.toIntExact(card.getStartDate() % 24 * 1000));
    }

    @NotNull
    public static String format(Instant now) {
        return ZONED_FORMATTER.format(now);
    }

    @NotNull
    public static String format(Long now) {
        return ZONED_FORMATTER.format(Instant.ofEpochMilli(now));
    }

    public static void logCardOperation(CardOperation o) {
        log.info("op publication: " + format(o.getPublishDate()));
        for (LightCard c : o.getCards()) {
            log.info(String.format("card [%s]: %s", c.getId(), format(c.getStartDate())));
        }
    }
}
