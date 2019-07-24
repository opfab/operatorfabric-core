package org.lfenergy.operatorfabric.cards.consultation.repositories;

import org.lfenergy.operatorfabric.cards.consultation.model.ArchivedCardConsultationData;
import org.springframework.util.MultiValueMap;
import reactor.core.publisher.Flux;

public interface ArchivedCardCustomRepository {

    public Flux<ArchivedCardConsultationData> findWithParams(MultiValueMap<String, String> params);

}
