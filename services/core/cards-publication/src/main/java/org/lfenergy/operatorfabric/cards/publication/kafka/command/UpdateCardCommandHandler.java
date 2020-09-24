package org.lfenergy.operatorfabric.cards.publication.kafka.command;

import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.avro.CardCommand;
import org.lfenergy.operatorfabric.avro.CommandType;
import org.lfenergy.operatorfabric.cards.publication.model.CardPublicationData;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;

@Component
@Slf4j
public class UpdateCardCommandHandler extends BaseCommandHandler implements CommandHandler {

    @Override
    public CommandType getCommandType() {
        return CommandType.UPDATE_CARD;
    }

    @Override
    public void executeCommand(CardCommand cardCommand) {
        log.debug("Received Kafka UPDATE CARD with processInstanceId {}, taskId {} and variables: {}",
                cardCommand.getProcessInstanceId(), cardCommand.getProcess(), cardCommand.getCard().getData());

        CardPublicationData card = buildCardPublicationData(cardCommand);
        cardProcessingService.processCards(Flux.just(card)).subscribe();
    }
}
