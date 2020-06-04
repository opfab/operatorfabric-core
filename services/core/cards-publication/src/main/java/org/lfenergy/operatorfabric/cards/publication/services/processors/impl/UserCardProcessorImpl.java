package org.lfenergy.operatorfabric.cards.publication.services.processors.impl;

import org.lfenergy.operatorfabric.cards.publication.model.CardPublicationData;
import org.lfenergy.operatorfabric.cards.publication.services.processors.UserCardProcessor;
import org.lfenergy.operatorfabric.users.model.User;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class UserCardProcessorImpl implements UserCardProcessor {

    public String processPublisher(CardPublicationData card, User user) {

        Optional<List<String>> entitiesUser= Optional.ofNullable(user.getEntities());

        //take first entity of the user as the card publisher id
        if(entitiesUser.isPresent() && !entitiesUser.get().isEmpty()) {
            card.setPublisher(entitiesUser.get().get(0));
            return entitiesUser.get().get(0);

        }
        //no possible calculation of publisher id from card and user arguments,
        // throw a runtime exception to be handled by Mono.onErrorResume()
        throw new IllegalArgumentException("action not authorized, the card is rejected");

    }

}
