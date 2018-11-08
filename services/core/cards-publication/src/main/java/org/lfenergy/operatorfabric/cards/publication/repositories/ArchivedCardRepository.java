package org.lfenergy.operatorfabric.cards.publication.repositories;

import org.lfenergy.operatorfabric.cards.publication.model.ArchivedCardPublicationData;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

/**
 * <p>Auto generated spring mongo reactive repository to access Archived Card collection</p>
 *
 * @author David Binder
 */
@Repository
public interface ArchivedCardRepository extends ReactiveMongoRepository<ArchivedCardPublicationData,String> {

    public Flux<ArchivedCardPublicationData> findByProcessId(String processId);
}
