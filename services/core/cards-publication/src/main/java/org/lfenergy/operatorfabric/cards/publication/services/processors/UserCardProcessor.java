package org.lfenergy.operatorfabric.cards.publication.services.processors;

import org.lfenergy.operatorfabric.cards.publication.model.CardPublicationData;
import org.lfenergy.operatorfabric.users.model.User;

public interface UserCardProcessor {
    String processPublisher(CardPublicationData card, User user);
}
