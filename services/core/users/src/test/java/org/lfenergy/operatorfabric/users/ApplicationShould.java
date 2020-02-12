/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


package org.lfenergy.operatorfabric.users;

import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.lfenergy.operatorfabric.users.application.UnitTestApplication;
import org.lfenergy.operatorfabric.users.model.GroupData;
import org.lfenergy.operatorfabric.users.model.UserData;
import org.lfenergy.operatorfabric.users.repositories.GroupRepository;
import org.lfenergy.operatorfabric.users.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * <p></p>
 * Created on 14/09/18
 *
 */
//@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = UnitTestApplication.class)
@ActiveProfiles(profiles = {"default","test","test-init"})
@Slf4j
@Tag("end-to-end")
@Tag("mongo")
class ApplicationShould {

    @Autowired
    UserRepository userRepository;
    @Autowired
    GroupRepository groupRepository;

    @AfterEach
    public void clean(){
        userRepository.deleteAll();
        groupRepository.deleteAll();
    }

    @Test
    public void createInitialData(){
        List<UserData> defaultUsers = userRepository.findAll();
        assertThat(defaultUsers).hasSize(1);
        List<GroupData> defaultGroups = groupRepository.findAll();
        assertThat(defaultGroups).hasSize(1);
        assertThat(defaultUsers.get(0).getLogin()).isEqualTo("admin");
        assertThat(defaultGroups.get(0).getName()).isEqualTo("ADMIN");
    }

}
