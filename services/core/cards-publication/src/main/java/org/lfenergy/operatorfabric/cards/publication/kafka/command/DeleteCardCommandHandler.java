package org.lfenergy.operatorfabric.cards.publication.kafka.command;

import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.avro.CardCommand;
import org.lfenergy.operatorfabric.avro.CommandType;
import org.lfenergy.operatorfabric.cards.publication.model.CardPublicationData;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class DeleteCardCommandHandler extends BaseCommandHandler implements CommandHandler {

    @Override
    public CommandType getCommandType() {
        return CommandType.DELETE_CARD;
    }

    @Override
    public void executeCommand(CardCommand cardCommand) {
        log.debug("Received Kafka DELETE CARD with processInstanceId {}, taskId {} and variables: {}",
                cardCommand.getProcessInstanceId(), cardCommand.getProcess(), cardCommand.getCard().getData());

        CardPublicationData card = buildCardPublicationData(cardCommand);
        cardProcessingService.deleteCard(card.getProcessInstanceId());
    }
}
