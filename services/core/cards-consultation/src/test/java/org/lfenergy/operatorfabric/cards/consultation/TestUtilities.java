package org.lfenergy.operatorfabric.cards.consultation;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.jetbrains.annotations.NotNull;
import org.lfenergy.operatorfabric.cards.consultation.model.*;
import org.lfenergy.operatorfabric.cards.consultation.repositories.CardRepositoryShould;
import org.lfenergy.operatorfabric.cards.model.RecipientEnum;
import org.lfenergy.operatorfabric.cards.model.SeverityEnum;
import org.lfenergy.operatorfabric.utilities.DateTimeUtil;

import java.io.IOException;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Slf4j
public class TestUtilities {

    private static DateTimeFormatter ZONED_FORMATTER = DateTimeUtil.OUT_DATETIME_FORMAT.withZone(ZoneOffset.UTC);

    public static CardConsultationData createSimpleCard(int processSuffix, Instant publication, Instant start, Instant end) {
        return createSimpleCard(Integer.toString(processSuffix), publication,start,end);
    }
    public static CardConsultationData createSimpleCard(String processSuffix, Instant publication, Instant start, Instant end) {
        CardConsultationData card = CardConsultationData.builder()
                .processId("PROCESS" + processSuffix)
                .publisher("PUBLISHER")
                .publisherVersion("0")
                .startDate(start.toEpochMilli())
                .endDate(end!=null?end.toEpochMilli():null)
                .severity(SeverityEnum.ALARM)
                .title(I18nConsultationData.builder().key("title").build())
                .summary(I18nConsultationData.builder().key("summary").build())
                .recipient(RecipientConsultationData.builder()
                        .type(RecipientEnum.DEADEND)
                        .build())
                .build();
        prepareCard(card, publication.toEpochMilli());
        return card;
    }

    public static CardOperation readCardOperation(ObjectMapper mapper, String s) {
        try {
            return mapper.readValue(s, CardOperationConsultationData.class);
        } catch (IOException e) {
            log.error(String.format("Unable to delinearize %s",CardOperationConsultationData.class.getSimpleName()),e);
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
            log.info(String.format("card [%s]: %s",c.getId(), format(c.getStartDate())));
        }
    }
}
