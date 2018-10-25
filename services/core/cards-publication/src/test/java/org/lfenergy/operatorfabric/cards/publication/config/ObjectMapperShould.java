/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.cards.publication.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.lfenergy.operatorfabric.cards.publication.application.UnitTestApplication;
import org.lfenergy.operatorfabric.cards.publication.config.json.JacksonConfig;
import org.lfenergy.operatorfabric.cards.publication.model.CardPublicationData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.io.IOException;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * <p></p>
 * Created on 06/08/18
 *
 * @author davibind
 */
@ExtendWith(SpringExtension.class)
@SpringBootTest(classes={UnitTestApplication.class, JacksonConfig.class})
@ActiveProfiles(profiles = {"native"})
@Slf4j
public class ObjectMapperShould {

    @Autowired
    private ObjectMapper mapper;

    @Test
    public void readCard() throws IOException {
        String stringCard = "{" +
                "\"data\": {"+
                  "\"int\": 123,"+
                  "\"string\": \"test\","+
                  "\"object\": {"+
                    "\"int\": 456,"+
                    "\"string\": \"test2\""+
                  "}"+
                "}"+
           "}";
        CardPublicationData card = mapper.readValue(stringCard, CardPublicationData.class);
        assertThat(card.getData()).isNotNull();
        assertThat(((Map) card.getData()).get("int")).isEqualTo(123);
        assertThat(((Map) card.getData()).get("string")).isEqualTo("test");
        assertThat((Map) ((Map) card.getData()).get("object")).isNotNull();
        assertThat(((Map) ((Map) card.getData()).get("object")).get("int")).isEqualTo(456);
        assertThat(((Map) ((Map) card.getData()).get("object")).get("string")).isEqualTo("test2");
    }
}
