package org.lfenergy.operatorfabric.cards.publication.services;

import org.lfenergy.operatorfabric.aop.process.mongo.models.UserActionTraceData;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

@Repository
public interface TraceReposiory extends ReactiveMongoRepository<UserActionTraceData,String> {
    Mono<UserActionTraceData> findByCardUid(String cardUid);
    Mono<UserActionTraceData> findByCardUidAndActionAndUserName(String cardUid,String action,String userName);
    Mono<UserActionTraceData> findByCardUidAndAction(String cardUid,String action);
}