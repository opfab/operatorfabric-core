/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.users.repositories;

import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.opfab.users.application.UnitTestApplication;
import org.opfab.users.model.EntityData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = UnitTestApplication.class)
@ActiveProfiles(profiles = {"default","test"})
@Tag("end-to-end")
@Tag("mongo")
public class EntityRepositoryShould {

    @Autowired
    private EntityRepository entityRepository;

    @BeforeEach
    public void init(){
        EntityData p1, e1, e2;
        p1 = EntityData.builder()
           .id("PARENT1")
           .name("Parent Room 1")
           .description("Parent Room 1")
           .build();
        e1 = EntityData.builder()
           .id("ENTITY1")
           .name("Control Room 1")
           .description("Control Room 1")
           .parents(Collections.singleton("PARENT1"))
           .build();
        e2 = EntityData.builder()
           .id("ENTITY2")
           .name("Control Room 2")
           .description("Control Room 2")
           .build();
        entityRepository.insert(p1);
        entityRepository.insert(e1);
        entityRepository.insert(e2);
    }
    
    @Test
    public void findByParent() {
        List<EntityData> childs =entityRepository.findByParentsContaining("PARENT1");
        assertThat(childs.size()).isEqualTo(1);

        List<EntityData> emptyChilds =entityRepository.findByParentsContaining("ENTITY2");
        assertThat(emptyChilds.size()).isEqualTo(0);
    }

    @AfterEach
    public void clean(){
        entityRepository.deleteAll();
    }
}
