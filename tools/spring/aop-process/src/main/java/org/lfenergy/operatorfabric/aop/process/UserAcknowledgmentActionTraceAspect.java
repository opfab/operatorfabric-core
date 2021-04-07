/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
package org.lfenergy.operatorfabric.aop.process;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.lfenergy.operatorfabric.aop.process.mongo.models.UserActionTraceData;
import org.opfab.client.users.model.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.time.Instant;
import java.util.Objects;

@Aspect
@Configuration
@Slf4j
public class UserAcknowledgmentActionTraceAspect extends MongoActionTraceAspect {

    @Value("${operatorfabric.businessLogActivated:false}") boolean isBusinessLogActivated;

    @AfterReturning(pointcut="execution(* org.lfenergy.operatorfabric.cards.publication.services.CardRepositoryService.addUserAck(..))",
            returning = "result")
    public void after(JoinPoint joinPoint,Object result) {

        if ((isBusinessLogActivated) && (result.hashCode() == Objects.hash(true, true))) {
            UserActionTraceData input = new UserActionTraceData(AopTraceType.ACK.getAction());
            User user = (User) joinPoint.getArgs()[0];
            input.setUserName(user.getLogin());
            input.setEntities(user.getEntities());
            input.setCardUid((String) joinPoint.getArgs()[1]);
            input.setActionDate(Instant.now());
            log.debug("AOP TRACING : ==> "+input.toString());
            trace(input);
        }
    }
}
