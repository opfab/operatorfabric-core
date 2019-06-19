package org.lfenergy.operatorfabric.cards.consultation.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CardSubscriptionDto implements Subscription {
    private Instant rangeStart;
    private Instant rangeEnd;
    private List<String> loadedCards;

}
