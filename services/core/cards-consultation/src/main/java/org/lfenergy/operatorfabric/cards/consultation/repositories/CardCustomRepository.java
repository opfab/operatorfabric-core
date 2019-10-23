package org.lfenergy.operatorfabric.cards.consultation.repositories;

import org.lfenergy.operatorfabric.cards.consultation.model.CardConsultationData;
import org.lfenergy.operatorfabric.users.model.User;
import reactor.core.publisher.Mono;

import java.time.Instant;

/*
* <p>Needed to avoid trouble at runtime when springframework try to create mongo request for findByIdWithUser method</p>
* */
public interface CardCustomRepository extends UserUtilitiesCommonToCardRepository<CardConsultationData> {

    public Mono<CardConsultationData> trucTestMachin(Instant pivotalInstant, User user);
}
