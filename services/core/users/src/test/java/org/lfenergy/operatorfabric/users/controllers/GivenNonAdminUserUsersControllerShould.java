/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.users.controllers;

import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.lfenergy.operatorfabric.users.application.UnitTestApplication;
import org.lfenergy.operatorfabric.users.application.configuration.WithMockOpFabUser;
import org.lfenergy.operatorfabric.users.model.UserData;
import org.lfenergy.operatorfabric.users.model.UserSettingsData;
import org.lfenergy.operatorfabric.users.repositories.UserRepository;
import org.lfenergy.operatorfabric.users.repositories.UserSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.cloud.bus.ServiceMatcher;
import org.springframework.context.ApplicationContext;
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

import java.util.Arrays;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
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
@Slf4j
@WithMockOpFabUser(login="gchapman", roles = { "Monty Pythons" })
class GivenNonAdminUserUsersControllerShould {

    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;
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
        Arrays.stream(webApplicationContext.getBeanDefinitionNames()).forEach(n->log.info("created bean: "+n));
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
    }

    @AfterEach
    public void clean(){
        userRepository.deleteAll();
        userSettingsRepository.deleteAll();
    }

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
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(jsonPath("$.login", is("gchapman")))
                .andExpect(jsonPath("$.firstName", is("Graham")))
                .andExpect(jsonPath("$.lastName", is("Chapman")))
                .andExpect(jsonPath("$.groups", contains("Monty Pythons")))
        ;
    }

    @Test
    void create() throws Exception {
        mockMvc.perform(post("/users")
               .contentType(MediaType.APPLICATION_JSON_UTF8)
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
           .contentType(MediaType.APPLICATION_JSON_UTF8)
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
                .contentType(MediaType.APPLICATION_JSON_UTF8)
                .content("{" +
                        "\"login\": \"gchapman\","+
                        "\"firstName\": \"GRAHAM\","+
                        "\"lastName\": \"CHAPMAN\""+
                        "}")
        )
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
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
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                .andExpect(jsonPath("$.message", is(String.format(UsersController.USER_NOT_FOUND_MSG, "unknownSoFar"))))
                .andExpect(jsonPath("$.errors").doesNotExist())
        ;

        mockMvc.perform(put("/users/unknownSoFar")
                .contentType(MediaType.APPLICATION_JSON_UTF8)
                .content("{" +
                        "\"login\": \"unknownSoFar\","+
                        "\"firstName\": \"John\","+
                        "\"lastName\": \"Doe\""+
                        "}")
        )
                .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                .andExpect(jsonPath("$.message", is(String.format(UsersController.USER_NOT_FOUND_MSG, "unknownSoFar"))))
                .andExpect(jsonPath("$.errors").doesNotExist())
        ;

        mockMvc.perform(get("/users/unknownSoFar"))
                .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                .andExpect(jsonPath("$.message", is(String.format(UsersController.USER_NOT_FOUND_MSG, "unknownSoFar"))))
                .andExpect(jsonPath("$.errors").doesNotExist())
        ;
    }

    @Test
    void updateOwnDataWithMismatchedError() throws Exception {

        mockMvc.perform(get("/users/gchapman"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(jsonPath("$.login", is("gchapman")))
                .andExpect(jsonPath("$.firstName", is("Graham")))
                .andExpect(jsonPath("$.lastName", is("Chapman")))
        ;

        mockMvc.perform(put("/users/gchapman")
                .contentType(MediaType.APPLICATION_JSON_UTF8)
                .content("{" +
                        "\"login\": \"mpalin\","+
                        "\"firstName\": \"Michael\","+
                        "\"lastName\": \"Palin\""+
                        "}")
                )
                .andExpect(status().is(HttpStatus.BAD_REQUEST.value()))
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(jsonPath("$.status", is(HttpStatus.BAD_REQUEST.name())))
                .andExpect(jsonPath("$.message", is(UsersController.NO_MATCHING_USER_NAME_MSG)))
                .andExpect(jsonPath("$.errors").doesNotExist());

    }

    @Test
    @WithMockOpFabUser(login="unknownSoFar", roles = { "" })
    void updateOwnDataWithMismatchedAndNotFoundError() throws Exception {

        mockMvc.perform(get("/users/unknownSoFar"))
                .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                .andExpect(jsonPath("$.message", is(String.format(UsersController.USER_NOT_FOUND_MSG, "unknownSoFar"))))
                .andExpect(jsonPath("$.errors").doesNotExist())
        ;

        mockMvc.perform(put("/users/unknownSoFar")
                .contentType(MediaType.APPLICATION_JSON_UTF8)
                .content("{" +
                        "\"login\": \"someOtherLogin\","+
                        "\"firstName\": \"John\","+
                        "\"lastName\": \"Doe\""+
                        "}")
        )
                .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                .andExpect(jsonPath("$.message", is(String.format(UsersController.USER_NOT_FOUND_MSG, "unknownSoFar"))))
                .andExpect(jsonPath("$.errors").doesNotExist())
        ;

        mockMvc.perform(get("/users/unknownSoFar"))
                .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
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
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(jsonPath("$.login", is("gchapman")))
                .andExpect(jsonPath("$.dateFormat", is("LL")))
                .andExpect(jsonPath("$.timeFormat", is(nullValue())))
        ;
    }

    @Test
    void fetchSettingdsWithError() throws Exception {
        ResultActions result = mockMvc.perform(get("/users/kkline/settings"));
        result
                .andDo(MockMvcResultHandlers.log())
                .andExpect(status().is(HttpStatus.FORBIDDEN.value()))
//                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
//                .andExpect(jsonPath("$.status", is(HttpStatus.FORBIDDEN.name())))
//                .andExpect(jsonPath("$.message", is(String.format(UsersController.USER_SETTINGS_NOT_FOUND_MSG, "kkline"))))
//                .andExpect(jsonPath("$.errors").doesNotExist())
        ;
    }

    @Test
    void createSettings() throws Exception {
        mockMvc.perform(put("/users/gchapman/settings")
                .contentType(MediaType.APPLICATION_JSON_UTF8)
                .content("{" +
                        "\"login\": \"gchapman\"," +
                        "\"dateFormat\": \"LL\"," +
                        "\"timeFormat\": \"LT\"" +
                        "}")
        )
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(jsonPath("$.login", is("gchapman")))
                .andExpect(jsonPath("$.dateFormat", is("LL")))
                .andExpect(jsonPath("$.timeFormat", is("LT")))
                .andExpect(jsonPath("$.description", is(nullValue())))
        ;

        mockMvc.perform(get("/users/gchapman/settings"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(jsonPath("$.login", is("gchapman")))
                .andExpect(jsonPath("$.dateFormat", is("LL")))
                .andExpect(jsonPath("$.timeFormat", is("LT")))
                .andExpect(jsonPath("$.description", is(nullValue())))
        ;

        mockMvc.perform(put("/users/gchapman/settings")
                .contentType(MediaType.APPLICATION_JSON_UTF8)
                .content("{" +
                        "\"login\": \"gchapman\"" +
                        "}")
        )
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(jsonPath("$.login", is("gchapman")))
                .andExpect(jsonPath("$.dateFormat", is(nullValue())))
                .andExpect(jsonPath("$.timeFormat", is(nullValue())))
                .andExpect(jsonPath("$.description", is(nullValue())))
        ;
        mockMvc.perform(get("/users/gchapman/settings"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(jsonPath("$.login", is("gchapman")))
                .andExpect(jsonPath("$.dateFormat", is(nullValue())))
                .andExpect(jsonPath("$.timeFormat", is(nullValue())))
                .andExpect(jsonPath("$.description", is(nullValue())))
        ;

    }

    @Test
    void createSettingsWithError() throws Exception {
        mockMvc.perform(put("/users/kkline/settings")
                .contentType(MediaType.APPLICATION_JSON_UTF8)
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
                .contentType(MediaType.APPLICATION_JSON_UTF8)
                .content("{" +
                        "\"login\": \"gchapman\"," +
                        "\"dateFormat\": \"LLL\"," +
                        "\"timeFormat\": \"LT\"" +
                        "}")
        )
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(jsonPath("$.login", is("gchapman")))
                .andExpect(jsonPath("$.dateFormat", is("LLL")))
                .andExpect(jsonPath("$.timeFormat", is("LT")))
                .andExpect(jsonPath("$.description", is(nullValue())))
        ;

        mockMvc.perform(get("/users/gchapman/settings"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(jsonPath("$.login", is("gchapman")))
                .andExpect(jsonPath("$.dateFormat", is("LLL")))
                .andExpect(jsonPath("$.timeFormat", is("LT")))
                .andExpect(jsonPath("$.description", is(nullValue())))
        ;

        mockMvc.perform(patch("/users/gchapman/settings")
                .contentType(MediaType.APPLICATION_JSON_UTF8)
                .content("{" +
                        "\"login\": \"gchapman\"," +
                        "\"dateFormat\": \"LL\"" +
                        "}")
        )
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(jsonPath("$.login", is("gchapman")))
                .andExpect(jsonPath("$.dateFormat", is("LL")))
                .andExpect(jsonPath("$.timeFormat", is("LT")))
                .andExpect(jsonPath("$.description", is(nullValue())))
        ;
        mockMvc.perform(get("/users/gchapman/settings"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(jsonPath("$.login", is("gchapman")))
                .andExpect(jsonPath("$.dateFormat", is("LL")))
                .andExpect(jsonPath("$.timeFormat", is("LT")))
                .andExpect(jsonPath("$.description", is(nullValue())))
        ;

    }

    @Test
    void patchSettingsWithError() throws Exception {
        mockMvc.perform(patch("/users/kkline/settings")
                .contentType(MediaType.APPLICATION_JSON_UTF8)
                .content("{" +
                        "\"login\": \"kkline\"," +
                        "\"dateFormat\": \"LL\"," +
                        "\"timeFormat\": \"LT\"" +
                        "}")
        )
                .andExpect(status().isForbidden())
        ;


    }

}