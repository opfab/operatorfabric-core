/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.utilities.eventbus.rabbit;


import org.apache.commons.pool2.BasePooledObjectFactory;
import org.apache.commons.pool2.PooledObject;
import org.apache.commons.pool2.impl.DefaultPooledObject;

import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;

import lombok.extern.slf4j.Slf4j;


@Slf4j
public class ChannelFactory  extends BasePooledObjectFactory<Channel>{

    Connection connection;

    public ChannelFactory(Connection connection) {
        this.connection =  connection;
    }

    @Override
    public Channel create() throws Exception {
        return connection.createChannel();
    }

    @Override
    public PooledObject<Channel> wrap(Channel channel) {
        return new DefaultPooledObject<>(channel);
    }


    @Override
    public void destroyObject(PooledObject<Channel> pooledObject) {
        try {
            pooledObject.getObject().close();
        }
        catch (Exception exc)
        {
            log.error("Impossible to close channel",exc);
        }
    }

}
