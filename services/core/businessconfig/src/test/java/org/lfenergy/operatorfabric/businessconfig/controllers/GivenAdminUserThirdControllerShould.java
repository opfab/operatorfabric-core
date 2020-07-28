/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.lfenergy.operatorfabric.businessconfig.controllers;

import static org.hamcrest.CoreMatchers.not;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.lfenergy.operatorfabric.test.AssertUtils.assertException;
import static org.lfenergy.operatorfabric.utilities.PathUtils.copy;
import static org.lfenergy.operatorfabric.utilities.PathUtils.silentDelete;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.extension.ExtendWith;
import org.lfenergy.operatorfabric.springtools.configuration.test.WithMockOpFabUser;
import org.lfenergy.operatorfabric.businessconfig.application.IntegrationTestApplication;
import org.lfenergy.operatorfabric.businessconfig.services.ProcessesService;
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

import lombok.extern.slf4j.Slf4j;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = {IntegrationTestApplication.class})
@ActiveProfiles("test")
@WebAppConfiguration
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@WithMockOpFabUser(login="adminUser", roles = {"ADMIN"})
@Slf4j
class GivenAdminUserBusinessconfigControllerShould {

    private static Path testDataDir = Paths.get("./build/test-data/businessconfig-storage");

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private ProcessesService service;

    @BeforeAll
    void setup() throws Exception {
        copy(Paths.get("./src/test/docker/volume/businessconfig-storage"), testDataDir);
        this.mockMvc = webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();
        service.loadCache();
    }

    @AfterAll
    void dispose() throws IOException {
        service.clear();
        if (Files.exists(testDataDir))
            Files.walk(testDataDir, 1).forEach(p -> silentDelete(p));
    }
    
    /*@BeforeEach
    void setupEach() throws Exception {
        copy(Paths.get("./src/test/docker/volume/businessconfig-storage"), testDataDir);
        service.loadCacheSafe();
    }*/

    @Test
    void listProcesses() throws Exception {
        mockMvc.perform(get("/businessconfig/processes"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(2)))
        ;
    }

    @Test
    void fetch() throws Exception {
        ResultActions result = mockMvc.perform(get("/businessconfig/processes/first"));
        result
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.version", is("v1")))
        ;
    }

    @Test
    void fetchWithVersion() throws Exception {
        ResultActions result = mockMvc.perform(get("/businessconfig/processes/first?version=0.1"));
        result
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.version", is("0.1")));
    }
    

    @Test
    void fetchCssResource() throws Exception {
        ResultActions result = mockMvc.perform(
                get("/businessconfig/processes/first/css/style1")
                        .accept("text/css"));
        result
                .andExpect(status().isOk())
                .andExpect(content().contentType("text/css"))
                .andExpect(content().string(is(".bold {\n" +
                        "    font-weight: bold;\n" +
                        "}")))
        ;
        result = mockMvc.perform(
                get("/businessconfig/processes/first/css/style1?version=0.1")
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
    void fetchDetails() throws Exception {
        ResultActions result = mockMvc.perform(
                get("/businessconfig/processes/first/testState/details")
                        .accept("application/json"));
        result
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].templateName", is("template")))
        ;
    }

    @Test
    void fetchNoDetailsOfUnknownProcess() throws Exception {
        ResultActions result = mockMvc.perform(
                get("/businessconfig/processes/unknown/testState/details")
                        .accept("application/json"));
        result
                .andExpect(status().isNotFound());
    }

    @Test
    void fetchNoDetailsOfUnknownState() throws Exception {
        ResultActions result = mockMvc.perform(
                get("/businessconfig/processes/first/unknown/details")
                        .accept("application/json"));
        result
                .andExpect(status().isNotFound());
    }


    @Test
    void fetchTemplateResource() throws Exception {
        ResultActions result = mockMvc.perform(
                get("/businessconfig/processes/first/templates/template1?locale=fr")
                        .accept("application/handlebars")
        );
        result
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/handlebars"))
                .andExpect(content().string(is("{{service}} fr")))
        ;
        result = mockMvc.perform(
                get("/businessconfig/processes/first/templates/template?version=0.1&locale=fr")
                        .accept("application/handlebars"));
        result
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/handlebars"))
                .andExpect(content().string(is("{{service}} fr 0.1")))
        ;
        result = mockMvc.perform(
                get("/businessconfig/processes/first/templates/template?locale=en&version=0.1")
                        .accept("application/handlebars"));
        result
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/handlebars"))
                .andExpect(content().string(is("{{service}} en 0.1")))
        ;
        result = mockMvc.perform(
                get("/businessconfig/processes/first/templates/templateIO?locale=fr&version=0.1")
                        .accept("application/json", "application/handlebars"));
        result
                .andExpect(status().is4xxClientError())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        ;
    }

    @Test
    void fetchI18nResource() throws Exception {
        ResultActions result = mockMvc.perform(
                get("/businessconfig/processes/first/i18n?locale=fr")
                        .accept("text/plain")
        );
        result
                .andExpect(status().isOk())
                .andExpect(content().contentType("text/plain"))
                .andExpect(content().string(is("card.title=\"Titre $1\"")))
        ;
        result = mockMvc.perform(
                get("/businessconfig/processes/first/i18n?locale=en")
                        .accept("text/plain")
        );
        result
                .andExpect(status().isOk())
                .andExpect(content().contentType("text/plain"))
                .andExpect(content().string(is("card.title=\"Title $1\"")))
        ;
        result = mockMvc.perform(
                get("/businessconfig/processes/first/i18n?locale=en&version=0.1")
                        .accept("text/plain")
        );
        result
                .andExpect(status().isOk())
                .andExpect(content().contentType("text/plain"))
                .andExpect(content().string(is("card.title=\"Title $1 0.1\"")))
        ;

        assertException(FileNotFoundException.class).isThrownBy(() ->
                mockMvc.perform(
                        get("/businessconfig/processes/first/i18n?locale=de&version=0.1")
                                .accept("text/plain")
                ));
    }

    @Nested
    @WithMockOpFabUser(login="adminUser", roles = {"ADMIN"})
    class CreateContent {
        @Test
        void create() throws Exception {
            Path pathToBundle = Paths.get("./build/test-data/bundles/second-2.1.tar.gz");
            MockMultipartFile bundle = new MockMultipartFile("file", "second-2.1.tar.gz", "application/gzip", Files
                    .readAllBytes(pathToBundle));
            mockMvc.perform(multipart("/businessconfig/processes").file(bundle))
                    .andExpect(status().isCreated())
                    .andExpect(header().string("Location", "/businessconfig/processes/second"))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.id", is("second")))
                    .andExpect(jsonPath("$.name.key", is("process.title")))
                    .andExpect(jsonPath("$.version", is("2.1")))
            ;

            mockMvc.perform(get("/businessconfig/processes"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$", hasSize(3)));

            mockMvc.perform(get("/businessconfig/processes/second/css/nostyle"))
                    .andExpect(status().isNotFound())
            ;

        }
        
        @Nested
        @WithMockOpFabUser(login="adminUser", roles = {"ADMIN"})
        class DeleteOnlyOneProcess {
        	
        	static final String bundleName = "first";
        	
        	@BeforeEach
        	void setupEach() throws Exception {        		
			  if (Files.exists(testDataDir))
			      Files.walk(testDataDir, 1).forEach(p -> silentDelete(p));
			    copy(Paths.get("./src/test/docker/volume/businessconfig-storage"), testDataDir);
			    service.loadCache();
			  }
        	
        	@Test
            void deleteBundleByNameAndVersionWhichNotBeingDefault() throws Exception {
        		ResultActions result = mockMvc.perform(delete("/businessconfig/processes/"+bundleName+"/versions/0.1"));
                result
                        .andExpect(status().isNoContent());
                result = mockMvc.perform(get("/businessconfig/processes/"+bundleName+"?version=0.1"));
                result
                        .andExpect(status().isNotFound());
            }
        	
        	@Test
            void deleteBundleByNameAndVersionWhichBeingDefault() throws Exception {
        		mockMvc.perform(delete("/businessconfig/processes/"+bundleName+"/versions/v1")).andExpect(status().isNoContent());
        		ResultActions result = mockMvc.perform(delete("/businessconfig/processes/"+bundleName+"/versions/0.1"));
                result
                        .andExpect(status().isNoContent());
                result = mockMvc.perform(get("/businessconfig/processes/"+bundleName));
                result
                        .andExpect(status().isOk())
                        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                        .andExpect(jsonPath("$.version", is(not("v1"))));
            }
        	
        	@Test
            void deleteBundleByNameAndVersionHavingOnlyOneVersion() throws Exception {
        		ResultActions result = mockMvc.perform(delete("/businessconfig/processes/businessconfig/versions/2.1"));
                result
                        .andExpect(status().isNoContent());
                result = mockMvc.perform(get("/businessconfig/processes/businessconfig"));
                result
                        .andExpect(status().isNotFound());
            }
        	
        	@Test
            void deleteBundleByNameAndVersionWhichNotExisting() throws Exception {
        		ResultActions result = mockMvc.perform(delete("/businessconfig/processes/second/versions/impossible_someone_really_so_crazy_to_give_this_name_to_a_version"));
                result
                        .andExpect(status().isNotFound());
        	}
        	
        	@Test
            void deleteBundleByNameWhichNotExistingAndVersion() throws Exception {
        		ResultActions result = mockMvc.perform(delete("/businessconfig/processes/impossible_someone_really_so_crazy_to_give_this_name_to_a_bundle/versions/2.1"));
                result
                        .andExpect(status().isNotFound());
        	}
        	
        	@Test
            void deleteGivenBundle() throws Exception {
        		ResultActions result = mockMvc.perform(delete("/businessconfig/processes/"+bundleName));
                result
                        .andExpect(status().isNoContent());
                result = mockMvc.perform(get("/businessconfig/processes/"+bundleName));
                result
                        .andExpect(status().isNotFound());
            }
        	
        	@Test
            void deleteGivenBundleNotFoundError() throws Exception {
        		ResultActions result = mockMvc.perform(delete("/businessconfig/processes/impossible_a_businessconfig_with_this_exact_name_exists"));
                result
                        .andExpect(status().isNotFound());
            }

        	@Nested
            @WithMockOpFabUser(login="adminUser", roles = {"ADMIN"})
            class DeleteContent {
                @Test
                void clean() throws Exception {
                    mockMvc.perform(delete("/businessconfig/processes"))
                            .andExpect(status().isNoContent());
                    mockMvc.perform(get("/businessconfig/processes"))
                            .andExpect(status().isOk())
                            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                            .andExpect(jsonPath("$", hasSize(0)));
                }
            }
        	
        }
        
    }

}
