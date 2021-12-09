/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.users;

import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.opfab.users.application.UnitTestApplication;
import org.opfab.users.model.*;
import org.opfab.users.repositories.GroupRepository;
import org.opfab.users.repositories.EntityRepository;
import org.opfab.users.repositories.PerimeterRepository;
import org.opfab.users.repositories.UserRepository;
import org.opfab.users.model.EntityData;
import org.opfab.users.model.GroupData;
import org.opfab.users.model.UserData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;


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
    @Autowired
    EntityRepository entityRepository;
    @Autowired
    PerimeterRepository perimeterRepository;

    @AfterEach
    public void clean(){
        userRepository.deleteAll();
        groupRepository.deleteAll();
        entityRepository.deleteAll();
        perimeterRepository.deleteAll();
    }

    @Test
    public void createInitialData(){
        List<UserData> defaultUsers = userRepository.findAll();
        assertThat(defaultUsers).hasSize(1);

        List<GroupData> defaultGroups = groupRepository.findAll();

        List<EntityData> defaultEntities = entityRepository.findAll();

        assertThat(defaultGroups).hasSize(1);
        assertThat(defaultUsers.get(0).getLogin()).isEqualTo("admin");
        assertThat(defaultGroups.get(0).getId()).isEqualTo("ADMIN");
        assertThat(defaultGroups.get(0).getName()).isEqualTo("ADMINISTRATORS");

        assertThat(defaultEntities).hasSize(1);
        assertThat(defaultEntities.get(0).getId()).isEqualTo("ENTITYADMIN");
        assertThat(defaultEntities.get(0).getName()).isEqualTo("Entity admin");
        assertThat(defaultEntities.get(0).getDescription()).isEqualTo("The admin entity");
    }

}
