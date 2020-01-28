
package org.lfenergy.operatorfabric.cards.consultation.repositories;

import org.lfenergy.operatorfabric.cards.consultation.model.CardConsultationData;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import java.time.Instant;

/**
 * <p>Custom spring mongo reactive repository to access {@link org.lfenergy.operatorfabric.cards.consultation.model.Card} mongodb collection</p>
 *
 * @author David Binder
 */
@Repository
public interface CardRepository extends ReactiveMongoRepository<CardConsultationData, String>, CardOperationRepository, CardCustomRepository {

//    /**
//     * Finds next card if any whose startDate is before a specified date
//     * @param pivotalInstant specified reference date
//     * @return Card result or empty Mono
//     */
//    Mono<CardConsultationData> findFirstByStartDateLessThanEqualOrderByStartDateDescIdAsc(Instant pivotalInstant);
//

//    Mono<CardConsultationData> findFirstByStartDateGreaterThanEqualOrderByStartDateAscIdAsc(Instant pivotalInstant);

}
