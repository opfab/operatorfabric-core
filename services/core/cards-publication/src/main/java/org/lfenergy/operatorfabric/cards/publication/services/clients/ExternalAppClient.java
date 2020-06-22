package org.lfenergy.operatorfabric.cards.publication.services.clients;

import org.lfenergy.operatorfabric.cards.publication.model.CardPublicationData;

public interface ExternalAppClient {
    void sendCardToExternalApplication(CardPublicationData card) ;
}
