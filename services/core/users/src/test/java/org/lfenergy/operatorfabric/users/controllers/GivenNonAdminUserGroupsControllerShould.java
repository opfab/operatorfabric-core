/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.users.controllers;

import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.lfenergy.operatorfabric.users.application.UnitTestApplication;
import org.lfenergy.operatorfabric.users.model.GroupData;
import org.lfenergy.operatorfabric.users.model.UserData;
import org.lfenergy.operatorfabric.users.repositories.GroupRepository;
import org.lfenergy.operatorfabric.users.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.cloud.bus.ServiceMatcher;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;

/**
 *
 *
 * @author Alexandra Guironnet
 */
@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = UnitTestApplication.class)
@ActiveProfiles("test")
@WebAppConfiguration
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@Tag("end-to-end")
@Tag("mongo")
class GivenNonAdminUserGroupsControllerShould {

    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GroupRepository groupRepository;

    @MockBean
    private ServiceMatcher busServiceMatcher;

    @MockBean
    private ApplicationEventPublisher publisher;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @BeforeAll
    void setup() throws Exception {
        this.mockMvc = webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();
    }

    @BeforeEach
    public void init(){
        UserData u1,u2,u3;
        u1 = UserData.builder()
                .login("jcleese")
                .firstName("John")
                .lastName("Cleese")
                .group("Monty Pythons").group("Wanda")
                .build();
        u2 = UserData.builder()
                .login("gchapman")
                .firstName("Graham")
                .lastName("Chapman")
                .group("Monty Pythons")
                .build();
        u3 = UserData.builder()
                .login("kkline")
                .firstName("Kevin")
                .lastName("Kline")
                .group("Wanda")
                .build();
        userRepository.insert(u1);
        userRepository.insert(u2);
        userRepository.insert(u3);
        GroupData g1, g2;
        g1 = GroupData.builder()
                .name("Monty Pythons")
                .description("A bunch of humorous fellows")
                .build();
        g2 = GroupData.builder()
                .name("Wanda")
                .description("The cast of a really successful comedy")
                .build();
        groupRepository.insert(g1);
        groupRepository.insert(g2);
    }

    @AfterEach
    public void clean(){
        userRepository.deleteAll();
        groupRepository.deleteAll();
    }

    @Test
    void fetchAll() throws Exception {
        ResultActions result = mockMvc.perform(get("/groups"));
        result
                .andExpect(status().is(HttpStatus.FORBIDDEN.value()))
        ;
    }

    @Test
    void fetch() throws Exception {
        ResultActions result = mockMvc.perform(get("/groups/Monty Pythons"));
        result
                .andExpect(status().is(HttpStatus.FORBIDDEN.value()))
        ;
    }

    @Test
    void create() throws Exception {
        mockMvc.perform(post("/groups")
                .contentType(MediaType.APPLICATION_JSON_UTF8)
                .content("{" +
                        "\"name\": \"Marx Brothers\","+
                        "\"description\": \"Chico, Groucho and Harpo, forget about Zeppo an Gummo\""+
                        "}")
        )
                .andExpect(status().is(HttpStatus.FORBIDDEN.value()))
        ;

    }

    @Test
    void update() throws Exception {
        mockMvc.perform(put("/groups/Wanda")
                .contentType(MediaType.APPLICATION_JSON_UTF8)
                .content("{" +
                        "\"name\": \"Wanda\","+
                        "\"description\": \"They were not as successful in Fierce Creatures\""+
                        "}")
        )
                .andExpect(status().is(HttpStatus.FORBIDDEN.value()))
        ;
    }



    @Test
    void addGroupToUsers() throws Exception {
        mockMvc.perform(post("/groups/Wanda/users")
                .contentType(MediaType.APPLICATION_JSON_UTF8)
                .content("[\"gchapman\"]")
        )
                .andExpect(status().is(HttpStatus.FORBIDDEN.value()))
        ;
    }



    @Test
    void deleteGroupsFromUsers() throws Exception {
        mockMvc.perform(delete("/groups/Monty Pythons/users")
                .contentType(MediaType.APPLICATION_JSON_UTF8)
                .content("[\"gchapman\"]")
        )
                .andExpect(status().is(HttpStatus.FORBIDDEN.value()))
        ;

    }

    @Test
    void updateGroupsFromUsers() throws Exception {
        mockMvc.perform(put("/groups/Wanda/users")
                .contentType(MediaType.APPLICATION_JSON_UTF8)
                .content("[\"gchapman\"]")
        )
                .andExpect(status().is(HttpStatus.FORBIDDEN.value()))
        ;
    }

}