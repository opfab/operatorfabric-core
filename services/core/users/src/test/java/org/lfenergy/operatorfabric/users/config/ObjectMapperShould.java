/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.users.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.lfenergy.operatorfabric.users.application.UnitTestApplication;
import org.lfenergy.operatorfabric.users.config.json.JacksonConfig;
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
 * @author David Binder
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
            "\"groupSet\": [\"user\",\"admin\"]" +
           "}";
        User user = mapper.readValue(stringUser, User.class);
        assertThat(user).isNotNull();
        assertThat(user).isInstanceOf(UserData.class);
        assertThat(user.getLogin()).isEqualTo("jdoe");
        assertThat(user.getFirstName()).isEqualTo("john");
        assertThat(user.getLastName()).isEqualTo("doe");
        assertThat(user.getGroups()).containsExactlyInAnyOrder("user","admin");
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
}
