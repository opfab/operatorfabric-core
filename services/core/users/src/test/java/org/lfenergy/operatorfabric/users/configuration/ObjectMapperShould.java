/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.lfenergy.operatorfabric.users.configuration;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.lfenergy.operatorfabric.users.application.UnitTestApplication;
import org.lfenergy.operatorfabric.users.configuration.json.JacksonConfig;
import org.lfenergy.operatorfabric.users.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;
/**
 * <p></p>
 * Created on 06/08/18
 *
 *
 */
@ExtendWith(SpringExtension.class)
@SpringBootTest(classes={UnitTestApplication.class, JacksonConfig.class})
@ActiveProfiles(profiles = {"default","test"})
@Slf4j
public class ObjectMapperShould {

    @Autowired
    private ObjectMapper mapper;

    @Test
    public void readUser() throws IOException {
        String stringUser = "{" +
            "\"login\": \"jdoe\"," +
            "\"firstName\": \"john\"," +
            "\"lastName\": \"doe\"," +
            "\"groups\": [\"user\",\"admin\"]," +
            "\"entities\":[\"entity1\",\"entity2\"]" + 
           "}";
        User user = mapper.readValue(stringUser, User.class);
        assertThat(user).isNotNull();
        assertThat(user).isInstanceOf(UserData.class);
        assertThat(user.getLogin()).isEqualTo("jdoe");
        assertThat(user.getFirstName()).isEqualTo("john");
        assertThat(user.getLastName()).isEqualTo("doe");
        assertThat(user.getGroups()).containsExactlyInAnyOrder("user","admin");
        assertThat(user.getEntities()).containsExactlyInAnyOrder("entity1","entity2");
    }

    @Test
    public void readSimpleUser() throws IOException {
        String stringUser = "{" +
           "\"login\": \"jdoe\"," +
           "\"firstName\": \"john\"," +
           "\"lastName\": \"doe\"" +
           "}";
        SimpleUser user = mapper.readValue(stringUser, SimpleUser.class);
        assertThat(user).isNotNull();
        assertThat(user).isInstanceOf(SimpleUserData.class);
        assertThat(user.getLogin()).isEqualTo("jdoe");
        assertThat(user.getFirstName()).isEqualTo("john");
        assertThat(user.getLastName()).isEqualTo("doe");
    }

    @Test
    public void readGroup() throws IOException {
        String stringGroup = "{" +
           "\"name\": \"testGroup\"," +
           "\"description\": \"A group used for tests\"" +
           "}";
        Group group = mapper.readValue(stringGroup, Group.class);
        assertThat(group).isNotNull();
        assertThat(group).isInstanceOf(GroupData.class);
        assertThat(group.getName()).isEqualTo("testGroup");
        assertThat(group.getDescription()).isEqualTo("A group used for tests");
    }

    @Test
    public void readEntity() throws IOException {
        String stringEntity = "{" +
                "\"id\": \"TESTENTITY\"," +
                "\"name\": \"Test Entity\"," +
                "\"description\": \"An entity used for tests\"," +
                "\"entityAllowedToSendCard\": false" +
                "}";
        Entity entity = mapper.readValue(stringEntity, Entity.class);
        assertThat(entity).isNotNull();
        assertThat(entity).isInstanceOf(EntityData.class);
        assertThat(entity.getId()).isEqualTo("TESTENTITY");
        assertThat(entity.getName()).isEqualTo("Test Entity");
        assertThat(entity.getDescription()).isEqualTo("An entity used for tests");
        assertThat(entity.getEntityAllowedToSendCard()).isFalse();
    }
}
