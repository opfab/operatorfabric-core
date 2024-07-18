/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
package org.opfab.kafka;

import org.apache.kafka.clients.producer.*;

import org.opfab.avro.CardCommand;
import org.opfab.avro.CommandType;
import org.opfab.avro.I18n;
import org.opfab.avro.SeverityType;

import lombok.extern.slf4j.Slf4j;

import org.opfab.avro.Card;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.concurrent.ExecutionException;

@Slf4j
public class OpfabKafkaProducer {

    private KafkaProducer<Object, Object> kafka;

    public OpfabKafkaProducer(String bootstrapServer) {
        Properties pp = new Properties();
        pp.setProperty(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServer);

        pp.setProperty(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, org.apache.kafka.common.serialization.StringSerializer.class.getName());
        pp.setProperty(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG,
                KafkaAvroWithoutRegistrySerializer.class.getName());

        pp.setProperty(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, "true");
        pp.setProperty(ProducerConfig.ACKS_CONFIG, "all");
        pp.setProperty(ProducerConfig.MAX_IN_FLIGHT_REQUESTS_PER_CONNECTION, "5");

        pp.setProperty(ProducerConfig.COMPRESSION_TYPE_CONFIG, "snappy");
        createKafkaProducer(pp);
    }

    private void createKafkaProducer(Properties pp) {
        kafka = new KafkaProducer<>(pp);
    }

    public void send(String topic, Map<String, String> cardMap) throws InterruptedException, ExecutionException {

        Instant startDate = Instant.now().truncatedTo(ChronoUnit.SECONDS);
        SeverityType severityType = SeverityType.INFORMATION;

        CardCommand cardCommand = CardCommand.newBuilder()
                .setCommand(CommandType.CREATE_CARD)
                .setCard(Card.newBuilder()
                        .setProcessInstanceId(cardMap.get("processInstanceId"))
                        .setProcess(cardMap.get("process"))
                        .setState(cardMap.get("state"))
                        .setPublisher(cardMap.get("publisher"))
                        .setProcessVersion(cardMap.get("processVersion"))
                        .setStartDate(startDate)
                        .setSeverity(severityType)
                        .setTitle(new I18n(cardMap.get("title"), null))
                        .setSummary(new I18n(cardMap.get("summary"), null))
                        .setGroupRecipients(getListFromCvsString(cardMap.get("groupRecipients")))
                        .setEntityRecipients(getListFromCvsString(cardMap.get("entityRecipients")))
                        .build())
                .build();
        sendCommand(topic, cardCommand);
    }

    public void delete(String topic, Map<String, Object> cardMap) throws InterruptedException, ExecutionException {

        CardCommand cardCommand = CardCommand.newBuilder()
                .setCommand(CommandType.DELETE_CARD)
                .setCard(Card.newBuilder()
                        .setProcessInstanceId((String) cardMap.get("processInstanceId"))
                        .setProcess((String)cardMap.get("process"))
                        .setState((String)cardMap.get("state"))
                        .setPublisher((String)cardMap.get("publisher"))
                        .setProcessVersion((String)cardMap.get("processVersion"))
                        .setStartDate(Instant.ofEpochMilli((Long) cardMap.get("startDate")))
                        .setSeverity(getSeverity((String) cardMap.get("processVersion")))
                        .setTitle(new I18n("message.title", null))
                        .setSummary(new I18n("message.summary", null))
                        .setEntityRecipients(getListFromCvsString((String) cardMap.get("entityRecipients")))
                        .build())
                .build();
        sendCommand(topic, cardCommand);
    }

    private void sendCommand(String topic, CardCommand cardCommand) throws InterruptedException, ExecutionException {
        ProducerRecord<Object, Object> cardRecord = new ProducerRecord<>(topic, cardCommand);
        java.util.concurrent.Future<RecordMetadata> result = kafka.send(cardRecord);
        result.get();
    }

    private List<String> getListFromCvsString(String input) {
        return input != null ? List.of(input.split(",")): null;
    }

    private SeverityType getSeverity(String severity) {
        SeverityType severityType;
        switch (severity) {
            case "COMPLIANT":
                severityType = SeverityType.COMPLIANT;
                break;
            case "ACTION":
                severityType = SeverityType.ACTION;
                break;
            case "ALARM":
                severityType = SeverityType.ALARM;
                break;
            default:
                severityType = SeverityType.INFORMATION;
                break;
        }
        return severityType;
    }

    public void close() {
        log.debug("producer is shutting down ...");
        kafka.close();
    }
}
