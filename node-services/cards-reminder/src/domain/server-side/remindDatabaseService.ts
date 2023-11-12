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

export default class RemindDatabaseService {
    logger: Logger;
    mongoClient: MongoClient;
    mongoDB: Db;
    remindersCollection: string;
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

    public setRemindersCollection(remindersCollection: string) {
        this.remindersCollection = remindersCollection;
        return this;
    }

    public async getItemsToRemindNow(): Promise<any[]> {
        return this.mongoDB
            .collection(this.remindersCollection)
            .find({timeForReminding: {$lte: new Date().valueOf()}})
            .toArray();
    }

    public async getAllCardsWithReminder(): Promise<any[]> {
        return this.mongoDB
            .collection('cards')
            .find({
                $and: [
                    {secondsBeforeTimeSpanForReminder: {$exists: true}},
                    {$or: [{endDate: {$exists: false}}, {endDate: {$gte: new Date()}}]}
                ]
            })
            .project({
                id: '$_id',
                uid: 1,
                startDate: 1,
                endDate: 1,
                secondsBeforeTimeSpanForReminder: 1,
                timeSpans:1,
                rRule:1
            })
            .toArray();
    }

    public getReminder(id: string) {
        return this.mongoDB.collection(this.remindersCollection).findOne({cardId: id});
    }

    public async persistReminder(reminder: any): Promise<void> {
        try {
            reminder._id = reminder.cardId; // we have a unique entry per card
            await this.mongoDB.collection(this.remindersCollection).insertOne(reminder);
        } catch (error) {
            this.logger.error('Mongo error in insert reminder' + error);
        }
        return Promise.resolve();
    }

    public async updateReminder(updatedReminder: any): Promise<void> {
        try {
            await this.mongoDB
                .collection(this.remindersCollection)
                .updateOne({cardId: updatedReminder.cardId}, {$set: updatedReminder});
        } catch (error) {
            this.logger.error('Mongo error in update reminder' + error);
        }
        return Promise.resolve();
    }

    public async removeReminder(id: string): Promise<void> {
        try {
            await this.mongoDB.collection(this.remindersCollection).deleteOne({cardId: id});
        } catch (error) {
            this.logger.error('Mongo error in remove reminder' + error);
        }
        return Promise.resolve();
    }

    public async getCardByUid(uid: string) {
        return this.mongoDB.collection('cards').findOne(
            {uid: uid},
            {
                projection: {
                    id: '$_id',
                    uid: 1,
                    startDate: 1,
                    endDate: 1,
                    secondsBeforeTimeSpanForReminder: 1,
                    timeSpans:1,
                    rRule:1

                }
            }
        );
    }

    public async clearReminders() {
        try {
            await this.mongoDB.collection(this.remindersCollection).deleteMany({});
        } catch (error) {
            this.logger.error('Mongo error in clear reminders' + error);
        }
    }
}
