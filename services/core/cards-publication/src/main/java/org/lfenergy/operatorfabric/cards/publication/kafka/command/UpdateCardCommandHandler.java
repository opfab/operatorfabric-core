package org.lfenergy.operatorfabric.cards.publication.kafka.command;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.avro.CardCommand;
import org.lfenergy.operatorfabric.avro.CommandType;
import org.lfenergy.operatorfabric.cards.publication.model.CardPublicationData;
import org.lfenergy.operatorfabric.cards.publication.services.CardProcessingService;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;

@Component
@Slf4j
public class UpdateCardCommandHandler extends BaseCommandHandler implements CommandHandler {

    private final CardProcessingService cardProcessingService;

    public UpdateCardCommandHandler(CardProcessingService cardProcessingService, ObjectMapper objectMapper) {
        super(objectMapper);
        this.cardProcessingService = cardProcessingService;
    }

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
