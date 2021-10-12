/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.businessconfig.controllers;

import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.opfab.businessconfig.application.IntegrationTestApplication;
import org.opfab.businessconfig.services.ProcessesService;
import org.opfab.springtools.configuration.test.WithMockOpFabUser;
import org.opfab.utilities.PathUtils;
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

import static org.hamcrest.CoreMatchers.not;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.opfab.test.AssertUtils.assertException;
import static org.opfab.utilities.PathUtils.copy;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;

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
        service.loadProcessGroupsCache();
    }

    @AfterAll
    void dispose() throws IOException {
        service.clear();
    }

    @Test
    void listProcesses() throws Exception {
        mockMvc.perform(get("/businessconfig/processes"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(2)))
        ;
    }

    @Test
    void listProcessGroups() throws Exception {
        mockMvc.perform(get("/businessconfig/processgroups"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.groups", hasSize(0)))
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
    void fetchTemplateResource() throws Exception {
        ResultActions result = mockMvc.perform(
                get("/businessconfig/processes/first/templates/template1")
                        .accept("application/handlebars")
        );
        result
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/handlebars"))
                .andExpect(content().string(is("{{service}}")))
        ;
        result = mockMvc.perform(
                get("/businessconfig/processes/first/templates/template?version=0.1")
                        .accept("application/handlebars"));
        result
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/handlebars"))
                .andExpect(content().string(is("{{service}} 0.1")))
        ;
        result = mockMvc.perform(
                get("/businessconfig/processes/first/templates/templateIO?version=0.1")
                        .accept("application/json", "application/handlebars"));
        result
                .andExpect(status().is4xxClientError())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        ;
    }

    @Test
    void fetchTranslation() throws Exception {
        ResultActions result = mockMvc.perform(
                get("/businessconfig/processes/first/translation")
                        .accept("text/plain")
        );
        result
                .andExpect(status().isOk())
                .andExpect(content().contentType("text/plain"))
                .andExpect(content().string(is("card.title=\"Title $1\"")))
        ;
        result = mockMvc.perform(
                get("/businessconfig/processes/first/translation?version=0.1")
                        .accept("text/plain")
        );
        result
                .andExpect(status().isOk())
                .andExpect(content().contentType("text/plain"))
                .andExpect(content().string(is("card.title=\"Title $1 0.1\"")))
        ;

        assertException(FileNotFoundException.class).isThrownBy(() ->
                mockMvc.perform(
                        get("/businessconfig/processes/first/translation?version=2.1")
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
                    .andExpect(jsonPath("$.name", is("process.title")))
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

        @Test
        void createProcessGroups() throws Exception {
            Path pathToProcessGroupsFile = Paths.get("./build/test-data/processgroups.json");

            MockMultipartFile processGroupsFile = new MockMultipartFile("file", "processgroups.json", MediaType.TEXT_PLAIN_VALUE, Files
                    .readAllBytes(pathToProcessGroupsFile));

            mockMvc.perform(multipart("/businessconfig/processgroups").file(processGroupsFile))
                    .andExpect(status().isCreated())
                    .andExpect(header().string("Location", "/businessconfig/processgroups"));

            mockMvc.perform(get("/businessconfig/processgroups"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.groups", hasSize(2)))
                    .andExpect(jsonPath("$.groups[0].id", is("processgroup1")))
                    .andExpect(jsonPath("$.groups[0].name", is("Process Group 1")))
                    .andExpect(jsonPath("$.groups[1].id", is("processgroup2")))
                    .andExpect(jsonPath("$.groups[1].name", is("Process Group 2")));
        }

        @Test
        void createProcessGroupsWithDuplicateProcessInSameGroup() throws Exception {
            Path pathToProcessGroupsFile = Paths.get("./build/test-data/processgroups_with_duplicate_in_same_group.json");

            MockMultipartFile processGroupsFile = new MockMultipartFile("file",
                    "processgroups_with_duplicate_in_same_group.json", MediaType.TEXT_PLAIN_VALUE, Files
                    .readAllBytes(pathToProcessGroupsFile));

            mockMvc.perform(multipart("/businessconfig/processgroups").file(processGroupsFile))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message", is("There is a duplicate process in the file you have sent")));
        }

        @Test
        void createProcessGroupsWithDuplicateProcessInDifferentGroups() throws Exception {
            Path pathToProcessGroupsFile = Paths.get("./build/test-data/processgroups_with_duplicate_in_different_groups.json");

            MockMultipartFile processGroupsFile = new MockMultipartFile("file",
                    "processgroups_with_duplicate_in_different_groups.json", MediaType.TEXT_PLAIN_VALUE, Files
                    .readAllBytes(pathToProcessGroupsFile));

            mockMvc.perform(multipart("/businessconfig/processgroups").file(processGroupsFile))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message", is("There is a duplicate process in the file you have sent")));
        }

        @Nested
        @WithMockOpFabUser(login="adminUser", roles = {"ADMIN"})
        class DeleteOnlyOneProcess {

            static final String bundleName = "first";

            @BeforeEach
            void setupEach() throws Exception {
                // This will also delete the businessconfig-storage root folder, but in this case it's needed as
                // the following copy would fail if the folder already existed.
                if (Files.exists(testDataDir)) Files.walk(testDataDir, 1).forEach(PathUtils::silentDelete);
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
        		ResultActions result = mockMvc.perform(delete("/businessconfig/processes/deletetest/versions/2.1"));
                result
                        .andExpect(status().isNoContent());
                result = mockMvc.perform(get("/businessconfig/processes/deletetest"));
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
