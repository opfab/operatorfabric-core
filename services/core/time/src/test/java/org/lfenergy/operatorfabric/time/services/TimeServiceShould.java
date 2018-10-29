/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.time.services;

import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.lfenergy.operatorfabric.time.application.IntegrationTestApplication;
import org.lfenergy.operatorfabric.time.model.SpeedEnum;
import org.lfenergy.operatorfabric.time.model.TimeData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static org.assertj.core.api.Assertions.assertThat;

//import org.hamcrest.MatcherAssert;
//import static org.hamcrest.Matchers.is;

/**
 * <p></p>
 * Created on 25/06/18
 *
 * @author davibind
 */
@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = {IntegrationTestApplication.class})
@Slf4j
@ActiveProfiles("test")
@Tag("end-to-end")
@Tag("amqp")
class TimeServiceShould {

  @Autowired
  private TimeService timeModule;

  @AfterEach
  public void reset() {
    timeModule.reset();
  }

  @Test
  public void setAndResetTime() throws Exception {
//    consumers.add(registerTimeConsumer());

    Instant now = Instant.now();
    log.info("now is : " + now.toString());
    Instant lastYear = now.minus(365, ChronoUnit.DAYS);
    log.info("last year is : " + lastYear.toString());
    timeModule.setTime(lastYear);
    Thread.sleep(1500);
    Instant computedNow = timeModule.computeNow();
    log.info("computed now is : " + computedNow.toString());
    assertThat(timeModule.fetchTimeData().getCurrentTime()).isEqualTo(lastYear.toEpochMilli());
    assertThat(lastYear.isBefore(computedNow)).describedAs(lastYear.toString() + " should be before " + computedNow
       .toString()).isTrue();

    Instant lastYear2 = Instant.now().minus(365, ChronoUnit.DAYS).plusMillis(1);
    log.info("last year 2 is : " + lastYear2.toString());
    assertThat(computedNow.isBefore(lastYear2)).describedAs(computedNow.toString() + " should be before " +
       lastYear2.toString
          ()).isTrue();
    timeModule.reset();
  TimeData resetedTimeData = timeModule.fetchTimeData();
  assertThat(resetedTimeData.getCurrentTime()).isNull();
  assertThat(resetedTimeData.getReferenceTime()).isNull();
  assertThat(resetedTimeData.getSpeed()).isEqualTo(SpeedEnum.X1);
  }

  @Test
  public void setSpeedAndTime() throws InterruptedException {
    // The following call is meant to be sure that the timeModule is already instance
    // (its post-construct method can make us lose 1 millis which leads to a test failure)
    Instant now = Instant.now();
    log.info("now is : " + now.toString());
    Instant lastYear = now.minus(365, ChronoUnit.DAYS);
    log.info("last year is : " + lastYear.toString());
    SpeedEnum speed = SpeedEnum.X10;
    timeModule.setSpeedAndTime(speed, lastYear);
    log.info("now is "+now.toString());
    Thread.sleep(2000);
    TimeData result = timeModule.fetchTimeData();

    Instant computedNow = timeModule.computeNow();
    Instant nowAfterSleep = Instant.now();

    log.info("computed now is "+computedNow.toString());
    assertThat(lastYear.isBefore(computedNow)).describedAs(lastYear.toString() + " should be before " +
       computedNow.toString()).isTrue();

    long millisSince = now.until(nowAfterSleep, ChronoUnit.MILLIS);
    log.info("delta is "+millisSince+" ms");
    Instant end = lastYear.plus(Math.round(millisSince * speed.coef)+1, ChronoUnit.MILLIS);
    log.info("end is "+end.toString());
    assertThat(!computedNow.isAfter(end)).describedAs(computedNow.toString() + " should be before " + end.toString
       ()).isTrue();
  }


  @Test
  public void setSPeed10() throws Exception {
    SpeedEnum speed;
    speed = SpeedEnum.X10;
    setSpeed0(speed);
  }

  @Test
  public void setSPeed2() throws Exception {
    SpeedEnum speed = SpeedEnum.X2;
    setSpeed0(speed);
  }

  @Test
  public void setSPeedHalf() throws Exception {
    SpeedEnum speed = SpeedEnum.HALF;
    setSpeed0(speed);
  }

  public void setSpeed0(SpeedEnum speed) throws InterruptedException {
      // The following call is meant to be sure that the timeModule is already instance
      // (its post-construct method can make us lose 1 millis which leads to a test failure)
      timeModule.computeNow();

      Instant nowBeforeSleep = Instant.now();
      timeModule.setSpeed(speed);
      log.info("now is "+nowBeforeSleep.toString());
      Thread.sleep(2000);
      TimeData result = timeModule.fetchTimeData();

      Instant computedNow = timeModule.computeNow();
      Instant nowAfterSleep = Instant.now();

      log.info("computed now is "+computedNow.toString());
      assertThat(result.getCurrentTime()).isEqualTo(result.getReferenceTime());
      assertThat(nowBeforeSleep.isBefore(computedNow)).describedAs(nowBeforeSleep.toString() + " should be before " +
         computedNow.toString()).isTrue();

      long millisSince = nowBeforeSleep.until(nowAfterSleep, ChronoUnit.MILLIS);
      log.info("delta is "+millisSince+" ms");
      Instant end = nowBeforeSleep.plus(Math.round(millisSince * speed.coef)+1, ChronoUnit.MILLIS);
      log.info("end is "+end.toString());
      assertThat(!computedNow.isAfter(end)).describedAs(computedNow.toString() + " should be before " + end.toString
         ()).isTrue();
  }
  
}