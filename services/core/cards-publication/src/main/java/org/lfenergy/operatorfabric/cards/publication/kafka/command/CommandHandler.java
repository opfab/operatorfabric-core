package org.lfenergy.operatorfabric.cards.publication.kafka.command;

import com.fasterxml.jackson.core.JsonProcessingException;
import org.lfenergy.operatorfabric.avro.CardCommand;
import org.lfenergy.operatorfabric.avro.CommandType;

public interface CommandHandler {

    CommandType getCommandType();

    void executeCommand(CardCommand cardCommand);
}
