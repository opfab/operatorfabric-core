/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.businessconfig.controllers;

import static org.hamcrest.Matchers.is;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.assertj.core.api.Assert;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.extension.ExtendWith;
import org.opfab.businessconfig.application.IntegrationTestApplication;
import org.opfab.businessconfig.model.Monitoring;
import org.opfab.businessconfig.model.MonitoringData;
import org.opfab.springtools.configuration.test.WithMockOpFabUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ResourceLoaderAware;
import org.springframework.core.io.ResourceLoader;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.context.WebApplicationContext;

import lombok.extern.slf4j.Slf4j;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = { IntegrationTestApplication.class })
@ActiveProfiles("test")
@WebAppConfiguration
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@WithMockOpFabUser(login = "adminUser", roles = { "ADMIN" })
@Slf4j
class BusinessconfigControllerForMonitoringShould implements ResourceLoaderAware{

        private MockMvc mockMvc;
        private ResourceLoader resourceLoader;

        @Autowired
        private ObjectMapper objectMapper;

        private static final String PATH_PREFIX = "file:";

        @Value("${operatorfabric.businessconfig.storage.path}")
        private String storagePath;

        @Autowired
        private WebApplicationContext webApplicationContext;

        @Override
        public void setResourceLoader(ResourceLoader resourceLoader) {
            this.resourceLoader = resourceLoader;
        }
    

        @BeforeAll
        void setup() throws Exception {
                this.mockMvc = webAppContextSetup(webApplicationContext).apply(springSecurity()).build();
        }



        private String getMonitoring() {
                return "{ \"export\" : { "
                        +       "\"fields\": [ " 
                        +               "{ \"columnName\" : \"myField\" , \"jsonField\" :\"card.state\", \"type\":\"STRING\"},"
                        +               "{ \"columnName\" : \"myField\" , \"jsonField\" :\"card.data\", \"fields\": ["
                        +                       "{ \"columnName\" : \"myField\" , \"jsonField\" :\"card.state\", \"type\":\"EPOCHDATE\"},"
                        +                       "{ \"columnName\" : \"myField\" , \"jsonField\" :\"card.state\"}"
                        +               "]}"
                        +       "]}"
                        + "}";
        }

        public Monitoring getMonitoringFormFile() {
                try {
                    Path rootPath = Paths
                            .get(this.resourceLoader.getResource(PATH_PREFIX + this.storagePath).getFile().getAbsolutePath())
                            .normalize();
        
                    File f = new File(rootPath.toString() + "/monitoring.json");
                    
                    if (f.exists() && f.isFile()) {
                        log.info("loading monitoring.json file from {}", new File(storagePath).getAbsolutePath());
                         return  objectMapper.readValue(f, MonitoringData.class);
                    }
                    else log.info("No monitoring.json file found in {} ", rootPath.toString());
                }
                catch (IOException e) {
                    log.warn("Unreadable monitoring.json file at  {}", storagePath);
                }
                return null;
            }


        @Test
        void postInvalidMonitoringShouldReturnBadRequest() throws Exception {
                mockMvc.perform(post("/businessconfig/monitoring").contentType(MediaType.APPLICATION_JSON)
                                .content("dummyContent")).andExpect(status().isBadRequest()).andReturn();
        }

        @Test
        void postMonitoringShouldUpdateMonitoring() throws Exception {

                // should have value on startup
                mockMvc.perform(get("/businessconfig/monitoring")).andExpect(status().isOk())
                                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                                .andExpect(jsonPath("$.export.fields[0].columnName", is("initValue")));

                // post new configuration 
                mockMvc.perform(post("/businessconfig/monitoring").contentType(MediaType.APPLICATION_JSON)
                                .content(getMonitoring())).andExpect(status().isCreated()).andReturn();

                // check new configuration loaded 
                mockMvc.perform(get("/businessconfig/monitoring")).andExpect(status().isOk())
                                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                                .andExpect(jsonPath("$.export.fields[0].columnName", is("myField")))
                                .andExpect(jsonPath("$.export.fields[0].jsonField", is("card.state")))
                                .andExpect(jsonPath("$.export.fields[0].type", is("STRING")))
                                .andExpect(jsonPath("$.export.fields[1].fields[0].jsonField", is("card.state")))
                                .andExpect(jsonPath("$.export.fields[1].fields[0].type", is("EPOCHDATE")));

                // check new file has been saved on disk 
                Monitoring monitoringFormFile = getMonitoringFormFile();
                assertThat(monitoringFormFile).isNotNull();
                assertThat(monitoringFormFile.getExport().getFields().get(0).getColumnName()).isEqualTo("myField");
        }

}
