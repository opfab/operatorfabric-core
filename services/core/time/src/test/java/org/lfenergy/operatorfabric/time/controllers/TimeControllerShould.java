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
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.extension.ExtendWith;
import org.lfenergy.operatorfabric.time.application.IntegrationTestApplication;
import org.lfenergy.operatorfabric.springtools.configuration.test.WithMockOpFabUser;
import org.lfenergy.operatorfabric.time.model.ClientTimeData;
import org.lfenergy.operatorfabric.time.model.SpeedEnum;
import org.lfenergy.operatorfabric.time.model.TimeData;
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
@WithMockOpFabUser(login="testAdminUser", roles = { "ADMIN" })
class TimeControllerShould {
    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;
    @Autowired
    private ObjectMapper objectMapper;

    @BeforeAll
    void setup() throws Exception {
        this.mockMvc = webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();
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

    @Test
    public void updateAndResetTimeData() throws Exception {
        Instant now = Instant.now();
        log.info("now is : " + now.toString());
        Instant lastYear = now.minus(365, ChronoUnit.DAYS);
        log.info("last year is : " + lastYear.toString());
        ClientTimeData updatedTimeData = new ClientTimeData(null, lastYear.toEpochMilli(), null, SpeedEnum.X2);
        String jsonEntity = objectMapper.writeValueAsString(updatedTimeData);
        MvcResult result = mockMvc.perform(put("/time")
           .contentType(MediaType.APPLICATION_JSON_UTF8)
           .content(jsonEntity))
           .andExpect(status().isOk())
           .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
           .andExpect(jsonPath("$.referenceTime", notNullValue()))
           .andExpect(jsonPath("$.virtualTime", notNullValue()))
           .andExpect(jsonPath("$.computedNow", notNullValue()))
           .andExpect(jsonPath("$.speed", is("X2")))
           .andReturn();
        TimeData timeData = objectMapper.readValue(result.getResponse().getContentAsString(), TimeData.class);
        assertThat(timeData.getVirtualTime()).isCloseTo(lastYear.toEpochMilli(), Offset.offset(500l));
        setAndResetTimeData0(lastYear);
    }

    @Test
    public void setAndResetTimeData() throws Exception {
        Instant now = Instant.now();
        log.info("now is : " + now.toString());
        Instant lastYear = now.minus(365, ChronoUnit.DAYS);
        log.info("last year is : " + lastYear.toString());
        ClientTimeData updatedTimeData = new ClientTimeData(null, lastYear.toEpochMilli(), null, SpeedEnum.X2);
        String jsonEntity = objectMapper.writeValueAsString(updatedTimeData);
        MvcResult result = mockMvc.perform(post("/time")
           .contentType(MediaType.APPLICATION_JSON_UTF8)
           .content(jsonEntity))
           .andExpect(status().isOk())
           .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
           .andExpect(jsonPath("$.referenceTime", notNullValue()))
           .andExpect(jsonPath("$.virtualTime", notNullValue()))
           .andExpect(jsonPath("$.computedNow", notNullValue()))
           .andExpect(jsonPath("$.speed", is("X2")))
           .andReturn();
        TimeData timeData = objectMapper.readValue(result.getResponse().getContentAsString(), TimeData.class);
        assertThat(timeData.getVirtualTime()).isCloseTo(lastYear.toEpochMilli(), Offset.offset(500l));
        setAndResetTimeData0(lastYear);
    }

    private void setAndResetTimeData0(Instant lastYear) throws Exception {
        Thread.sleep(1500);
        MvcResult result = mockMvc.perform(get("/time"))
           .andExpect(status().isOk())
           .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
           .andExpect(jsonPath("$.referenceTime", notNullValue()))
           .andExpect(jsonPath("$.virtualTime", notNullValue()))
           .andExpect(jsonPath("$.computedNow", notNullValue()))
           .andExpect(jsonPath("$.speed", is("X2")))
           .andReturn();
        TimeData timeData = objectMapper.readValue(result.getResponse().getContentAsString(), TimeData.class);
        assertThat(timeData.getVirtualTime()).isCloseTo(lastYear.toEpochMilli(), Offset.offset(500l));
        Instant computedNow = DateTimeUtil.toInstant(timeData.getComputedNow());
        log.info("computed now is : " + computedNow.toString());
        assertThat(lastYear.isBefore(computedNow)).describedAs(lastYear.toString() + " should be before " + computedNow
           .toString()).isTrue();

        Instant lastYear2 = Instant.now().minus(365, ChronoUnit.DAYS);
        log.info("last year 2 is : " + lastYear2.toString());
        assertThat(lastYear2.isBefore(computedNow)).describedAs(lastYear2.toString() + " should be before " +
           computedNow.toString
              ()).isTrue();
        mockMvc.perform(delete("/time"))
           .andExpect(status().isOk());

        mockMvc.perform(get("/time"))
           .andExpect(status().isOk())
           .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
           .andExpect(jsonPath("$.referenceTime", nullValue()))
           .andExpect(jsonPath("$.virtualTime", nullValue()))
           .andExpect(jsonPath("$.computedNow", notNullValue()))
           .andExpect(jsonPath("$.speed", is("X1")));
    }

    @Test
    public void updateAndResetTimeAndSpeed() throws Exception {
        Instant now = Instant.now();
        log.info("now is : " + now.toString());
        Instant lastYear = now.minus(365, ChronoUnit.DAYS);
        log.info("last year is : " + lastYear.toString());
        String jsonEntity = objectMapper.writeValueAsString(lastYear.toEpochMilli());
        MvcResult result = mockMvc.perform(put("/time/current")
           .contentType(MediaType.APPLICATION_JSON_UTF8)
           .content(jsonEntity))
           .andExpect(status().isOk())
           .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
//           .andExpect(jsonPath("$", is(lastYear.toEpochMilli())))
           .andReturn();
        Long time = objectMapper.readValue(result.getResponse().getContentAsString(), Long.class);
        assertThat(time).isCloseTo(lastYear.toEpochMilli(), Offset.offset(500l));

        jsonEntity = objectMapper.writeValueAsString(SpeedEnum.X2);
        mockMvc.perform(put("/time/speed")
           .contentType(MediaType.APPLICATION_JSON_UTF8)
           .content(jsonEntity))
           .andExpect(status().isOk())
           .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
           .andExpect(jsonPath("$", is("X2")));

        updateAndResetTime0(lastYear);
    }

    @Test
    public void setAndResetTimeAndSpeed() throws Exception {
        Instant now = Instant.now();
        log.info("now is : " + now.toString());
        Instant lastYear = now.minus(365, ChronoUnit.DAYS);
        log.info("last year is : " + lastYear.toString());
        String jsonEntity = objectMapper.writeValueAsString(lastYear.toEpochMilli());
        MvcResult result = mockMvc.perform(post("/time/current")
           .contentType(MediaType.APPLICATION_JSON_UTF8)
           .content(jsonEntity))
           .andExpect(status().isOk())
           .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
//           .andExpect(jsonPath("$", is(lastYear.toEpochMilli())))
           .andReturn();

        Long time = objectMapper.readValue(result.getResponse().getContentAsString(), Long.class);
        assertThat(time).isCloseTo(lastYear.toEpochMilli(), Offset.offset(500l));

        jsonEntity = objectMapper.writeValueAsString(SpeedEnum.X2);
        mockMvc.perform(post("/time/speed")
           .contentType(MediaType.APPLICATION_JSON_UTF8)
           .content(jsonEntity))
           .andExpect(status().isOk())
           .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
           .andExpect(jsonPath("$", is("X2")));

        updateAndResetTime0(lastYear);
    }

    private void updateAndResetTime0(Instant lastYear) throws Exception {

        Thread.sleep(1500);
        MvcResult result = mockMvc.perform(get("/time"))
           .andExpect(status().isOk())
           .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
           .andExpect(jsonPath("$.referenceTime", notNullValue()))
           .andExpect(jsonPath("$.virtualTime", notNullValue()))
           .andExpect(jsonPath("$.computedNow", notNullValue()))
           .andExpect(jsonPath("$.speed", is("X2")))
           .andReturn();
        TimeData timeData = objectMapper.readValue(result.getResponse().getContentAsString(), TimeData.class);
        Instant computedNow = DateTimeUtil.toInstant(timeData.getComputedNow());
        log.info("computed now is : " + computedNow.toString());
        assertThat(lastYear.isBefore(computedNow)).describedAs(lastYear.toString() + " should be before " + computedNow
           .toString()).isTrue();

        Instant lastYear2 = Instant.now().minus(365, ChronoUnit.DAYS);
        log.info("last year 2 is : " + lastYear2.toString());
        assertThat(lastYear2.isBefore(computedNow)).describedAs(lastYear2.toString() + " should be before " +
           computedNow.toString
              ()).isTrue();
        mockMvc.perform(delete("/time"))
           .andExpect(status().isOk());

        mockMvc.perform(get("/time"))
           .andExpect(status().isOk())
           .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
           .andExpect(jsonPath("$.referenceTime", nullValue()))
           .andExpect(jsonPath("$.virtualTime", nullValue()))
           .andExpect(jsonPath("$.computedNow", notNullValue()))
           .andExpect(jsonPath("$.speed", is("X1")));
    }
}