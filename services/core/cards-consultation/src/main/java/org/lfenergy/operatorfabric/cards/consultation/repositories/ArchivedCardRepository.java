
package org.lfenergy.operatorfabric.cards.consultation.repositories;

import org.lfenergy.operatorfabric.cards.consultation.model.ArchivedCardConsultationData;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;

/**
 * <p>Custom spring mongo reactive repository to access the archived {@link org.lfenergy.operatorfabric.cards.consultation.model.Card} mongodb collection</p>
 *
 * @author Alexandra Guironnet
 */
@Repository
public interface ArchivedCardRepository extends ReactiveMongoRepository<ArchivedCardConsultationData, String>, ArchivedCardCustomRepository {


}
