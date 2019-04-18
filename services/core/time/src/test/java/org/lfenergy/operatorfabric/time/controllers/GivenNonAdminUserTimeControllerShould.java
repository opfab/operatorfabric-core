/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.time.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.assertj.core.data.Offset;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.lfenergy.operatorfabric.springtools.configuration.test.WithMockOpFabUser;
import org.lfenergy.operatorfabric.time.application.IntegrationTestApplication;
import org.lfenergy.operatorfabric.time.model.ClientTimeData;
import org.lfenergy.operatorfabric.time.model.SpeedEnum;
import org.lfenergy.operatorfabric.time.model.TimeData;
import org.lfenergy.operatorfabric.time.services.TimeService;
import org.lfenergy.operatorfabric.utilities.DateTimeUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.web.context.WebApplicationContext;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;

/**
 * <p></p>
 * Created on 25/06/18
 *
 * @author David Binder
 */
@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = {IntegrationTestApplication.class})
@ActiveProfiles("test")
@WebAppConfiguration
@Slf4j
@AutoConfigureMockMvc(secure = false)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@Tag("end-to-end")
@Tag("amqp")
@WithMockOpFabUser(login="testUser", roles = { "someGroup" })
class GivenNonAdminUserTimeControllerShould {
    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private TimeService timeService;

    @BeforeAll
    void setup() throws Exception {
        this.mockMvc = webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();
    }

    @BeforeEach
    void resetTimeService() {
        timeService.reset();
    }


    @Test
    public void fetchTime() throws Exception {
        LocalDateTime now = LocalDateTime.now();
        MvcResult result = mockMvc.perform(get("/time"))
           .andExpect(status().isOk())
           .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
           .andExpect(jsonPath("$.referenceTime", nullValue()))
           .andExpect(jsonPath("$.virtualTime", nullValue()))
           .andExpect(jsonPath("$.computedNow", notNullValue()))
           .andExpect(jsonPath("$.speed", is("X1")))
           .andReturn();
        TimeData timeData = objectMapper.readValue(result.getResponse().getContentAsString(), TimeData.class);
        LocalDateTime computedNow = DateTimeUtil.toLocalDateTime(timeData.getComputedNow());
        assertThat(computedNow.getYear()).isEqualTo(now.getYear());
        assertThat(computedNow.getMonth()).isEqualTo(now.getMonth());
        assertThat(computedNow.getDayOfYear()).isEqualTo(now.getDayOfYear());
        assertThat(computedNow.getHour()).isEqualTo(now.getHour());
        assertThat(computedNow.getMinute()).isEqualTo(now.getMinute());
        assertThat(computedNow.getSecond()).isCloseTo(now.getSecond(),Offset.offset(1));

    }

    //Tests on the "/time" endpoint

    @Test
    public void updateTimeData() throws Exception {
        Instant now = Instant.now();
        log.info("now is : " + now.toString());
        Instant lastYear = now.minus(365, ChronoUnit.DAYS);
        log.info("last year is : " + lastYear.toString());
        ClientTimeData updatedTimeData = new ClientTimeData(null, lastYear.toEpochMilli(), null, SpeedEnum.X2);
        String jsonEntity = objectMapper.writeValueAsString(updatedTimeData);
        mockMvc.perform(put("/time")
           .contentType(MediaType.APPLICATION_JSON_UTF8)
           .content(jsonEntity))
           .andExpect(status().isForbidden())
                .andReturn()
                ;
    }

    @Test
    public void setTimeData() throws Exception {
        Instant now = Instant.now();
        log.info("now is : " + now.toString());
        Instant lastYear = now.minus(365, ChronoUnit.DAYS);
        log.info("last year is : " + lastYear.toString());
        ClientTimeData updatedTimeData = new ClientTimeData(null, lastYear.toEpochMilli(), null, SpeedEnum.X2);
        String jsonEntity = objectMapper.writeValueAsString(updatedTimeData);
        mockMvc.perform(post("/time")
           .contentType(MediaType.APPLICATION_JSON_UTF8)
           .content(jsonEntity))
           .andExpect(status().isForbidden())
           ;
    }

    @Test
    public void ResetTimeData() throws Exception {
        mockMvc.perform(delete("/time"))
                .andExpect(status().isForbidden());
    }

    // Tests on the "/time/current" and "time/speed" endpoints

    @Test
    public void updateTimeAndSpeed() throws Exception {
        Instant now = Instant.now();
        log.info("now is : " + now.toString());
        Instant lastYear = now.minus(365, ChronoUnit.DAYS);
        log.info("last year is : " + lastYear.toString());
        String jsonEntity = objectMapper.writeValueAsString(lastYear.toEpochMilli());
        mockMvc.perform(put("/time/current")
           .contentType(MediaType.APPLICATION_JSON_UTF8)
           .content(jsonEntity))
           .andExpect(status().isForbidden())
            ;
    }

    @Test
    public void setTimeAndSpeed() throws Exception {
        Instant now = Instant.now();
        log.info("now is : " + now.toString());
        Instant lastYear = now.minus(365, ChronoUnit.DAYS);
        log.info("last year is : " + lastYear.toString());
        String jsonEntity = objectMapper.writeValueAsString(lastYear.toEpochMilli());
        mockMvc.perform(post("/time/current")
           .contentType(MediaType.APPLICATION_JSON_UTF8)
           .content(jsonEntity))
           .andExpect(status().isForbidden())
           ;
    }

}