package org.lfenergy.operatorfabric.cards.publication.repositories;

import org.lfenergy.operatorfabric.aop.process.mongo.models.UserActionTraceData;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

/**
 * <p>Auto generated spring mongo reactive repository to access users_action collection</p>
 *
 */
@Repository
public interface TraceReposioryForTest extends ReactiveMongoRepository<UserActionTraceData,String> {

    Mono<UserActionTraceData> findByCardUid(String cardUid);
    Mono<UserActionTraceData> findByCardUidAndActionAndUserName(String cardUid,String action,String userName);
}
