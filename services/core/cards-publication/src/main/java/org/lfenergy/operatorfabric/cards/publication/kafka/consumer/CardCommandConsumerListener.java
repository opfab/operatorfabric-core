package org.lfenergy.operatorfabric.cards.publication.kafka.consumer;

import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.lfenergy.operatorfabric.avro.CardCommand;
import org.lfenergy.operatorfabric.avro.CommandType;
import org.lfenergy.operatorfabric.cards.publication.kafka.command.CommandHandler;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Component
//@ConditionalOnExpression("!T(org.springframework.util.StringUtils).isEmpty('${spring.kafka.topics.name:}')")
public class CardCommandConsumerListener {

    private final Map<CommandType,CommandHandler> commandHandlerMap;

    public CardCommandConsumerListener(List<CommandHandler> commandHandlerList) {
        commandHandlerMap = commandHandlerList.stream()
                .collect(Collectors.toMap(CommandHandler::getCommandType, it -> it));
    }

    @KafkaListener(topics = "${spoc.kafka.topics.topicname:opfab}", containerFactory = "kafkaListenerContainerFactory")
    public void receivedCommand(@Payload ConsumerRecord<String, CardCommand> record) {
        log.info("Key: {}, Value: {}, Partition: {}, Offset: {}",
                record.key(), record.value(), record.partition(), record.offset());
        CardCommand cardCommand = record.value();
        log.debug("Received {}", cardCommand);

        CommandHandler commandHandler = commandHandlerMap.get(cardCommand.getCommand());
        if (commandHandler != null) {
            commandHandler.executeCommand(cardCommand);
        }
        else {
            throw new IllegalStateException("No command handler available for " + cardCommand.getCommand());
        }
    }
}
