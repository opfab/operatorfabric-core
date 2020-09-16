package org.lfenergy.operatorfabric.cards.publication.kafka.command;

import org.lfenergy.operatorfabric.avro.CardCommand;
import org.lfenergy.operatorfabric.avro.CommandType;
import org.springframework.stereotype.Component;

@Component
public class DeleteCardCommandHandler extends BaseCommandHandler implements CommandHandler {

    public DeleteCardCommandHandler() {
        super();
    }

    @Override
    public CommandType getCommandType() {
        return CommandType.DELETE_CARD;
    }

    @Override
    public void executeCommand(CardCommand cardCommand) {

    }

}
