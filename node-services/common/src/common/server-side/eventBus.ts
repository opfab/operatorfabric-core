/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import manager from 'amqp-connection-manager';
import {IAmqpConnectionManager} from 'amqp-connection-manager/dist/types/AmqpConnectionManager';
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

    connection: IAmqpConnectionManager;

    listeners: EventListener[] = [];

    public setHost(host: string): this {
        this.host = host;
        return this;
    }

    public setPort(port: number): this {
        this.port = port;
        return this;
    }

    public setUsername(username: string): this {
        this.username = username;
        return this;
    }

    public setPassword(password: string): this {
        this.password = password;
        return this;
    }

    public setQueue(exchange: string, queue: string, queueConfig: any): this {
        this.exchange = exchange;
        this.queue = queue;
        this.queueConfig = queueConfig;
        return this;
    }

    public addListener(listener: EventListener): this {
        this.listeners.push(listener);
        return this;
    }

    private onConnection(): void {
        this.logger.info('EventBusListener connected!');
    }

    private onDisconnection(error: any): void {
        this.logger.error('EventBusListener disconnected!', error);
    }

    private onMessage(message: any): void {
        this.listeners.forEach((listener) => {
            listener.onMessage(message);
        });
    }

    public setLogger(logger: any): this {
        this.logger = logger;
        return this;
    }

    public start(): void {
        this.connection = manager.connect([
            'amqp://' + this.username + ':' + this.password + '@' + this.host + ':' + this.port
        ]);
        this.connection.on('connect', () => {
            this.onConnection();
        });
        this.connection.on('disconnect', (err) => {
            this.onDisconnection(err);
        });

        const channelWrapper = this.connection.createChannel({
            setup: async (channel: any) =>
                await Promise.all([
                    channel.assertQueue(this.queue, this.queueConfig),
                    channel.assertExchange(this.exchange, 'fanout', {}),
                    channel.prefetch(1),
                    channel.bindQueue(this.queue, this.exchange, '#'),
                    channel.consume(
                        this.queue,
                        (msg: any) => {
                            this.onMessage(msg);
                        },
                        {
                            noAck: true
                        }
                    )
                ])
        });

        channelWrapper
            .waitForConnect()
            .then(() => {
                this.logger.info('EventBusListener listening for messages');
            })
            .catch((err) => {
                this.logger.error('Error while waiting for connect : ' + JSON.stringify(err));
            });
    }

    public stop(): void {
        if (this.connection != null) {
            this.connection.close().catch((err) => {
                this.logger.error('Error while closing connection : ' + JSON.stringify(err));
            });
        }
    }
}
