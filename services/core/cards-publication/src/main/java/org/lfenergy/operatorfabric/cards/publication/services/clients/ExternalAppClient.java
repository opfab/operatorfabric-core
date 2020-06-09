package org.lfenergy.operatorfabric.cards.publication.services.clients;

import org.lfenergy.operatorfabric.cards.publication.model.CardPublicationData;
import org.lfenergy.operatorfabric.users.model.User;

public interface ExternalAppClient {
    void sendCardToExternalApplication(CardPublicationData card) ;
}
