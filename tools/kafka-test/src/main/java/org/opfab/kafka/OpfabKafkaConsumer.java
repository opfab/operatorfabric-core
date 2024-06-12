
/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
package org.opfab.kafka;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

import org.apache.kafka.clients.admin.Admin;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.admin.CreateTopicsResult;
import org.apache.kafka.clients.admin.ListTopicsResult;
import org.apache.kafka.common.KafkaFuture;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.errors.WakeupException;
import org.apache.kafka.common.header.Header;
import org.apache.kafka.common.header.Headers;
import org.apache.kafka.common.serialization.StringDeserializer;

import java.time.Duration;
import java.util.*;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;

@Slf4j
public class OpfabKafkaConsumer implements Runnable {
    private KafkaConsumer<Object, Object> kafka;
    private CountDownLatch startupLatch = new CountDownLatch(1);
    private CountDownLatch shutdownLatch = new CountDownLatch(1);
    private boolean partitionsAssigned = false;

    private BlockingQueue<String> outputList = new LinkedBlockingQueue<>();

    public OpfabKafkaConsumer(String kafkaTopic, String bootstrapServer) throws InterruptedException, ExecutionException {
        Properties cp = new Properties();
        cp.setProperty(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        cp.setProperty(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG,
                KafkaAvroWithoutRegistryDeserializer.class.getName());
        cp.setProperty(ConsumerConfig.GROUP_ID_CONFIG, "opfab-command");
        cp.setProperty(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServer);
        createConsumer(kafkaTopic, cp);
    }

    private void createConsumer(String kafkaTopic, Properties cp) throws InterruptedException, ExecutionException {
        createTopicIfNotExists(kafkaTopic, cp);
        kafka = new KafkaConsumer<>(cp);
        kafka.subscribe(Collections.singleton(kafkaTopic));


        Thread t = new Thread(this);
        t.start();

        log.debug("Waiting for consumer to be ready..");
        startupLatch.await();
        log.debug("consumer is ready");
    }

    public static Properties getDefaultProperties() {
        Properties cp = new Properties();
        cp.setProperty(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, "127.0.0.1:9092");

        cp.setProperty(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        cp.setProperty(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG,
                KafkaAvroWithoutRegistryDeserializer.class.getName());
        cp.setProperty(ConsumerConfig.GROUP_ID_CONFIG, "opfab-command");
        return cp;
    }

    private void createTopicIfNotExists(String topic, Properties cp) throws InterruptedException, ExecutionException {
        try (Admin admin = Admin.create(cp)) {
            ListTopicsResult topics = admin.listTopics();
            Set<String> topicNames = topics.names().get();
            if (!topicNames.contains(topic)) {
                int partitions = 1;
                short replicationFactor = 1;
                NewTopic newTopic = new NewTopic(topic, partitions, replicationFactor);

                CreateTopicsResult result = admin.createTopics(
                        Collections.singleton(newTopic));

                KafkaFuture<Void> future = result.values().get(topic);
                future.get();
            }
        }
    }

    public void close() throws InterruptedException {
        kafka.wakeup();
        shutdownLatch.await();
    }

    public void signalWhenReady() {

        if (!partitionsAssigned) {
            log.debug("checking partition assignment");
            Set<TopicPartition> partitions = kafka.assignment();
            if (!partitions.isEmpty()) {
                partitionsAssigned = true;
                log.debug("partitions assigned to consumer ...");
                startupLatch.countDown();
            }
        }
    }

    public void run() {
        try {
            while (true) {
                ConsumerRecords<Object, Object> records = kafka.poll(Duration.ofMillis(500));
                signalWhenReady();
                if (records != null && !records.isEmpty() ) {
                    for (ConsumerRecord<Object, Object> cunsumerRecord : records) {
                        Object key = cunsumerRecord.key();
                        Object value = cunsumerRecord.value();
                        Headers recordHeaders = cunsumerRecord.headers();
                        String str = convertToJsonString(key, value, recordHeaders);
                        outputList.put(str);
                    }
                }
            }
        } catch (WakeupException e) {
            log.debug("Got WakeupException");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } finally {
            log.debug("consumer is shutting down ...");
            kafka.close();
            log.debug("consumer is now shut down.");
            shutdownLatch.countDown();
        }
    }

    private String convertToJsonString(Object key, Object value, Headers recordHeaders) {
        ObjectMapper objectMapper = new ObjectMapper();
        Map<String, String> map = new HashMap<>();
        for (Header h : recordHeaders) {
            String headerKey = h.key();
            String headerValue = new String(h.value());
            map.put(headerKey, headerValue);
        }

        if (map.size() == 0) {
            return "{key: " + key + ", value: " + value + "}";
        } else {
            String headers;
            try {
                headers = objectMapper.writeValueAsString(map);
            } catch (JsonProcessingException e) {
                headers = "error";
                log.error("Unable to parse header");
            }
            return "{key: " + key + ", value: " + value + ", headers: " + headers + "}";
        }
    }

    public synchronized String poll(long timeout) throws InterruptedException {
        return outputList.poll(timeout, TimeUnit.MILLISECONDS);
    }

}