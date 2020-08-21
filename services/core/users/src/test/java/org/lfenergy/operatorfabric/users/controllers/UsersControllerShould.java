/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.lfenergy.operatorfabric.users.controllers;

import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.lfenergy.operatorfabric.users.application.UnitTestApplication;
import org.lfenergy.operatorfabric.users.application.configuration.WithMockOpFabUser;
import org.lfenergy.operatorfabric.users.model.*;
import org.lfenergy.operatorfabric.users.repositories.GroupRepository;
import org.lfenergy.operatorfabric.users.repositories.PerimeterRepository;
import org.lfenergy.operatorfabric.users.repositories.UserRepository;
import org.lfenergy.operatorfabric.users.repositories.UserSettingsRepository;
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
import org.springframework.test.web.servlet.result.MockMvcResultHandlers;
import org.springframework.web.context.WebApplicationContext;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;

/**
 * <p></p>
 * Created on 13/09/18
 *
 *
 */
@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = UnitTestApplication.class)
@ActiveProfiles("test")
@WebAppConfiguration
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@Tag("end-to-end")
@Tag("mongo")
class UsersControllerShould {

    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PerimeterRepository perimeterRepository;

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private UserSettingsRepository userSettingsRepository;

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
    public void init() {
        UserData u1, u2, u3;

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
                .entity("entity1").entity("entity2")
                .build();
        u3 = UserData.builder()
                .login("kkline")
                .firstName("Kevin")
                .lastName("Kline")
                .group("Wanda")
                .entity("entity1")
                .build();
        userRepository.insert(u1);
        userRepository.insert(u2);
        userRepository.insert(u3);
        UserSettingsData us1, us2, us3;
        us1 = UserSettingsData.builder()
                .login("jcleese")
                .description("Once played Sir Lancelot")
                .build();
        us2 = UserSettingsData.builder()
                .login("gchapman")
                .dateFormat("LL")
                .build();
        us3 = UserSettingsData.builder()
                .login("kkline")
                .timeFormat("LT")
                .build();
        userSettingsRepository.insert(us1);
        userSettingsRepository.insert(us2);
        userSettingsRepository.insert(us3);

        GroupData montyPythons, wanda;
        montyPythons = GroupData.builder()
                .id("Monty Pythons")
                .name("Monty Pythons name")
                .description("Monty Pythons description")
                .perimeter("PERIMETER1_1").perimeter("PERIMETER2")
                .build();
        wanda = GroupData.builder()
                .id("Wanda")
                .name("Wanda name")
                .description("Wanda description")
                .perimeter("PERIMETER1_1")
                .build();
        groupRepository.insert(montyPythons);
        groupRepository.insert(wanda);

        PerimeterData p1, p2, p3;
        p1 = PerimeterData.builder()
                .id("PERIMETER1_1")
                .process("process1")
                .stateRights(new HashSet<>(Arrays.asList(new StateRightData("state1", RightsEnum.RECEIVE),
                                                         new StateRightData("state2", RightsEnum.RECEIVEANDWRITE))))
                .build();

        p2 = PerimeterData.builder()
                .id("PERIMETER1_2")
                .process("process1")
                .stateRights(new HashSet<>(Arrays.asList(new StateRightData("state1", RightsEnum.RECEIVEANDWRITE),
                                                         new StateRightData("state2", RightsEnum.WRITE))))
                .build();

        p3 = PerimeterData.builder()
                .id("PERIMETER2")
                .process("process2")
                .stateRights(new HashSet<>(Arrays.asList(new StateRightData("state1", RightsEnum.WRITE),
                                                         new StateRightData("state2", RightsEnum.RECEIVE))))
                .build();

        perimeterRepository.insert(p1);
        perimeterRepository.insert(p2);
        perimeterRepository.insert(p3);
    }

    @AfterEach
    public void clean() {
        userRepository.deleteAll();
        userSettingsRepository.deleteAll();
        perimeterRepository.deleteAll();
        groupRepository.deleteAll();
    }

    @Nested
    @WithMockOpFabUser(login = "testAdminUser", roles = {"ADMIN"})
    class GivenAdminUserUsersControllerShould {

        @Test
        void fetchAll() throws Exception {
            ResultActions result = mockMvc.perform(get("/users"));
            result
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$", hasSize(3)))
            ;
        }

        @Test
        void fetch() throws Exception {
            ResultActions result = mockMvc.perform(get("/users/gchapman"));
            result
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.login", is("gchapman")))
                    .andExpect(jsonPath("$.firstName", is("Graham")))
                    .andExpect(jsonPath("$.lastName", is("Chapman")))
                    .andExpect(jsonPath("$.groups", contains("Monty Pythons")))
                    .andExpect(jsonPath("$['entities'].[0]", equalTo("entity1")))
                    .andExpect(jsonPath("$['entities'].[1]", equalTo("entity2")))
            ;
        }

        @Test
        void fetchWithError() throws Exception {
            ResultActions result = mockMvc.perform(get("/users/tgillian"));
            result
                    .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                    .andExpect(jsonPath("$.message", is(String.format(UsersController.USER_NOT_FOUND_MSG, "tgillian"))))
                    .andExpect(jsonPath("$.errors").doesNotExist())
            ;
        }

        @Test
        void fetchSettings() throws Exception {
            ResultActions result = mockMvc.perform(get("/users/gchapman/settings"));
            result
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.login", is("gchapman")))
                    .andExpect(jsonPath("$.dateFormat", is("LL")))
                    .andExpect(jsonPath("$.timeFormat", is(nullValue())))
            ;
        }

        @Test
        void fetchSettingsWithError() throws Exception {
            ResultActions result = mockMvc.perform(get("/users/tgillian/settings"));
            result
                    .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                    .andExpect(jsonPath("$.message", is(String.format(UsersController.USER_SETTINGS_NOT_FOUND_MSG, "tgillian"))))
                    .andExpect(jsonPath("$.errors").doesNotExist())
            ;
        }

        @Test
        void createSettings() throws Exception {
            mockMvc.perform(put("/users/mpalin/settings")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{" +
                            "\"login\": \"mpalin\"," +
                            "\"dateFormat\": \"LL\"," +
                            "\"timeFormat\": \"LT\"" +
                            "}")
            )
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.login", is("mpalin")))
                    .andExpect(jsonPath("$.dateFormat", is("LL")))
                    .andExpect(jsonPath("$.timeFormat", is("LT")))
                    .andExpect(jsonPath("$.description", is(nullValue())))
            ;

            mockMvc.perform(get("/users/mpalin/settings"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.login", is("mpalin")))
                    .andExpect(jsonPath("$.dateFormat", is("LL")))
                    .andExpect(jsonPath("$.timeFormat", is("LT")))
                    .andExpect(jsonPath("$.description", is(nullValue())))
            ;

            mockMvc.perform(put("/users/mpalin/settings")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{" +
                            "\"login\": \"mpalin\"" +
                            "}")
            )
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.login", is("mpalin")))
                    .andExpect(jsonPath("$.dateFormat", is(nullValue())))
                    .andExpect(jsonPath("$.timeFormat", is(nullValue())))
                    .andExpect(jsonPath("$.description", is(nullValue())))
            ;
            mockMvc.perform(get("/users/mpalin/settings"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.login", is("mpalin")))
                    .andExpect(jsonPath("$.dateFormat", is(nullValue())))
                    .andExpect(jsonPath("$.timeFormat", is(nullValue())))
                    .andExpect(jsonPath("$.description", is(nullValue())))
            ;

        }

        @Test
        void patchSettings() throws Exception {
            mockMvc.perform(put("/users/mpalin/settings")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{" +
                            "\"login\": \"mpalin\"," +
                            "\"dateFormat\": \"LL\"," +
                            "\"timeFormat\": \"LT\"" +
                            "}")
            )
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.login", is("mpalin")))
                    .andExpect(jsonPath("$.dateFormat", is("LL")))
                    .andExpect(jsonPath("$.timeFormat", is("LT")))
                    .andExpect(jsonPath("$.description", is(nullValue())))
            ;

            mockMvc.perform(get("/users/mpalin/settings"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.login", is("mpalin")))
                    .andExpect(jsonPath("$.dateFormat", is("LL")))
                    .andExpect(jsonPath("$.timeFormat", is("LT")))
                    .andExpect(jsonPath("$.description", is(nullValue())))
            ;

            mockMvc.perform(patch("/users/mpalin/settings")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{" +
                            "\"login\": \"mpalin\"," +
                            "\"dateFormat\": \"LLL\"" +
                            "}")
            )
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.login", is("mpalin")))
                    .andExpect(jsonPath("$.dateFormat", is("LLL")))
                    .andExpect(jsonPath("$.timeFormat", is("LT")))
                    .andExpect(jsonPath("$.description", is(nullValue())))
            ;
            mockMvc.perform(get("/users/mpalin/settings"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.login", is("mpalin")))
                    .andExpect(jsonPath("$.dateFormat", is("LLL")))
                    .andExpect(jsonPath("$.timeFormat", is("LT")))
                    .andExpect(jsonPath("$.description", is(nullValue())))
            ;

        }

        @Test
        void patchSettingsIncomplete() throws Exception {

            mockMvc.perform(patch("/users/tjones/settings")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{" +
                            "\"login\": \"mpalin\"," +
                            "\"dateFormat\": \"LLL\"" +
                            "}")
            )
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.login", is("tjones")))
                    .andExpect(jsonPath("$.dateFormat", is("LLL")))
                    .andExpect(jsonPath("$.timeFormat", is(nullValue())))
                    .andExpect(jsonPath("$.description", is(nullValue())))
            ;
            mockMvc.perform(get("/users/tjones/settings"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.login", is("tjones")))
                    .andExpect(jsonPath("$.dateFormat", is("LLL")))
                    .andExpect(jsonPath("$.timeFormat", is(nullValue())))
                    .andExpect(jsonPath("$.description", is(nullValue())))
            ;

        }

        @Test
        void create() throws Exception {
            mockMvc.perform(post("/users")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{" +
                            "\"login\": \"mpalin\"," +
                            "\"firstName\": \"Michael\"," +
                            "\"lastName\": \"Palin\"" +
                            "}")
            )
                    .andExpect(status().isCreated())
                    .andExpect(header().string("Location","/users/mpalin"))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.login", is("mpalin")))
                    .andExpect(jsonPath("$.firstName", is("Michael")))
                    .andExpect(jsonPath("$.lastName", is("Palin")))
            ;

            mockMvc.perform(get("/users"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$", hasSize(4)));

            mockMvc.perform(get("/users/mpalin"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.login", is("mpalin")))
                    .andExpect(jsonPath("$.firstName", is("Michael")))
                    .andExpect(jsonPath("$.lastName", is("Palin")))
            ;

            mockMvc.perform(put("/users/tgillian")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{" +
                            "\"login\": \"tgillian\","+
                            "\"firstName\": \"Terry\","+
                            "\"lastName\": \"Gillian\""+
                            "}")
            )
                    .andExpect(status().is(HttpStatus.CREATED.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.login", is("tgillian")))
                    .andExpect(jsonPath("$.firstName", is("Terry")))
                    .andExpect(jsonPath("$.lastName", is("Gillian")))
            ;

        }

        @Test
        void createWithDuplicateError() throws Exception {

            mockMvc.perform(get("/users/kkline"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.login", is("kkline")))
                    .andExpect(jsonPath("$.firstName", is("Kevin")))
                    .andExpect(jsonPath("$.lastName", is("Kline")))
            ;

            mockMvc.perform(get("/users"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$", hasSize(3)));

            mockMvc.perform(get("/users/kkline"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.login", is("kkline")))
                    .andExpect(jsonPath("$.firstName", is("Kevin")))
                    .andExpect(jsonPath("$.lastName", is("Kline")))
            ;

        }

        @Test
        void update() throws Exception {
            mockMvc.perform(put("/users/kkline")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{" +
                            "\"login\": \"kkline\"," +
                            "\"firstName\": \"Kevin\"," +
                            "\"lastName\": \"KLINE\"" +
                            "}")
            )
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.login", is("kkline")))
                    .andExpect(jsonPath("$.firstName", is("Kevin")))
                    .andExpect(jsonPath("$.lastName", is("KLINE")))
            ;

            mockMvc.perform(get("/users"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$", hasSize(3)));

            mockMvc.perform(get("/users/kkline"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.login", is("kkline")))
                    .andExpect(jsonPath("$.firstName", is("Kevin")))
                    .andExpect(jsonPath("$.lastName", is("KLINE")))
            ;

        }

        @Test
        void updateWithNotFoundError() throws Exception {

            mockMvc.perform(get("/users/unknownSoFar"))
                    .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                    .andExpect(jsonPath("$.message", is(String.format(UsersController.USER_NOT_FOUND_MSG, "unknownSoFar"))))
                    .andExpect(jsonPath("$.errors").doesNotExist())
            ;

            mockMvc.perform(get("/users/unknownSoFar"))
                    .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                    .andExpect(jsonPath("$.message", is(String.format(UsersController.USER_NOT_FOUND_MSG, "unknownSoFar"))))
                    .andExpect(jsonPath("$.errors").doesNotExist())
            ;
        }

        @Test
        void updateWithMismatchedError() throws Exception {

            mockMvc.perform(get("/users/kkline"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.login", is("kkline")))
                    .andExpect(jsonPath("$.firstName", is("Kevin")))
                    .andExpect(jsonPath("$.lastName", is("Kline")))
            ;

            mockMvc.perform(put("/users/kkline")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{" +
                            "\"login\": \"mpalin\"," +
                            "\"firstName\": \"Kevin\"," +
                            "\"lastName\": \"Palin\"" +
                            "}")
            )
                    .andExpect(status().is(HttpStatus.BAD_REQUEST.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.BAD_REQUEST.name())))
                    .andExpect(jsonPath("$.message", is(UsersController.NO_MATCHING_USER_NAME_MSG)))
                    .andExpect(jsonPath("$.errors").doesNotExist());

            mockMvc.perform(get("/users/kkline"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.login", is("kkline")))
                    .andExpect(jsonPath("$.firstName", is("Kevin")))
                    .andExpect(jsonPath("$.lastName", is("Kline")))
            ;

        }

        @Test
        void updateWithMismatchedAndNotFoundError() throws Exception {

            mockMvc.perform(get("/users/unknownSoFar"))
                    .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                    .andExpect(jsonPath("$.message", is(String.format(UsersController.USER_NOT_FOUND_MSG, "unknownSoFar"))))
                    .andExpect(jsonPath("$.errors").doesNotExist())
            ;

            mockMvc.perform(put("/users/unknownSoFar")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{" +
                            "\"login\": \"someOtherLogin\"," +
                            "\"firstName\": \"John\"," +
                            "\"lastName\": \"Doe\"" +
                            "}")
            )
                    .andExpect(status().is(HttpStatus.BAD_REQUEST.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.BAD_REQUEST.name())))
                    .andExpect(jsonPath("$.message", is(String.format(UsersController.NO_MATCHING_USER_NAME_MSG, "unknownSoFar"))))
                    .andExpect(jsonPath("$.errors").doesNotExist())
            ;

            mockMvc.perform(get("/users/unknownSoFar"))
                    .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                    .andExpect(jsonPath("$.message", is(String.format(UsersController.USER_NOT_FOUND_MSG, "unknownSoFar"))))
                    .andExpect(jsonPath("$.errors").doesNotExist())
            ;

        }

        @Test
        void fetchAllPerimetersForAUser() throws Exception {
            //User jcleese is part of Monty Pythons and Wanda groups.
            //Monty Pythons group has perimeters PERIMETER1_1 and PERIMETER2.
            //Wanda group has perimeters PERIMETER1_1. We must not have duplicate perimeters in results
            ResultActions result1 = mockMvc.perform(get("/users/jcleese/perimeters"));
            result1
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$", hasSize(2)))
                    .andExpect(jsonPath("$.[?(" +
                            "@.id == \"PERIMETER1_1\" && " +
                            "@.process == \"process1\" && " +
                            "@.stateRights.length() == 2 && " +
                            "(@.stateRights.[0].state==\"state1\" && @.stateRights.[0].right==\"Receive\" || @.stateRights.[0].state==\"state2\" && @.stateRights.[0].right==\"ReceiveAndWrite\") && " +
                            "(@.stateRights.[1].state==\"state1\" && @.stateRights.[1].right==\"Receive\" || @.stateRights.[1].state==\"state2\" && @.stateRights.[1].right==\"ReceiveAndWrite\") &&" +
                            "@.stateRights.[0] != @.stateRights.[1])]").exists())
                    .andExpect(jsonPath("$.[?(" +
                            "@.id == \"PERIMETER2\" && " +
                            "@.process == \"process2\" && " +
                            "@.stateRights.length() == 2 && " +
                            "(@.stateRights.[0].state==\"state1\" && @.stateRights.[0].right==\"Write\" || @.stateRights.[0].state==\"state2\" && @.stateRights.[0].right==\"Receive\") && " +
                            "(@.stateRights.[1].state==\"state1\" && @.stateRights.[1].right==\"Write\" || @.stateRights.[1].state==\"state2\" && @.stateRights.[1].right==\"Receive\") &&" +
                            "@.stateRights.[0] != @.stateRights.[1])]").exists());

            //User gchapman is part of Monty Pythons group whose perimeters are PERIMETER1_1 and PERIMETER2.
            ResultActions result2 = mockMvc.perform(get("/users/gchapman/perimeters"));
            result2
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$", hasSize(2)))
                    .andExpect(jsonPath("$.[?(" +
                            "@.id == \"PERIMETER1_1\" && " +
                            "@.process == \"process1\" && " +
                            "@.stateRights.length() == 2 && " +
                            "(@.stateRights.[0].state==\"state1\" && @.stateRights.[0].right==\"Receive\" || @.stateRights.[0].state==\"state2\" && @.stateRights.[0].right==\"ReceiveAndWrite\") && " +
                            "(@.stateRights.[1].state==\"state1\" && @.stateRights.[1].right==\"Receive\" || @.stateRights.[1].state==\"state2\" && @.stateRights.[1].right==\"ReceiveAndWrite\") &&" +
                            "@.stateRights.[0] != @.stateRights.[1])]").exists())
                    .andExpect(jsonPath("$.[?(" +
                            "@.id == \"PERIMETER2\" && " +
                            "@.process == \"process2\" && " +
                            "@.stateRights.length() == 2 && " +
                            "(@.stateRights.[0].state==\"state1\" && @.stateRights.[0].right==\"Write\" || @.stateRights.[0].state==\"state2\" && @.stateRights.[0].right==\"Receive\") && " +
                            "(@.stateRights.[1].state==\"state1\" && @.stateRights.[1].right==\"Write\" || @.stateRights.[1].state==\"state2\" && @.stateRights.[1].right==\"Receive\") &&" +
                            "@.stateRights.[0] != @.stateRights.[1])]").exists());

            //User kkline is part of Wanda group whose perimeter is PERIMETER1_1.
            ResultActions result3 = mockMvc.perform(get("/users/kkline/perimeters"));
            result3
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$.[?(" +
                            "@.id == \"PERIMETER1_1\" && " +
                            "@.process == \"process1\" && " +
                            "@.stateRights.length() == 2 && " +
                            "(@.stateRights.[0].state==\"state1\" && @.stateRights.[0].right==\"Receive\" || @.stateRights.[0].state==\"state2\" && @.stateRights.[0].right==\"ReceiveAndWrite\") && " +
                            "(@.stateRights.[1].state==\"state1\" && @.stateRights.[1].right==\"Receive\" || @.stateRights.[1].state==\"state2\" && @.stateRights.[1].right==\"ReceiveAndWrite\") &&" +
                            "@.stateRights.[0] != @.stateRights.[1])]").exists());
        }

        @Test
        void fetchAllPerimetersForAUserWithError() throws Exception {
            ResultActions result = mockMvc.perform(get("/users/tgillian/perimeters"));
            result
                    .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                    .andExpect(jsonPath("$.message", is(String.format(UsersController.USER_NOT_FOUND_MSG, "tgillian"))))
                    .andExpect(jsonPath("$.errors").doesNotExist())
            ;
        }

        @Test
        void deleteUserWithNotFoundError() throws Exception {

            mockMvc.perform(get("/users/unknownUserSoFar"))
                    .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                    .andExpect(jsonPath("$.message", is(String.format(UsersController.USER_NOT_FOUND_MSG, "unknownUserSoFar"))))
                    .andExpect(jsonPath("$.errors").doesNotExist())
            ;

            mockMvc.perform(delete("/users/unknownUserSoFar")
                    .contentType(MediaType.APPLICATION_JSON)
            )
                    .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                    .andExpect(jsonPath("$.message", is(String.format(UsersController.USER_NOT_FOUND_MSG, "unknownUserSoFar"))))
                    .andExpect(jsonPath("$.errors").doesNotExist())
            ;

            mockMvc.perform(get("/users/unknownUserSoFar"))
                    .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                    .andExpect(jsonPath("$.message", is(String.format(UsersController.USER_NOT_FOUND_MSG, "unknownUserSoFar"))))
                    .andExpect(jsonPath("$.errors").doesNotExist())
            ;
        }

        @Test
        void deleteUserWithErrorForbiddenToDeleteOneself() throws Exception {
            mockMvc.perform(delete("/users/testAdminUser")
                    .contentType(MediaType.APPLICATION_JSON)
            )
                    .andExpect(status().isForbidden())
            ;
        }

        @Test
        void deleteUser() throws Exception {
            List<UserData> pythons = userRepository.findByGroupSetContaining("Monty Pythons");
            assertThat(pythons.size()).isEqualTo(2);

            List<UserData> wanda = userRepository.findByGroupSetContaining("Wanda");
            assertThat(wanda.size()).isEqualTo(2);

            assertThat(userRepository.findById("jcleese")).isNotEmpty();

            // jcleese user is part of Monty Pythons group and Wanda group
            mockMvc.perform(delete("/users/jcleese")
                    .contentType(MediaType.APPLICATION_JSON)
            )
                    .andExpect(status().isOk())
            ;

            pythons = userRepository.findByGroupSetContaining("Monty Pythons");
            assertThat(pythons.size()).isEqualTo(1);

            wanda = userRepository.findByGroupSetContaining("Wanda");
            assertThat(wanda.size()).isEqualTo(1);

            assertThat(userRepository.findById("jcleese")).isEmpty();
        }
    }

    @Nested
    @WithMockOpFabUser(login="gchapman", roles = { "Monty Pythons" })
    class GivenNonAdminUserUsersControllerShould {
        @Test
        void fetchAll() throws Exception {
            ResultActions result = mockMvc.perform(get("/users"));
            result
                    .andExpect(status().is(HttpStatus.FORBIDDEN.value()))
            ;
        }

        @Test
        void fetch() throws Exception {
            ResultActions result = mockMvc.perform(get("/users/jcleese"));
            result
                    .andExpect(status().is(HttpStatus.FORBIDDEN.value()))
            ;
        }

        @Test
        void fetchOwnData() throws Exception {
            ResultActions result = mockMvc.perform(get("/users/gchapman"));
            result
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.login", is("gchapman")))
                    .andExpect(jsonPath("$.firstName", is("Graham")))
                    .andExpect(jsonPath("$.lastName", is("Chapman")))
                    .andExpect(jsonPath("$.groups", contains("Monty Pythons")))
                    .andExpect(jsonPath("$['entities'].[0]", equalTo("entity1")))
                    .andExpect(jsonPath("$['entities'].[1]", equalTo("entity2")))
            ;
        }

        @Test
        void fetchAllPerimetersForAnotherUser() throws Exception {
            ResultActions result = mockMvc.perform(get("/users/jcleese/perimeters"));
            result
                    .andExpect(status().is(HttpStatus.FORBIDDEN.value()))
            ;
        }

        @Test
        void fetchAllPerimetersForOwnData() throws Exception {
            ResultActions result = mockMvc.perform(get("/users/gchapman/perimeters"));
            result
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$", hasSize(2)))
                    .andExpect(jsonPath("$.[?(" +
                            "@.id == \"PERIMETER1_1\" && " +
                            "@.process == \"process1\" && " +
                            "@.stateRights.length() == 2 && " +
                            "(@.stateRights.[0].state==\"state1\" && @.stateRights.[0].right==\"Receive\" || @.stateRights.[0].state==\"state2\" && @.stateRights.[0].right==\"ReceiveAndWrite\") && " +
                            "(@.stateRights.[1].state==\"state1\" && @.stateRights.[1].right==\"Receive\" || @.stateRights.[1].state==\"state2\" && @.stateRights.[1].right==\"ReceiveAndWrite\") &&" +
                            "@.stateRights.[0] != @.stateRights.[1])]").exists())
                    .andExpect(jsonPath("$.[?(" +
                            "@.id == \"PERIMETER2\" && " +
                            "@.process == \"process2\" && " +
                            "@.stateRights.length() == 2 && " +
                            "(@.stateRights.[0].state==\"state1\" && @.stateRights.[0].right==\"Write\" || @.stateRights.[0].state==\"state2\" && @.stateRights.[0].right==\"Receive\") && " +
                            "(@.stateRights.[1].state==\"state1\" && @.stateRights.[1].right==\"Write\" || @.stateRights.[1].state==\"state2\" && @.stateRights.[1].right==\"Receive\") &&" +
                            "@.stateRights.[0] != @.stateRights.[1])]").exists());
        }

        @Test
        void create() throws Exception {
            mockMvc.perform(post("/users")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{" +
                            "\"login\": \"mpalin\","+
                            "\"firstName\": \"Michael\","+
                            "\"lastName\": \"Palin\""+
                            "}")
            )
                    .andExpect(status().is(HttpStatus.FORBIDDEN.value()))
            ;

        }

        @Test
        void update() throws Exception {
            mockMvc.perform(put("/users/kkline")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{" +
                            "\"login\": \"kkline\","+
                            "\"firstName\": \"Kevin\","+
                            "\"lastName\": \"KLINE\""+
                            "}")
            )
                    .andExpect(status().is(HttpStatus.FORBIDDEN.value()))
            ;

        }

        @Test
        void updateOwnData() throws Exception {
            mockMvc.perform(put("/users/gchapman")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{" +
                            "\"login\": \"gchapman\","+
                            "\"firstName\": \"GRAHAM\","+
                            "\"lastName\": \"CHAPMAN\""+
                            "}")
            )
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.login", is("gchapman")))
                    .andExpect(jsonPath("$.firstName", is("GRAHAM")))
                    .andExpect(jsonPath("$.lastName", is("CHAPMAN")))
            ;


        }


        @Test
        @WithMockOpFabUser(login="unknownSoFar", roles = { "" })
        void updateOwnDataWithNotFoundError() throws Exception {

            mockMvc.perform(get("/users/unknownSoFar"))
                    .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                    .andExpect(jsonPath("$.message", is(String.format(UsersController.USER_NOT_FOUND_MSG, "unknownSoFar"))))
                    .andExpect(jsonPath("$.errors").doesNotExist())
            ;

            mockMvc.perform(get("/users/unknownSoFar"))
                    .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                    .andExpect(jsonPath("$.message", is(String.format(UsersController.USER_NOT_FOUND_MSG, "unknownSoFar"))))
                    .andExpect(jsonPath("$.errors").doesNotExist())
            ;
        }

        @Test
        void updateOwnDataWithMismatchedError() throws Exception {

            mockMvc.perform(get("/users/gchapman"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.login", is("gchapman")))
                    .andExpect(jsonPath("$.firstName", is("Graham")))
                    .andExpect(jsonPath("$.lastName", is("Chapman")))
            ;

            mockMvc.perform(put("/users/gchapman")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{" +
                            "\"login\": \"mpalin\","+
                            "\"firstName\": \"Michael\","+
                            "\"lastName\": \"Palin\""+
                            "}")
            )
                    .andExpect(status().is(HttpStatus.BAD_REQUEST.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.BAD_REQUEST.name())))
                    .andExpect(jsonPath("$.message", is(UsersController.NO_MATCHING_USER_NAME_MSG)))
                    .andExpect(jsonPath("$.errors").doesNotExist());

        }

        @Test
        @WithMockOpFabUser(login="unknownSoFar", roles = { "" })
        void updateOwnDataWithMismatchedAndNotFoundError() throws Exception {

            mockMvc.perform(get("/users/unknownSoFar"))
                    .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                    .andExpect(jsonPath("$.message", is(String.format(UsersController.USER_NOT_FOUND_MSG, "unknownSoFar"))))
                    .andExpect(jsonPath("$.errors").doesNotExist())
            ;

            mockMvc.perform(put("/users/unknownSoFar")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{" +
                            "\"login\": \"someOtherLogin\","+
                            "\"firstName\": \"John\","+
                            "\"lastName\": \"Doe\""+
                            "}")
            )
                    .andExpect(status().is(HttpStatus.BAD_REQUEST.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.BAD_REQUEST.name())))
                    .andExpect(jsonPath("$.message", is(String.format(UsersController.NO_MATCHING_USER_NAME_MSG, "unknownSoFar"))))
                    .andExpect(jsonPath("$.errors").doesNotExist())
            ;

            mockMvc.perform(get("/users/unknownSoFar"))
                    .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                    .andExpect(jsonPath("$.message", is(String.format(UsersController.USER_NOT_FOUND_MSG, "unknownSoFar"))))
                    .andExpect(jsonPath("$.errors").doesNotExist())
            ;

        }

        @Test
        void fetchSettings() throws Exception {
            ResultActions result = mockMvc.perform(get("/users/gchapman/settings"));
            result
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.login", is("gchapman")))
                    .andExpect(jsonPath("$.dateFormat", is("LL")))
                    .andExpect(jsonPath("$.timeFormat", is(nullValue())))
            ;
        }

        @Test
        void fetchSettingsWithError() throws Exception {
            ResultActions result = mockMvc.perform(get("/users/kkline/settings"));
            result
                    .andDo(MockMvcResultHandlers.log())
                    .andExpect(status().is(HttpStatus.FORBIDDEN.value()))
            ;
        }

        @Test
        void createSettings() throws Exception {
            mockMvc.perform(put("/users/gchapman/settings")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{" +
                            "\"login\": \"gchapman\"," +
                            "\"dateFormat\": \"LL\"," +
                            "\"timeFormat\": \"LT\"" +
                            "}")
            )
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.login", is("gchapman")))
                    .andExpect(jsonPath("$.dateFormat", is("LL")))
                    .andExpect(jsonPath("$.timeFormat", is("LT")))
                    .andExpect(jsonPath("$.description", is(nullValue())))
            ;

            mockMvc.perform(get("/users/gchapman/settings"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.login", is("gchapman")))
                    .andExpect(jsonPath("$.dateFormat", is("LL")))
                    .andExpect(jsonPath("$.timeFormat", is("LT")))
                    .andExpect(jsonPath("$.description", is(nullValue())))
            ;

            mockMvc.perform(put("/users/gchapman/settings")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{" +
                            "\"login\": \"gchapman\"" +
                            "}")
            )
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.login", is("gchapman")))
                    .andExpect(jsonPath("$.dateFormat", is(nullValue())))
                    .andExpect(jsonPath("$.timeFormat", is(nullValue())))
                    .andExpect(jsonPath("$.description", is(nullValue())))
            ;
            mockMvc.perform(get("/users/gchapman/settings"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.login", is("gchapman")))
                    .andExpect(jsonPath("$.dateFormat", is(nullValue())))
                    .andExpect(jsonPath("$.timeFormat", is(nullValue())))
                    .andExpect(jsonPath("$.description", is(nullValue())))
            ;

        }

        @Test
        void createSettingsWithError() throws Exception {
            mockMvc.perform(put("/users/kkline/settings")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{" +
                            "\"login\": \"mpalin\"," +
                            "\"dateFormat\": \"LL\"," +
                            "\"timeFormat\": \"LT\"" +
                            "}")
            )
                    .andExpect(status().isForbidden())
            ;
        }

        @Test
        void patchSettings() throws Exception {
            mockMvc.perform(put("/users/gchapman/settings")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{" +
                            "\"login\": \"gchapman\"," +
                            "\"dateFormat\": \"LLL\"," +
                            "\"timeFormat\": \"LT\"" +
                            "}")
            )
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.login", is("gchapman")))
                    .andExpect(jsonPath("$.dateFormat", is("LLL")))
                    .andExpect(jsonPath("$.timeFormat", is("LT")))
                    .andExpect(jsonPath("$.description", is(nullValue())))
            ;

            mockMvc.perform(get("/users/gchapman/settings"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.login", is("gchapman")))
                    .andExpect(jsonPath("$.dateFormat", is("LLL")))
                    .andExpect(jsonPath("$.timeFormat", is("LT")))
                    .andExpect(jsonPath("$.description", is(nullValue())))
            ;

            mockMvc.perform(patch("/users/gchapman/settings")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{" +
                            "\"login\": \"gchapman\"," +
                            "\"dateFormat\": \"LL\"" +
                            "}")
            )
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.login", is("gchapman")))
                    .andExpect(jsonPath("$.dateFormat", is("LL")))
                    .andExpect(jsonPath("$.timeFormat", is("LT")))
                    .andExpect(jsonPath("$.description", is(nullValue())))
            ;
            mockMvc.perform(get("/users/gchapman/settings"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.login", is("gchapman")))
                    .andExpect(jsonPath("$.dateFormat", is("LL")))
                    .andExpect(jsonPath("$.timeFormat", is("LT")))
                    .andExpect(jsonPath("$.description", is(nullValue())))
            ;

        }

        @Test
        void patchSettingsWithError() throws Exception {
            mockMvc.perform(patch("/users/kkline/settings")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{" +
                            "\"login\": \"kkline\"," +
                            "\"dateFormat\": \"LL\"," +
                            "\"timeFormat\": \"LT\"" +
                            "}")
            )
                    .andExpect(status().isForbidden())
            ;
        }

        @Test
        void deleteUser() throws Exception {
            mockMvc.perform(delete("/users/jcleese")
                    .contentType(MediaType.APPLICATION_JSON)
            )
                    .andExpect(status().is(HttpStatus.FORBIDDEN.value()))
            ;

        }
    }
}

