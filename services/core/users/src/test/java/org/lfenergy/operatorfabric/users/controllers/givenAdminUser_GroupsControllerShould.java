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
import org.lfenergy.operatorfabric.users.application.configuration.WithMockOpFabUser;
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

import java.util.Arrays;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;

/**
 * <p></p>
 * Created on 13/09/18
 *
 * @author David Binder
 */
@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = UnitTestApplication.class)
@ActiveProfiles("test")
@WebAppConfiguration
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@Tag("end-to-end")
@Tag("mongo")
@WithMockOpFabUser(login="testAdminUser", roles = { "ADMIN" })
class givenAdminUser_GroupsControllerShould {

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
           .andExpect(status().isOk())
           .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
           .andExpect(jsonPath("$", hasSize(2)))
        ;
    }

    @Test
    void fetch() throws Exception {
        ResultActions result = mockMvc.perform(get("/groups/Monty Pythons"));
        result
           .andExpect(status().isOk())
           .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
           .andExpect(jsonPath("$.name", is("Monty Pythons")))
           .andExpect(jsonPath("$.description", is("A bunch of humorous fellows")))
        ;
    }

    @Test
    void fetchWithError() throws Exception {
        ResultActions result = mockMvc.perform(get("/groups/Marx Brothers"));
        result
           .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
           .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
           .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
           .andExpect(jsonPath("$.message", is("Group Marx Brothers not found")))
           .andExpect(jsonPath("$.errors").doesNotExist())
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
           .andExpect(status().isOk())
           .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
           .andExpect(jsonPath("$.name", is("Marx Brothers")))
           .andExpect(jsonPath("$.description", is("Chico, Groucho and Harpo, forget about Zeppo an Gummo")))
        ;

        mockMvc.perform(get("/groups"))
           .andExpect(status().isOk())
           .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
           .andExpect(jsonPath("$", hasSize(3)));

        mockMvc.perform(get("/groups/Marx Brothers"))
           .andExpect(status().isOk())
           .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
           .andExpect(jsonPath("$.name", is("Marx Brothers")))
           .andExpect(jsonPath("$.description", is("Chico, Groucho and Harpo, forget about Zeppo an Gummo")))
        ;

    }

    @Test
    void createWithDuplicateError() throws Exception {

        mockMvc.perform(get("/groups/Monty Pythons"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(jsonPath("$.name", is("Monty Pythons")))
                .andExpect(jsonPath("$.description", is("A bunch of humorous fellows")))
        ;

        mockMvc.perform(post("/groups")
                .contentType(MediaType.APPLICATION_JSON_UTF8)
                .content("{" +
                        "\"name\": \"Monty Pythons\","+
                        "\"description\": \"They went in search of the Holy Grail.\""+
                        "}")
        )
                .andExpect(status().is(HttpStatus.BAD_REQUEST.value()))
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(jsonPath("$.status", is(HttpStatus.BAD_REQUEST.name())))
                .andExpect(jsonPath("$.message", is("Resource creation failed because a resource with the same key already exists.")))
                .andExpect(jsonPath("$.errors",hasSize(1)))
                .andExpect(jsonPath("$.errors[0]",stringContainsInOrder(Arrays.asList("duplicate key","\"Monty Pythons\""))))
        ;

        mockMvc.perform(get("/groups"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(jsonPath("$", hasSize(2)));

        mockMvc.perform(get("/groups/Monty Pythons"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(jsonPath("$.name", is("Monty Pythons")))
                .andExpect(jsonPath("$.description", is("A bunch of humorous fellows")))
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
           .andExpect(status().isOk())
           .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
           .andExpect(jsonPath("$.name", is("Wanda")))
           .andExpect(jsonPath("$.description", is("They were not as successful in Fierce Creatures")))
        ;

        mockMvc.perform(get("/groups"))
           .andExpect(status().isOk())
           .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
           .andExpect(jsonPath("$", hasSize(2)));

        mockMvc.perform(get("/groups/Wanda"))
           .andExpect(status().isOk())
           .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
           .andExpect(jsonPath("$.name", is("Wanda")))
           .andExpect(jsonPath("$.description", is("They were not as successful in Fierce Creatures")))
        ;
    }

    @Test
    void updateWithNotFoundError() throws Exception {

        mockMvc.perform(get("/groups/unknownGroupSoFar"))
                .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                .andExpect(jsonPath("$.message", is("Group unknownGroupSoFar not found")))
                .andExpect(jsonPath("$.errors").doesNotExist())
        ;

        mockMvc.perform(put("/groups/unknownGroupSoFar")
                .contentType(MediaType.APPLICATION_JSON_UTF8)
                .content("{" +
                        "\"name\": \"unknownGroupSoFar\","+
                        "\"description\": \"New description for group\""+
                        "}")
        )
                .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                .andExpect(jsonPath("$.message", is("Group unknownGroupSoFar not found")))
                .andExpect(jsonPath("$.errors").doesNotExist())
        ;

        mockMvc.perform(get("/groups/unknownGroupSoFar"))
                .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                .andExpect(jsonPath("$.message", is("Group unknownGroupSoFar not found")))
                .andExpect(jsonPath("$.errors").doesNotExist())
        ;

    }

    @Test
    void updateWithMismatchedError() throws Exception {

        mockMvc.perform(get("/groups/Wanda"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(jsonPath("$.name", is("Wanda")))
                .andExpect(jsonPath("$.description", is("The cast of a really successful comedy")))
        ;

        mockMvc.perform(put("/groups/Wanda")
                .contentType(MediaType.APPLICATION_JSON_UTF8)
                .content("{" +
                        "\"name\": \"Monty Pythons\","+
                        "\"description\": \"They were not as successful in Fierce Creatures\""+
                        "}")
        )
                .andExpect(status().is(HttpStatus.BAD_REQUEST.value()))
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(jsonPath("$.status", is(HttpStatus.BAD_REQUEST.name())))
                .andExpect(jsonPath("$.message", is("Data from the request body doesn't match name parameter")))
                .andExpect(jsonPath("$.errors").doesNotExist());
        ;

        mockMvc.perform(get("/groups/Wanda"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(jsonPath("$.name", is("Wanda")))
                .andExpect(jsonPath("$.description", is("The cast of a really successful comedy")))
        ;
    }

    @Test
    void updateWithMismatchedAndNotFoundError() throws Exception {

        mockMvc.perform(get("/groups/unknownGroupSoFar"))
                .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                .andExpect(jsonPath("$.message", is("Group unknownGroupSoFar not found")))
                .andExpect(jsonPath("$.errors").doesNotExist())
        ;

        mockMvc.perform(put("/groups/unknownGroupSoFar")
                .contentType(MediaType.APPLICATION_JSON_UTF8)
                .content("{" +
                        "\"name\": \"someOtherGroupName\","+
                        "\"description\": \"New description for group\""+
                        "}")
        )
                .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                .andExpect(jsonPath("$.message", is("Group unknownGroupSoFar not found")))
                .andExpect(jsonPath("$.errors").doesNotExist())
        ;

        mockMvc.perform(get("/groups/unknownGroupSoFar"))
                .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                .andExpect(jsonPath("$.message", is("Group unknownGroupSoFar not found")))
                .andExpect(jsonPath("$.errors").doesNotExist())
        ;
    }

    @Test
    void addGroupToUsers() throws Exception {
        mockMvc.perform(post("/groups/Wanda/users")
           .contentType(MediaType.APPLICATION_JSON_UTF8)
           .content("[\"gchapman\"]")
        )
           .andExpect(status().isOk())
        ;

        UserData gchapman = userRepository.findById("gchapman").get();
        assertThat(gchapman).isNotNull();
        assertThat(gchapman.getGroups()).contains("Monty Pythons","Wanda");
        UserData jcleese = userRepository.findById("jcleese").get();
        assertThat(jcleese).isNotNull();
        assertThat(jcleese.getGroups()).contains("Monty Pythons","Wanda");
    }

    @Test
    void addGroupToUsersWithNotFoundError() throws Exception {

        mockMvc.perform(get("/groups/unknownGroupSoFar"))
                .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                .andExpect(jsonPath("$.message", is("Group unknownGroupSoFar not found")))
                .andExpect(jsonPath("$.errors").doesNotExist())
        ;

        mockMvc.perform(post("/groups/unknownGroupSoFar/users")
                .contentType(MediaType.APPLICATION_JSON_UTF8)
                .content("[\"gchapman\"]")
        )
                .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                .andExpect(jsonPath("$.message", is("Group unknownGroupSoFar not found")))
                .andExpect(jsonPath("$.errors").doesNotExist())
        ;

        UserData gchapman = userRepository.findById("gchapman").get();
        assertThat(gchapman).isNotNull();
        assertThat(gchapman.getGroups()).doesNotContain("unknownGroupSoFar");

        mockMvc.perform(get("/groups/unknownGroupSoFar"))
                .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                .andExpect(jsonPath("$.message", is("Group unknownGroupSoFar not found")))
                .andExpect(jsonPath("$.errors").doesNotExist())
        ;

    }

    @Test
    void addGroupToUsersWithBadRequest() throws Exception {
        mockMvc.perform(post("/groups/Wanda/users")
                .contentType(MediaType.APPLICATION_JSON_UTF8)
                .content("[\"gchapman\",\"unknownUserSoFar\"]")
        )
                .andExpect(status().is(HttpStatus.BAD_REQUEST.value()))
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(jsonPath("$.status", is(HttpStatus.BAD_REQUEST.name())))
                .andExpect(jsonPath("$.message", is("Bad user list : user unknownUserSoFar not found")))
                .andExpect(jsonPath("$.errors").doesNotExist());

        //If the user list isn't correct, no user should be updated
        UserData gchapman = userRepository.findById("gchapman").get();
        assertThat(gchapman).isNotNull();
        assertThat(gchapman.getGroups()).contains("Monty Pythons");

        mockMvc.perform(get("/users/unknownUserSoFar"))
                .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                .andExpect(jsonPath("$.message", is("User unknownUserSoFar not found")))
                .andExpect(jsonPath("$.errors").doesNotExist());

    }

    @Test
    void addGroupToFreshlyNewUser() throws Exception{

        String newUserName= "freshly-new-user";

        mockMvc.perform(post("/users")
                .contentType(MediaType.APPLICATION_JSON_UTF8)
                .content("{" +
                        "\"login\": \""+newUserName+"\","+
                        "\"firstName\": \"Freshly \","+
                        "\"lastName\": \"New User\""+
                        "}")
        ).andExpect(status().isOk());

        mockMvc.perform(put("/groups/Wanda/users")
                .contentType(MediaType.APPLICATION_JSON_UTF8)
                .content("[\""+newUserName+"\"]")
        )
                .andExpect(status().isOk());

        UserData jcleese = userRepository.findById(newUserName).get();
        assertThat(jcleese).isNotNull();
        assertThat(jcleese.getGroups()).contains("Wanda");

    }

    @Test
    void deleteGroupsFromUsers() throws Exception {
        mockMvc.perform(delete("/groups/Monty Pythons/users")
           .contentType(MediaType.APPLICATION_JSON_UTF8)
           .content("[\"gchapman\"]")
        )
           .andExpect(status().isOk())
        ;

        UserData gchapman = userRepository.findById("gchapman").get();
        assertThat(gchapman).isNotNull();
        assertThat(gchapman.getGroups()).isEmpty();
    }

    @Test
    void deleteGroupFromUsersWithNotFoundError() throws Exception {

        mockMvc.perform(get("/groups/unknownGroupSoFar"))
                .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                .andExpect(jsonPath("$.message", is("Group unknownGroupSoFar not found")))
                .andExpect(jsonPath("$.errors").doesNotExist())
        ;

        mockMvc.perform(delete("/groups/unknownGroupSoFar/users")
                .contentType(MediaType.APPLICATION_JSON_UTF8)
                .content("[\"gchapman\"]")
        )
                .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                .andExpect(jsonPath("$.message", is("Group unknownGroupSoFar not found")))
                .andExpect(jsonPath("$.errors").doesNotExist())
        ;

        mockMvc.perform(get("/groups/unknownGroupSoFar"))
                .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                .andExpect(jsonPath("$.message", is("Group unknownGroupSoFar not found")))
                .andExpect(jsonPath("$.errors").doesNotExist())
        ;

    }

    @Test
    void deleteGroupFromUsersWithBadRequest() throws Exception {
        mockMvc.perform(delete("/groups/Wanda/users")
                .contentType(MediaType.APPLICATION_JSON_UTF8)
                .content("[\"kkline\",\"unknownUserSoFar\"]")
        )
                .andExpect(status().is(HttpStatus.BAD_REQUEST.value()))
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(jsonPath("$.status", is(HttpStatus.BAD_REQUEST.name())))
                .andExpect(jsonPath("$.message", is("Bad user list : user unknownUserSoFar not found")))
                .andExpect(jsonPath("$.errors").doesNotExist());

        //If the user list isn't correct, no user should be updated
        UserData kkline = userRepository.findById("kkline").get();
        assertThat(kkline).isNotNull();
        assertThat(kkline.getGroups()).contains("Wanda");

        mockMvc.perform(get("/users/unknownUserSoFar"))
                .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                .andExpect(jsonPath("$.message", is("User unknownUserSoFar not found")))
                .andExpect(jsonPath("$.errors").doesNotExist());

    }


    @Test
    void updateGroupsFromUsers() throws Exception {
        mockMvc.perform(put("/groups/Wanda/users")
           .contentType(MediaType.APPLICATION_JSON_UTF8)
           .content("[\"gchapman\"]")
        )
           .andExpect(status().isOk())
        ;

        UserData gchapman = userRepository.findById("gchapman").get();
        assertThat(gchapman).isNotNull();
        assertThat(gchapman.getGroups()).contains("Monty Pythons","Wanda");
        UserData jcleese = userRepository.findById("jcleese").get();
        assertThat(jcleese).isNotNull();
        assertThat(jcleese.getGroups()).contains("Monty Pythons");
    }

    @Test
    void updateGroupFromUsersWithNotFoundError() throws Exception {

        mockMvc.perform(get("/groups/unknownGroupSoFar"))
                .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                .andExpect(jsonPath("$.message", is("Group unknownGroupSoFar not found")))
                .andExpect(jsonPath("$.errors").doesNotExist())
        ;

        mockMvc.perform(put("/groups/unknownGroupSoFar/users")
                .contentType(MediaType.APPLICATION_JSON_UTF8)
                .content("[\"gchapman\"]")
        )
                .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                .andExpect(jsonPath("$.message", is("Group unknownGroupSoFar not found")))
                .andExpect(jsonPath("$.errors").doesNotExist())
        ;

        UserData gchapman = userRepository.findById("gchapman").get();
        assertThat(gchapman).isNotNull();
        assertThat(gchapman.getGroups()).doesNotContain("unknownGroupSoFar");

        mockMvc.perform(get("/groups/unknownGroupSoFar"))
                .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                .andExpect(jsonPath("$.message", is("Group unknownGroupSoFar not found")))
                .andExpect(jsonPath("$.errors").doesNotExist())
        ;

    }

    @Test
    void updateGroupFromUsersWithBadRequest() throws Exception {

        mockMvc.perform(put("/groups/Wanda/users")
                .contentType(MediaType.APPLICATION_JSON_UTF8)
                .content("[\"gchapman\",\"unknownUserSoFar\"]")
        )
                .andExpect(status().is(HttpStatus.BAD_REQUEST.value()))
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(jsonPath("$.status", is(HttpStatus.BAD_REQUEST.name())))
                .andExpect(jsonPath("$.message", is("Bad user list : user unknownUserSoFar not found")))
                .andExpect(jsonPath("$.errors").doesNotExist());

        //If the user list isn't correct, no user should be updated
        UserData kkline = userRepository.findById("kkline").get();
        assertThat(kkline).isNotNull();
        assertThat(kkline.getGroups()).contains("Wanda");

        UserData gchapman = userRepository.findById("gchapman").get();
        assertThat(gchapman).isNotNull();
        assertThat(gchapman.getGroups()).doesNotContain("Wanda");

        mockMvc.perform(get("/users/unknownUserSoFar"))
                .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                .andExpect(jsonPath("$.message", is("User unknownUserSoFar not found")))
                .andExpect(jsonPath("$.errors").doesNotExist());

    }

}
