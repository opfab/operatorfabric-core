/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.sse;


import io.gatling.javaapi.core.*;
import io.gatling.javaapi.http.*;
import java.util.Arrays;
import java.util.Collections;

import static io.gatling.javaapi.core.CoreDsl.*;
import static io.gatling.javaapi.http.HttpDsl.*;

public class SseTest extends Simulation {

  HttpProtocolBuilder httpProtocol = http
    .baseUrl("http://localhost:2002");    

  ScenarioBuilder scn = scenario("Subscription")
  .feed(listFeeder(Arrays.asList(
    Collections.singletonMap("username", "operator1_fr"),
    Collections.singletonMap("username", "operator2_fr"),
    Collections.singletonMap("username", "operator3_fr"),
    Collections.singletonMap("username", "operator4_fr"),
    Collections.singletonMap("username", "operator1_it"),
    Collections.singletonMap("username", "operator2_it"),
    Collections.singletonMap("username", "operator1_nl"),
    Collections.singletonMap("username", "operator2_nl")
  )).circular())
    .exec(http("auth")
    .post("/auth/token")
    .asFormUrlEncoded()
    .formParam("grant_type", "password")
    .formParam("username", "#{username}")
    .formParam("password", "test")
    .formParam("client_id", "opfab-client")
    .check(jmesPath("access_token").ofString()
    .exists().saveAs("access_token")))

    .exec(sse("subscribe")
      .connect("/cards-consultation/cardSubscription?clientId=" + java.util.UUID.randomUUID() + "&version=SNAPSHOT&notification=true")
      .header("Authorization", "Bearer #{access_token}")
      .await(10).on(
        sse.checkMessage("init").check(regex("INIT"))
      ),
      sse("Close").close()
    );
      
  {
    setUp(
      scn.injectOpen(rampUsers(200).during(30))
    ).protocols(httpProtocol);
  }
}