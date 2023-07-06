/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import manager from 'amqp-connection-manager';
import {IAmqpConnectionManager} from 'amqp-connection-manager/dist/esm/AmqpConnectionManager';
import {EventListener} from './eventListener';

export default class EventBus {
    host: string;
    port: number;
    username: string;
    password: string;
        
    exchange: string;
    queue: string;
    queueConfig: any;

    logger: any;

    onConnectionCallback: Function;
    onDisconnectionCallback: Function;
    onMessageCallback: Function;
    connection: IAmqpConnectionManager;

    listeners : Array<EventListener> = [];


    public setHost(host: string) {
        this.host = host;
        return this;
    }

    public setPort(port: number) {
        this.port = port;
        return this;
    }

    public setUsername(username: string) {
        this.username = username;
        return this;
    }

    public setPassword(password: string) {
        this.password = password;
        return this;
    }

    public setQueue(exchange: string, queue: string, queueConfig: any) {
        this.exchange = exchange;
        this.queue = queue;
        this.queueConfig = queueConfig;
        return this;
    }

    public addListener(listener: EventListener) {
        this.listeners.push(listener);
        return this;
    }

    private onConnection() {
        this.logger.info('EventBusListener connected!');
    }

    private onDisconnection(error: any) {
        this.logger.error('EventBusListener disconnected!', error);
    }

    private onMessage(message: any) {
        this.listeners.forEach(listener => listener.onMessage(message));
    }

    public setLogger(logger: any) {
        this.logger = logger;
        return this;
    }

    public start() {
        const that = this;
        this.connection = manager.connect(['amqp://' + this.username + ":" + this.password + '@' + this.host + ':' + this.port]);
        this.connection.on('connect', () => this.onConnection());
        this.connection.on('disconnect', err => this.onDisconnection( err));

        const channelWrapper = this.connection.createChannel({
            setup: (channel : any) => 

             Promise.all([
                channel.assertQueue(this.queue, this.queueConfig),
                channel.assertExchange(this.exchange, 'fanout', { }),
                channel.prefetch(1),
                channel.bindQueue(this.queue, this.exchange, '#'),
                channel.consume(this.queue, function(msg: any) {
                    that.onMessage(msg);
                  }, {
                      noAck: true
                    })
            ])
        });

        channelWrapper.waitForConnect()
            .then(function() {
                that.logger.info("EventBusListener listening for messages");
            });
    }

    public stop() {
        if (this.connection) {
            this.connection.close();
        }
    }

}