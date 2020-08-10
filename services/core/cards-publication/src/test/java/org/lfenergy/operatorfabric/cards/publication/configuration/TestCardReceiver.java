/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.lfenergy.operatorfabric.cards.publication.configuration;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.cards.model.CardOperation;
import org.lfenergy.operatorfabric.cards.publication.model.CardOperationData;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.LinkedList;
import java.util.Queue;

/**
 * <p></p>
 * Created on 06/08/18
 *
 */
@Component
@Slf4j
public class TestCardReceiver {

    Queue<CardOperationData> groupQueue = new LinkedList<>();
    Queue<CardOperationData> ericQueue = new LinkedList<>();
    private ObjectMapper mapper;

    @Autowired
    public TestCardReceiver(ObjectMapper mapper){
        this.mapper = mapper;
    }

    @RabbitListener(queues = "#{groupQueue.name}")
    public void receiveGroup(Message message) throws IOException {
        String cardString = new String(message.getBody());
        log.info("receiving group card");
        CardOperationData card = mapper.readValue(cardString, CardOperationData.class);
        groupQueue.add(card);
    }

    @RabbitListener(queues = "#{userQueue.name}")
    public void receiveUser(Message message) throws IOException {
        String cardString = new String(message.getBody());
        log.info("receiving user card");
        CardOperationData card = mapper.readValue(cardString, CardOperationData.class);
        ericQueue.add(card);
    }

    public void clear(){
        log.info("clearing data");
        groupQueue.clear();
        ericQueue.clear();
    }

    public Queue<CardOperationData> getGroupQueue() {
        return groupQueue;
    }

    public Queue<CardOperationData> getEricQueue() {
        return ericQueue;
    }
}
