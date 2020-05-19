/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


package org.lfenergy.operatorfabric.thirds.controllers;

import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.lfenergy.operatorfabric.springtools.configuration.test.WithMockOpFabUser;
import org.lfenergy.operatorfabric.thirds.application.IntegrationTestApplication;
import org.lfenergy.operatorfabric.thirds.services.ThirdsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.web.context.WebApplicationContext;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.lfenergy.operatorfabric.test.AssertUtils.assertException;
import static org.lfenergy.operatorfabric.utilities.PathUtils.copy;
import static org.lfenergy.operatorfabric.utilities.PathUtils.silentDelete;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;


/**
 * <p></p>
 * Created on 17/04/18
 *
 *
 */
@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = {IntegrationTestApplication.class})
@ActiveProfiles("test")
@WebAppConfiguration
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@WithMockOpFabUser(login="nonAdminUser", roles = {"someRole"})
class GivenNonAdminUserThirdControllerShould {

    private static Path testDataDir = Paths.get("./build/test-data/thirds-storage");

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;
    @Autowired
    private ThirdsService service;

    @BeforeAll
    void setup() throws Exception {
        copy(Paths.get("./src/test/docker/volume/thirds-storage"), testDataDir);
        this.mockMvc = webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();
    }

    @AfterAll
    void dispose() throws IOException {
        service.clear();
        if (Files.exists(testDataDir))
            Files.walk(testDataDir, 1).forEach(p -> silentDelete(p));
    }

    @Test
    void listThirds() throws Exception {
        mockMvc.perform(get("/thirds"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(1)))
        ;
    }

    @Test
    void fetch() throws Exception {
        ResultActions result = mockMvc.perform(get("/thirds/first"));
        result
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.version", is("v1")))
        ;
    }

    @Test
    void fetchWithVersion() throws Exception {
        ResultActions result = mockMvc.perform(get("/thirds/first?version=0.1"));
        result
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.version", is("0.1")));
    }

    @Test
    void fetchNonExistingThirds() throws Exception {
        mockMvc.perform(get("/thirds/DOES_NOT_EXIST"))
                .andExpect(status().isNotFound());
    }

    @Test
    void fetchCssResource() throws Exception {
        ResultActions result = mockMvc.perform(
                get("/thirds/first/css/style1")
                        .accept("text/css"));
        result
                .andExpect(status().isOk())
                .andExpect(content().contentType("text/css"))
                .andExpect(content().string(is(".bold {\n" +
                        "    font-weight: bold;\n" +
                        "}")))
        ;
        result = mockMvc.perform(
                get("/thirds/first/css/style1?version=0.1")
                        .accept("text/css"));
        result
                .andExpect(status().isOk())
                .andExpect(content().contentType("text/css"))
                .andExpect(content().string(is(".bold {\n" +
                        "    font-weight: bolder;\n" +
                        "}")))
        ;
    }

    @Test
    void fetchTemplateResource() throws Exception {
        ResultActions result = mockMvc.perform(
                get("/thirds/first/templates/template1?locale=fr")
                        .accept("application/handlebars")
        );
        result
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/handlebars"))
                .andExpect(content().string(is("{{service}} fr")))
        ;
        result = mockMvc.perform(
                get("/thirds/first/templates/template?version=0.1&locale=fr")
                        .accept("application/handlebars"));
        result
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/handlebars"))
                .andExpect(content().string(is("{{service}} fr 0.1")))
        ;
        result = mockMvc.perform(
                get("/thirds/first/templates/template?locale=en&version=0.1")
                        .accept("application/handlebars"));
        result
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/handlebars"))
                .andExpect(content().string(is("{{service}} en 0.1")))
        ;
        result = mockMvc.perform(
                get("/thirds/first/templates/templateIO?locale=fr&version=0.1")
                        .accept("application/json", "application/handlebars"));
        result
                .andExpect(status().is4xxClientError())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        ;
    }

    @Test
    void fetchI18nResource() throws Exception {
        ResultActions result = mockMvc.perform(
                get("/thirds/first/i18n?locale=fr")
                        .accept("text/plain")
        );
        result
                .andExpect(status().isOk())
                .andExpect(content().contentType("text/plain"))
                .andExpect(content().string(is("card.title=\"Titre $1\"")))
        ;
        result = mockMvc.perform(
                get("/thirds/first/i18n?locale=en")
                        .accept("text/plain")
        );
        result
                .andExpect(status().isOk())
                .andExpect(content().contentType("text/plain"))
                .andExpect(content().string(is("card.title=\"Title $1\"")))
        ;
        result = mockMvc.perform(
                get("/thirds/first/i18n?locale=en&version=0.1")
                        .accept("text/plain")
        );
        result
                .andExpect(status().isOk())
                .andExpect(content().contentType("text/plain"))
                .andExpect(content().string(is("card.title=\"Title $1 0.1\"")))
        ;

        assertException(FileNotFoundException.class).isThrownBy(() ->
                mockMvc.perform(
                        get("/thirds/first/i18n?locale=de&version=0.1")
                                .accept("text/plain")
                ));
    }

    @Nested
    @WithMockOpFabUser(login="nonAdminUser", roles = {"someRole"})
    class CreateContent {
        @Test
        void create() throws Exception {
            Path pathToBundle = Paths.get("./build/test-data/bundles/second-2.1.tar.gz");
            MockMultipartFile bundle = new MockMultipartFile("file", "second-2.1.tar.gz", "application/gzip", Files
                    .readAllBytes(pathToBundle));
            mockMvc.perform(multipart("/thirds/second").file(bundle))
                    .andExpect(status().isForbidden())
            ;

            mockMvc.perform(get("/thirds"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$", hasSize(1)));


        }
        
        @Nested
        @WithMockOpFabUser(login="nonAdminUser", roles = {"someRole"})
        class DeleteOnlyOneThird {
        	
        	static final String bundleName = "first";
        	
        	@Test
            void deleteGivenBundle() throws Exception {
        		ResultActions result = mockMvc.perform(delete("/thirds/"+bundleName));
                result
                        .andExpect(status().isForbidden());
            }
        	
        	@Test
            void deleteGivenBundleNotFoundError() throws Exception {
        		ResultActions result = mockMvc.perform(delete("/thirds/impossible_a_third_with_this_exact_name_exists"));
                result
                        .andExpect(status().isForbidden());
            }
        	
        	@Nested
            @WithMockOpFabUser(login="nonAdminUser", roles = {"someRole"})
            class DeleteContent {
                @Test
                void clean() throws Exception {
                    mockMvc.perform(delete("/thirds"))
                            .andExpect(status().isForbidden());
                    mockMvc.perform(get("/thirds"))
                            .andExpect(status().isOk())
                            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                            .andExpect(jsonPath("$", hasSize(1)));
                }
            }
        	
        }
        
    }

}
