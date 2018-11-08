package org.lfenergy.operatorfabric.cards.publication.repositories;

import org.lfenergy.operatorfabric.cards.publication.model.CardPublicationData;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

/**
 * <p>Auto generated spring mongo reactive repository to access Card collection</p>
 *
 * @author David Binder
 */
@Repository
public interface CardRepository extends ReactiveMongoRepository<CardPublicationData,String> {

    public Mono<CardPublicationData> findByProcessId(String processId);
}
