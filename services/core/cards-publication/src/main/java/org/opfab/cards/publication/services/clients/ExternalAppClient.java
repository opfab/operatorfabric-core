package org.opfab.cards.publication.services.clients;

import org.opfab.cards.publication.model.CardPublicationData;

public interface ExternalAppClient {
    void sendCardToExternalApplication(CardPublicationData card) ;
}
