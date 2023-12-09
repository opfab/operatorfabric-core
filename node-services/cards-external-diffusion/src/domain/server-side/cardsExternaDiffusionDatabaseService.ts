/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Db, MongoClient} from 'mongodb';
import {Logger} from 'winston';

export default class CardsExternalDiffusionDatabaseService {
    logger: Logger;
    mongoClient: MongoClient;
    mongoDB: Db;
    mongoConfig: any;
    retryInterval = 5000; // Retry every 5 seconds

    public setMongoDbConfiguration(mongoConfig: any) {
        this.mongoConfig = mongoConfig;
        this.mongoClient = new MongoClient(mongoConfig.uri);
        return this;
    }

    public setLogger(logger: any) {
        this.logger = logger;
        return this;
    }

    public async connectToMongoDB() {
        await this.connectWithRetry();
    }

    private async connectWithRetry() {
        while (true) {
            try {
                this.logger.info('Try to open database ' + this.mongoConfig.database);
                this.mongoClient = await MongoClient.connect(this.mongoConfig.uri);
                this.logger.info('Connection to mongo DB opened for database ' + this.mongoConfig.database);
                this.mongoDB = this.mongoClient.db(this.mongoConfig.database);

                this.mongoClient.on('close', () => {
                    this.logger.error('MongoDB connection closed unexpectedly');
                    // Attempt to reconnect after a delay
                    setTimeout(() => {
                        this.connectWithRetry();
                    }, this.retryInterval);
                });
                this.mongoClient.on('error', (err) => {
                    this.logger.error('MongoDB client error: ' + JSON.stringify(err));
                });
                break;
            } catch (err) {
                this.logger.error('Failed to connect to MongoDB , error = ' + JSON.stringify(err));
                await new Promise((resolve) => setTimeout(resolve, this.retryInterval));
            }
        }
    }

    public async getSentMail(cardUid: string, email: string): Promise<any> {
        let sent = null;
        try {
            sent = await this.mongoDB.collection('cardsExternalDiffusion-mailsAlreadySent').findOne({cardUid: cardUid, email: email});
        } catch (error) {
            this.logger.error('Mongo error finding sent mail' + error);
        }
        return Promise.resolve(sent);
    }

    public async persistSentMail(cardUid: string, email: string): Promise<void> {
        try {
            await this.mongoDB.collection('cardsExternalDiffusion-mailsAlreadySent').insertOne({cardUid: cardUid, email: email, date: Date.now()});
        } catch (error) {
            this.logger.error('Mongo error saving sent mail' + error);
        }
        return Promise.resolve();
    }


    public async deleteMailsSentBefore(dateLimit: number): Promise<void> {

        try {
            await this.mongoDB.collection('cardsExternalDiffusion-mailsAlreadySent').deleteMany({date: {$lte: dateLimit}});
        } catch (error) {
            this.logger.error('Mongo error saving sent mail' + error);
        }
        return Promise.resolve();
    }

}