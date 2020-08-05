package org.lfenergy.operatorfabric.aop.process;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.lfenergy.operatorfabric.aop.process.mongo.models.UserActionTraceData;
import org.lfenergy.operatorfabric.users.model.User;
import org.springframework.context.annotation.Configuration;

import java.time.Instant;
import java.util.Objects;

@Aspect
@Configuration
@Slf4j
public class UserAcknowledgmentActionTraceAspect extends MongoActionTraceAspect {


    @AfterReturning(pointcut="execution(* org.lfenergy.operatorfabric.cards.publication.services.CardRepositoryService.addUserAck(..))",
            returning = "result")
    public void after(JoinPoint joinPoint,Object result) {

        if (result.hashCode() == Objects.hash(true, true)) {
            UserActionTraceData input = new UserActionTraceData(AopTraceType.ACK.getAction());
            User user = (User) joinPoint.getArgs()[0];
            input.setUserName(user.getLogin());
            input.setEntities(user.getEntities());
            input.setCardUid((String) joinPoint.getArgs()[1]);
            input.setActionDate(Instant.now());
            log.info("AOP TRACING : ==> "+input.toString());
            trace(input);
        }
    }
}
