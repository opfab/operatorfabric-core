/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.utilities;

import org.springframework.amqp.AmqpException;
import org.springframework.amqp.core.AmqpAdmin;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.FanoutExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class AmqpUtils {

    private AmqpUtils() {
    }
    
        /**
     * <p>Constructs a non durable queue to exchange using queue name</p>
     * @return
     */
    public static Queue createQueue(AmqpAdmin amqpAdmin, String queueName, FanoutExchange exchange, int retries, long retryInterval) {
        log.debug("CREATE queue {}", queueName);
        Queue queue = QueueBuilder.nonDurable(queueName).build();
        boolean created = false;
        int retry = 1;
        while (!created) {
            try {
                amqpAdmin.declareQueue(queue);
    
                Binding binding = BindingBuilder.bind(queue).to(exchange);
                amqpAdmin.declareBinding(binding);
                created = true;
            } catch (AmqpException ex) {
                log.info("Queue creation failed for queue {}, retry {}", queueName, retry);
                if (retry == retries) {
                    throw ex;
                }
                try {
                    Thread.sleep(retryInterval);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
                retry++;
            }
        }
        return queue;
    }
}
