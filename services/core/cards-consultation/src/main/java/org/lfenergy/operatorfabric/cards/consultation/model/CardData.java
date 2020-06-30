package org.lfenergy.operatorfabric.cards.consultation.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CardData {
    private CardConsultationData card;
    private List<CardConsultationData> childCards;
}
