package org.lfenergy.operatorfabric.cards.publication.kafka.command;

import com.google.gson.*;
import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.avro.Card;
import org.lfenergy.operatorfabric.avro.CardCommand;
import org.lfenergy.operatorfabric.cards.publication.model.*;
import org.springframework.beans.factory.annotation.Autowired;


@Slf4j
public class BaseCommandHandler {

    @Autowired
    private  Gson gson;

    protected CardPublicationData buildCardPublicationData(CardCommand cardCommand) {
        Card kafkaCard = cardCommand.getCard();

        CardPublicationData card = gson.fromJson(gson.toJson(kafkaCard), CardPublicationData.class);
        card.setProcess(cardCommand.getProcess());
        card.setProcessInstanceId(cardCommand.getProcessInstanceId());
        return card;
    }
}
