package org.lfenergy.operatorfabric.cards.consultation.repositories;

import org.lfenergy.operatorfabric.cards.consultation.model.ArchivedCardConsultationData;
import org.lfenergy.operatorfabric.users.model.User;
import org.springframework.util.MultiValueMap;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuple2;

public interface ArchivedCardCustomRepository {

    public Flux<ArchivedCardConsultationData> findWithUserAndParams(Tuple2<User,MultiValueMap<String, String>> params);

    public Mono<ArchivedCardConsultationData> findByIdWithUser(String id, User user);

}
