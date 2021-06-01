/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.users.controllers;

import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mockito;
import org.opfab.users.application.UnitTestApplication;
import org.opfab.users.application.configuration.WithMockOpFabUser;
import org.opfab.users.model.EntityData;
import org.opfab.users.model.UserData;
import org.opfab.users.repositories.EntityRepository;
import org.opfab.users.repositories.UserRepository;
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

import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = UnitTestApplication.class)
@ActiveProfiles("test")
@WebAppConfiguration
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@Tag("end-to-end")
@Tag("mongo")
class EntitiesControllerShould {

    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EntityRepository entityRepository;

    @MockBean
    private ServiceMatcher serviceMatcher;

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
           .entity("ENTITY1").entity("ENTITY2")
           .build();
        u2 = UserData.builder()
           .login("gchapman")
           .firstName("Graham")
           .lastName("Chapman")
           .group("Monty Pythons")
           .entity("ENTITY1")
           .build();
        u3 = UserData.builder()
           .login("kkline")
           .firstName("Kevin")
           .lastName("Kline")
           .group("Wanda")
           .entity("ENTITY2")
           .build();
        userRepository.insert(u1);
        userRepository.insert(u2);
        userRepository.insert(u3);
        EntityData e1, e2;
        e1 = EntityData.builder()
           .id("ENTITY1")
           .name("Control Room 1")
           .description("Control Room 1")
           .build();
        e2 = EntityData.builder()
           .id("ENTITY2")
           .name("Control Room 2")
           .description("Control Room 2")
           .build();
        entityRepository.insert(e1);
        entityRepository.insert(e2);

        Mockito.when(serviceMatcher.getBusId()).thenReturn("DUMMY_BUS_ID");
    }

    @AfterEach
    public void clean(){
        userRepository.deleteAll();
        entityRepository.deleteAll();
    }

    @Nested
    @WithMockOpFabUser(login="testAdminUser", roles = { "ADMIN" })
    class GivenAdminUserEntitiesControllerShould {

        @Test
        void fetchAll() throws Exception {
            ResultActions result = mockMvc.perform(get("/entities"));
            result
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$", hasSize(2)))
            ;
        }

        @Test
        void fetch() throws Exception {
            ResultActions result = mockMvc.perform(get("/entities/ENTITY1"));
            result
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.id", is("ENTITY1")))
                    .andExpect(jsonPath("$.name", is("Control Room 1")))
                    .andExpect(jsonPath("$.description", is("Control Room 1")))
            ;
        }

        @Test
        void fetchWithError() throws Exception {
            ResultActions result = mockMvc.perform(get("/entities/ENTITY3"));
            result
                    .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                    .andExpect(jsonPath("$.message", is(String.format(EntitiesController.ENTITY_NOT_FOUND_MSG, "ENTITY3"))))
                    .andExpect(jsonPath("$.errors").doesNotExist())
            ;
        }

        @Test
        void create() throws Exception {
            mockMvc.perform(post("/entities")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{" +
                            "\"id\": \"ENTITY3\"," +
                            "\"name\": \"Control Room 3\"," +
                            "\"description\": \"Control Room 3\"" +
                            "}")
            )
                    .andExpect(status().isCreated())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.id", is("ENTITY3")))
                    .andExpect(jsonPath("$.name", is("Control Room 3")))
                    .andExpect(jsonPath("$.description", is("Control Room 3")))
            ;

            mockMvc.perform(post("/entities")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{" +
                            "\"id\": \"ENTITY3\"," +
                            "\"name\": \"Control Room 3\"," +
                            "\"description\": \"Control Room 3\"" +
                            "}")
            )
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.id", is("ENTITY3")))
                    .andExpect(jsonPath("$.name", is("Control Room 3")))
                    .andExpect(jsonPath("$.description", is("Control Room 3")))
            ;

            mockMvc.perform(get("/entities"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$", hasSize(3)));

            mockMvc.perform(get("/entities/ENTITY3"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.id", is("ENTITY3")))
                    .andExpect(jsonPath("$.name", is("Control Room 3")))
                    .andExpect(jsonPath("$.description", is("Control Room 3")))
            ;

        }

        @Test
        void update() throws Exception {
            mockMvc.perform(put("/entities/ENTITY2")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{" +
                            "\"id\": \"ENTITY2\"," +
                            "\"name\": \"Control Room 2\"," +
                            "\"description\": \"Control Room 2 very short description\"" +
                            "}")
            )
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.id", is("ENTITY2")))
                    .andExpect(jsonPath("$.name", is("Control Room 2")))
                    .andExpect(jsonPath("$.description", is("Control Room 2 very short description")))
            ;

            mockMvc.perform(get("/entities"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$", hasSize(2)));

            mockMvc.perform(get("/entities/ENTITY2"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.id", is("ENTITY2")))
                    .andExpect(jsonPath("$.name", is("Control Room 2")))
                    .andExpect(jsonPath("$.description", is("Control Room 2 very short description")))
            ;
        }

        @Test
        void updateWithMismatchedError() throws Exception {

            mockMvc.perform(get("/entities/ENTITY2"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.id", is("ENTITY2")))
                    .andExpect(jsonPath("$.name", is("Control Room 2")))
                    .andExpect(jsonPath("$.description", is("Control Room 2")))
            ;

            mockMvc.perform(put("/entities/ENTITY2")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{" +
                            "\"id\": \"ENTITY1\"," +
                            "\"name\": \"Control Room 2\"," +
                            "\"description\": \"Control Room 2 very short description\"" +
                            "}")
            )
                    .andExpect(status().is(HttpStatus.BAD_REQUEST.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.BAD_REQUEST.name())))
                    .andExpect(jsonPath("$.message", is(EntitiesController.NO_MATCHING_ENTITY_ID_MSG)))
                    .andExpect(jsonPath("$.errors").doesNotExist());
            ;

            mockMvc.perform(get("/entities/ENTITY2"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.id", is("ENTITY2")))
                    .andExpect(jsonPath("$.name", is("Control Room 2")))
                    .andExpect(jsonPath("$.description", is("Control Room 2")))
            ;
        }

        @Test
        void updateWithMismatchedAndNotFoundError() throws Exception {

            mockMvc.perform(get("/entities/unknownEntitySoFar"))
                    .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                    .andExpect(jsonPath("$.message", is(String.format(EntitiesController.ENTITY_NOT_FOUND_MSG, "unknownEntitySoFar"))))
                    .andExpect(jsonPath("$.errors").doesNotExist())
            ;

            mockMvc.perform(put("/entities/unknownEntitySoFar")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{" +
                            "\"id\": \"someOtherEntityId\"," +
                            "\"name\": \"someOtherEntity Name\"," +
                            "\"description\": \"New description for entity\"" +
                            "}")
            )
                    .andExpect(status().is(HttpStatus.BAD_REQUEST.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.BAD_REQUEST.name())))
                    .andExpect(jsonPath("$.message", is(String.format(EntitiesController.NO_MATCHING_ENTITY_ID_MSG, "unknownEntitySoFar"))))
                    .andExpect(jsonPath("$.errors").doesNotExist())
            ;

            mockMvc.perform(get("/entities/unknownEntitySoFar"))
                    .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                    .andExpect(jsonPath("$.message", is(String.format(EntitiesController.ENTITY_NOT_FOUND_MSG, "unknownEntitySoFar"))))
                    .andExpect(jsonPath("$.errors").doesNotExist())
            ;
        }

        @Test
        void addEntityToUsers() throws Exception {
            mockMvc.perform(patch("/entities/ENTITY2/users")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("[\"gchapman\"]")
            )
                    .andExpect(status().isOk())
            ;

            UserData gchapman = userRepository.findById("gchapman").get();
            assertThat(gchapman).isNotNull();
            assertThat(gchapman.getEntities()).contains("ENTITY1", "ENTITY2");
            UserData jcleese = userRepository.findById("jcleese").get();
            assertThat(jcleese).isNotNull();
            assertThat(jcleese.getEntities()).contains("ENTITY1", "ENTITY2");
        }

        @Test
        void addEntityToUsersWithNotFoundError() throws Exception {

            mockMvc.perform(get("/entities/unknownEntitySoFar"))
                    .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                    .andExpect(jsonPath("$.message", is(String.format(EntitiesController.ENTITY_NOT_FOUND_MSG, "unknownEntitySoFar"))))
                    .andExpect(jsonPath("$.errors").doesNotExist())
            ;

            mockMvc.perform(patch("/entities/unknownEntitySoFar/users")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("[\"gchapman\"]")
            )
                    .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                    .andExpect(jsonPath("$.message", is(String.format(EntitiesController.ENTITY_NOT_FOUND_MSG, "unknownEntitySoFar"))))
                    .andExpect(jsonPath("$.errors").doesNotExist())
            ;

            UserData gchapman = userRepository.findById("gchapman").get();
            assertThat(gchapman).isNotNull();
            assertThat(gchapman.getEntities()).doesNotContain("unknownEntitySoFar");

            mockMvc.perform(get("/entities/unknownEntitySoFar"))
                    .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                    .andExpect(jsonPath("$.message", is(String.format(EntitiesController.ENTITY_NOT_FOUND_MSG, "unknownEntitySoFar"))))
                    .andExpect(jsonPath("$.errors").doesNotExist())
            ;
        }

        @Test
        void addEntityToUsersWithBadRequest() throws Exception {
            mockMvc.perform(patch("/entities/ENTITY2/users")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("[\"gchapman\",\"unknownUserSoFar\"]")
            )
                    .andExpect(status().is(HttpStatus.BAD_REQUEST.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.BAD_REQUEST.name())))
                    .andExpect(jsonPath("$.message", is(String.format(EntitiesController.BAD_USER_LIST_MSG, "unknownUserSoFar"))))
                    .andExpect(jsonPath("$.errors").doesNotExist());

            //If the user list isn't correct, no user should be updated
            UserData gchapman = userRepository.findById("gchapman").get();
            assertThat(gchapman).isNotNull();
            assertThat(gchapman.getEntities()).contains("ENTITY1");

            mockMvc.perform(get("/users/unknownUserSoFar"))
                    .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                    .andExpect(jsonPath("$.message", is(String.format(UsersController.USER_NOT_FOUND_MSG, "unknownUserSoFar"))))
                    .andExpect(jsonPath("$.errors").doesNotExist());
        }

        @Test
        void addEntityToFreshlyNewUser() throws Exception {

            String newUserName = "freshly-new-user";

            mockMvc.perform(post("/users")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{" +
                            "\"login\": \"" + newUserName + "\"," +
                            "\"firstName\": \"Freshly \"," +
                            "\"lastName\": \"New User\"" +
                            "}")
            ).andExpect(status().isCreated())
            .andExpect(header().string("Location","/users/"+newUserName));

            mockMvc.perform(put("/entities/ENTITY2/users")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("[\"" + newUserName + "\"]")
            )
                    .andExpect(status().isOk());

            UserData freshlyNewUser = userRepository.findById(newUserName).get();
            assertThat(freshlyNewUser).isNotNull();
            assertThat(freshlyNewUser.getEntities()).containsExactly("ENTITY2");

            List<UserData> entity2 = userRepository.findByEntitiesContaining("ENTITY2");
            assertThat(entity2).isNotNull();
            assertThat(entity2).containsExactly(freshlyNewUser);
        }

        @Test
        void deleteEntitiesFromUsers() throws Exception {
            List<UserData> entity1 = userRepository.findByEntitiesContaining("ENTITY1");
            assertThat(entity1.size()).isEqualTo(2);
            mockMvc.perform(delete("/entities/ENTITY1/users")
                    .contentType(MediaType.APPLICATION_JSON)
            )
                    .andExpect(status().isOk())
            ;

            entity1 = userRepository.findByEntitiesContaining("ENTITY1");
            assertThat(entity1).isEmpty();
        }

        @Test
        void deleteEntity() throws Exception {

            UserData jcleese = userRepository.findById("jcleese").get();
            assertThat(jcleese).isNotNull();
            assertThat(jcleese.getEntities()).containsExactlyInAnyOrder("ENTITY1", "ENTITY2");

            UserData gchapman = userRepository.findById("gchapman").get();
            assertThat(gchapman).isNotNull();
            assertThat(gchapman.getEntities()).containsExactlyInAnyOrder("ENTITY1");

            assertThat(entityRepository.findById("ENTITY1")).isNotEmpty();

            mockMvc.perform(delete("/entities/ENTITY1")
                    .contentType(MediaType.APPLICATION_JSON)
            )
                    .andExpect(status().isOk())
            ;

            jcleese = userRepository.findById("jcleese").get();
            assertThat(jcleese).isNotNull();
            assertThat(jcleese.getEntities()).containsExactlyInAnyOrder("ENTITY2");

            gchapman = userRepository.findById("gchapman").get();
            assertThat(gchapman).isNotNull();
            assertThat(gchapman.getEntities()).isEmpty();

            assertThat(entityRepository.findById("ENTITY1")).isEmpty();
        }

        @Test
        void deleteEntityWithNotFoundError() throws Exception {

            mockMvc.perform(get("/entities/unknownEntitySoFar"))
                    .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                    .andExpect(jsonPath("$.message", is(String.format(EntitiesController.ENTITY_NOT_FOUND_MSG, "unknownEntitySoFar"))))
                    .andExpect(jsonPath("$.errors").doesNotExist())
            ;

            mockMvc.perform(delete("/entities/unknownEntitySoFar")
                    .contentType(MediaType.APPLICATION_JSON)
            )
                    .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                    .andExpect(jsonPath("$.message", is(String.format(EntitiesController.ENTITY_NOT_FOUND_MSG, "unknownEntitySoFar"))))
                    .andExpect(jsonPath("$.errors").doesNotExist())
            ;

            mockMvc.perform(get("/entities/unknownEntitySoFar"))
                    .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                    .andExpect(jsonPath("$.message", is(String.format(EntitiesController.ENTITY_NOT_FOUND_MSG, "unknownEntitySoFar"))))
                    .andExpect(jsonPath("$.errors").doesNotExist())
            ;
        }

        @Test
        void deleteEntityFromChildEntities() throws Exception {
            EntityData p1 = EntityData.builder()
                .id("PARENT1")
                .name("Parent Room")
                .description("Parent Room")
                .build();
            entityRepository.insert(p1);

            EntityData e1 = entityRepository.findById("ENTITY1").get();
            assertThat(e1).isNotNull();
            e1.setParents(Arrays.asList("PARENT1"));
            entityRepository.save(e1);
            assertThat(e1.getParents().size()).isEqualTo(1);
            assertThat(e1.getParents().get(0)).isEqualTo("PARENT1");

            mockMvc.perform(delete("/entities/PARENT1")
                    .contentType(MediaType.APPLICATION_JSON)
            )
                    .andExpect(status().isOk())
            ;
            assertThat(entityRepository.findById("PARENT1")).isEmpty();

            EntityData e1after = entityRepository.findById("ENTITY1").get();
            assertThat(e1after).isNotNull();
            assertThat(e1after.getParents()).isEmpty();

        }

        @Test
        void deleteEntitiesFromUser() throws Exception {
            List<UserData> entity1 = userRepository.findByEntitiesContaining("ENTITY1");
            assertThat(entity1.size()).isEqualTo(2);
            mockMvc.perform(delete("/entities/ENTITY1/users/gchapman")
                    .contentType(MediaType.APPLICATION_JSON)
            )
                    .andExpect(status().isOk())
            ;

            entity1 = userRepository.findByEntitiesContaining("ENTITY1");
            assertThat(entity1.size()).isEqualTo(1);
        }

        @Test
        void deleteEntityFromUsersWithNotFoundError() throws Exception {

            mockMvc.perform(get("/entities/unknownEntitySoFar"))
                    .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                    .andExpect(jsonPath("$.message", is(String.format(EntitiesController.ENTITY_NOT_FOUND_MSG, "unknownEntitySoFar"))))
                    .andExpect(jsonPath("$.errors").doesNotExist())
            ;

            mockMvc.perform(delete("/entities/unknownEntitySoFar/users")
                    .contentType(MediaType.APPLICATION_JSON)
            )
                    .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                    .andExpect(jsonPath("$.message", is(String.format(EntitiesController.ENTITY_NOT_FOUND_MSG, "unknownEntitySoFar"))))
                    .andExpect(jsonPath("$.errors").doesNotExist())
            ;

            mockMvc.perform(get("/entities/unknownEntitySoFar"))
                    .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                    .andExpect(jsonPath("$.message", is(String.format(EntitiesController.ENTITY_NOT_FOUND_MSG, "unknownEntitySoFar"))))
                    .andExpect(jsonPath("$.errors").doesNotExist())
            ;

        }

        @Test
        void deleteEntityFromUserWithNotFoundError() throws Exception {

            mockMvc.perform(get("/entities/unknownEntitySoFar"))
                    .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                    .andExpect(jsonPath("$.message", is(String.format(EntitiesController.ENTITY_NOT_FOUND_MSG, "unknownEntitySoFar"))))
                    .andExpect(jsonPath("$.errors").doesNotExist())
            ;

            mockMvc.perform(delete("/entities/unknownEntitySoFar/users/gchapman")
                    .contentType(MediaType.APPLICATION_JSON)
            )
                    .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                    .andExpect(jsonPath("$.message", is(String.format(EntitiesController.ENTITY_NOT_FOUND_MSG, "unknownEntitySoFar"))))
                    .andExpect(jsonPath("$.errors").doesNotExist())
            ;

            mockMvc.perform(get("/entities/unknownEntitySoFar"))
                    .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                    .andExpect(jsonPath("$.message", is(String.format(EntitiesController.ENTITY_NOT_FOUND_MSG, "unknownEntitySoFar"))))
                    .andExpect(jsonPath("$.errors").doesNotExist())
            ;

        }

        @Test
        void updateEntitiesFromUsers() throws Exception {
            mockMvc.perform(put("/entities/ENTITY2/users")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("[\"gchapman\"]")
            )
                    .andExpect(status().isOk())
            ;

            UserData gchapman = userRepository.findById("gchapman").get();
            assertThat(gchapman).isNotNull();
            assertThat(gchapman.getEntities()).containsExactly("ENTITY1", "ENTITY2");

            //ENTITY2 must only contain gchapman (jcleese and kkline must be removed from entity)
            UserData jcleese = userRepository.findById("jcleese").get();
            assertThat(jcleese).isNotNull();
            assertThat(jcleese.getEntities()).containsExactly("ENTITY1");
            UserData kkline = userRepository.findById("kkline").get();
            assertThat(kkline).isNotNull();
            assertThat(kkline.getEntities()).isEmpty();
        }

        @Test
        void updateEntityFromUsersWithNotFoundError() throws Exception {

            mockMvc.perform(get("/entities/unknownEntitySoFar"))
                    .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                    .andExpect(jsonPath("$.message", is(String.format(EntitiesController.ENTITY_NOT_FOUND_MSG, "unknownEntitySoFar"))))
                    .andExpect(jsonPath("$.errors").doesNotExist())
            ;

            mockMvc.perform(put("/entities/unknownEntitySoFar/users")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("[\"gchapman\"]")
            )
                    .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                    .andExpect(jsonPath("$.message", is(String.format(EntitiesController.ENTITY_NOT_FOUND_MSG, "unknownEntitySoFar"))))
                    .andExpect(jsonPath("$.errors").doesNotExist())
            ;

            UserData gchapman = userRepository.findById("gchapman").get();
            assertThat(gchapman).isNotNull();
            assertThat(gchapman.getEntities()).doesNotContain("unknownEntitySoFar");

            mockMvc.perform(get("/entities/unknownEntitySoFar"))
                    .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                    .andExpect(jsonPath("$.message", is(String.format(EntitiesController.ENTITY_NOT_FOUND_MSG, "unknownEntitySoFar"))))
                    .andExpect(jsonPath("$.errors").doesNotExist())
            ;
        }

        @Test
        void updateEntityFromUsersWithBadRequest() throws Exception {

            mockMvc.perform(put("/entities/ENTITY2/users")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("[\"gchapman\",\"unknownUserSoFar\"]")
            )
                    .andExpect(status().is(HttpStatus.BAD_REQUEST.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.BAD_REQUEST.name())))
                    .andExpect(jsonPath("$.message", is(String.format(EntitiesController.BAD_USER_LIST_MSG, "unknownUserSoFar"))))
                    .andExpect(jsonPath("$.errors").doesNotExist());

            //If the user list isn't correct, no user should be updated
            UserData kkline = userRepository.findById("kkline").get();
            assertThat(kkline).isNotNull();
            assertThat(kkline.getEntities()).contains("ENTITY2");

            UserData gchapman = userRepository.findById("gchapman").get();
            assertThat(gchapman).isNotNull();
            assertThat(gchapman.getEntities()).doesNotContain("ENTITY2");

            mockMvc.perform(get("/users/unknownUserSoFar"))
                    .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                    .andExpect(jsonPath("$.message", is(String.format(UsersController.USER_NOT_FOUND_MSG, "unknownUserSoFar"))))
                    .andExpect(jsonPath("$.errors").doesNotExist());

        }
    }

    @Nested
    @WithMockOpFabUser(login="gchapman", roles = { "Monty Pythons" })
    class GivenNonAdminUserEntitiesControllerShould {

        @Test
        void fetchAll() throws Exception {
            ResultActions result = mockMvc.perform(get("/entities"));
            result
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$", hasSize(2)))
            ;
        }

        @Test
        void fetch() throws Exception {
            ResultActions result = mockMvc.perform(get("/entities/ENTITY1"));
            result
                    .andExpect(status().is(HttpStatus.FORBIDDEN.value()))
            ;
        }

        @Test
        void create() throws Exception {
            mockMvc.perform(post("/entities")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{" +
                            "\"id\": \"ENTITY3\","+
                            "\"name\": \"Control Room 3\","+
                            "\"description\": \"Control Room 3\""+
                            "}")
            )
                    .andExpect(status().is(HttpStatus.FORBIDDEN.value()))
            ;
        }

        @Test
        void update() throws Exception {
            mockMvc.perform(put("/entities/ENTITY2")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{" +
                            "\"id\": \"ENTITY2\","+
                            "\"name\": \"Control Room 2\","+
                            "\"description\": \"Control Room 2 very short description\""+
                            "}")
            )
                    .andExpect(status().is(HttpStatus.FORBIDDEN.value()))
            ;
        }


        @Test
        void addEntityToUsers() throws Exception {
            mockMvc.perform(post("/entities/ENTITY2/users")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("[\"gchapman\"]")
            )
                    .andExpect(status().is(HttpStatus.FORBIDDEN.value()))
            ;
        }


        @Test
        void deleteEntitiesFromUsers() throws Exception {
            mockMvc.perform(delete("/entities/ENTITY1/users")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("[\"gchapman\"]")
            )
                    .andExpect(status().is(HttpStatus.FORBIDDEN.value()))
            ;
        }

        @Test
        void deleteEntity() throws Exception {
            mockMvc.perform(delete("/entities/ENTITY1")
                    .contentType(MediaType.APPLICATION_JSON)
            )
                    .andExpect(status().is(HttpStatus.FORBIDDEN.value()))
            ;
        }

        @Test
        void updateEntitiesFromUsers() throws Exception {
            mockMvc.perform(put("/entities/ENTITY2/users")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("[\"gchapman\"]")
            )
                    .andExpect(status().is(HttpStatus.FORBIDDEN.value()))
            ;
        }
    }
}
