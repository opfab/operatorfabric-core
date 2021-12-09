package org.opfab.cards.publication.services.processors;

import org.opfab.cards.publication.model.CardPublicationData;
import org.opfab.users.model.CurrentUserWithPerimeters;

public interface UserCardProcessor {
    String processPublisher(CardPublicationData card, CurrentUserWithPerimeters user);
}
