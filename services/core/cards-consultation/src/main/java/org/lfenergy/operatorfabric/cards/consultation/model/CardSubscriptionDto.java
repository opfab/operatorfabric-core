package org.lfenergy.operatorfabric.cards.consultation.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CardSubscriptionDto implements Subscription {
    private Long rangeStart;
    private Long rangeEnd;
    private List<String> loadedCards;

}
