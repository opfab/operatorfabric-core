package org.lfenergy.operatorfabric.cards.consultation.repositories;

import org.lfenergy.operatorfabric.cards.consultation.model.CardConsultationData;
/*
* <p>Needed to avoid trouble at runtime when springframework try to create mongorequest for findByIdWithUser method</p>
* */
public interface CardCustomRepository extends UserUtilitiesCommonToCardRepository<CardConsultationData> {
}
