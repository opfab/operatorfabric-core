package org.lfenergy.operatorfabric.cards.publication.configuration;

import com.google.gson.Gson;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.lfenergy.operatorfabric.cards.model.RecipientEnum;
import org.lfenergy.operatorfabric.cards.model.SeverityEnum;
import org.lfenergy.operatorfabric.cards.publication.application.UnitTestApplication;
import org.lfenergy.operatorfabric.cards.publication.configuration.json.GsonConfig;
import org.lfenergy.operatorfabric.cards.publication.model.CardPublicationData;
import org.lfenergy.operatorfabric.cards.publication.model.I18nPublicationData;
import org.lfenergy.operatorfabric.cards.publication.model.Recipient;
import org.lfenergy.operatorfabric.cards.publication.model.RecipientPublicationData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import javax.validation.Valid;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.core.Is.is;
import static org.lfenergy.operatorfabric.cards.model.RecipientEnum.DEADEND;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes={UnitTestApplication.class, GsonConfig.class})
@ActiveProfiles(profiles = {"native"})
@Slf4j
class GsonConfigShould {
    @Autowired
    private Gson gson;

    @Test
    public void readCard() {
        String stringCard = "{" +
                "\"publishDate\": 123,"+
                "\"summary\": {\"key\": \"Default summary\", \"parameters\": null},"+
                "\"recipient\": {\"type\": \"USER\", \"recipients\": null, \"identity\": \"tso1-operator\"}," +
                "\"data\": {"+
                "\"double\": 123.4,"+
                "\"string\": \"test\","+
                "\"object\": {"+
                "\"double\": 456,"+
                "\"string\": \"test2\""+
                "}"+
                "}"+
                "}";
        CardPublicationData card = gson.fromJson(stringCard, CardPublicationData.class);
        assertThat(card.getData()).isNotNull();
        assertThat(((Map) card.getData()).get("double")).isEqualTo(123.4);
        assertThat(((Map) card.getData()).get("string")).isEqualTo("test");
        assertThat((Map) ((Map) card.getData()).get("object")).isNotNull();
        assertThat(((Map) ((Map) card.getData()).get("object")).get("double")).isEqualTo(456.0);
        assertThat(((Map) ((Map) card.getData()).get("object")).get("string")).isEqualTo("test2");
        assertThat(card.getRecipient().getIdentity()).isEqualTo("tso1-operator");
        assertThat(card.getRecipient().getType()).isEqualTo(RecipientEnum.USER);
        assertThat(card.getSummary().getKey()).isEqualTo("Default summary");
        assertThat(card.getPublishDate().toEpochMilli()).isEqualTo(123);
    }

    @Test
    public void testInstantConversion() {
        Instant now = Instant.now().truncatedTo(ChronoUnit.MILLIS);
        String nowString = gson.toJson(now);
        Instant nowSerialized = gson.fromJson(nowString, Instant.class);
        assertThat(now).isEqualTo(nowSerialized);
    }
}
