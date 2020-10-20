package org.lfenergy.operatorfabric.cards.publication.kafka.command;

import org.lfenergy.operatorfabric.avro.CardCommand;
import org.lfenergy.operatorfabric.avro.CommandType;

public interface CommandHandler {

    CommandType getCommandType();

    void executeCommand(CardCommand cardCommand);
}
