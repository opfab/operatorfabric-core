/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {Db, MongoClient} from 'mongodb';

export default class RemindDatabaseService {

    mongoClient: MongoClient;
    mongoDB: Db;
    remindersCollection: string;

    public setMongoDbConfiguration(mongoConfig: any) {
        this.mongoClient = new MongoClient(mongoConfig.uri);
        this.mongoDB = this.mongoClient.db(mongoConfig.database);
        return this;
    }

    public setRemindersCollection(remindersCollection: string) {
        this.remindersCollection = remindersCollection;
        return this;
    }

    public async getItemsToRemindNow(): Promise<any[]> {
        return this.mongoDB.collection(this.remindersCollection).find({hasBeenRemind: false, timeForReminding: { $lte: new Date().valueOf() }}).toArray();
    }

    public async getAllCardsToRemind(): Promise<any[]> {       
        return this.mongoDB.collection('cards').find({$and: [{secondsBeforeTimeSpanForReminder: { $exists: true}}, {$or: [{endDate: { $exists: false}}, {endDate: { $gte: new Date() } }] }]}).toArray();
    }    

    public getReminder(id: string) {
        return this.mongoDB.collection(this.remindersCollection).findOne({cardId: id});
    }

    public persistReminder(reminder: any) {
        this.mongoDB.collection(this.remindersCollection).insertOne(reminder);

    }

    public removeReminder(id: string) {
        this.mongoDB.collection(this.remindersCollection).deleteOne({cardId: id});
    }

    public getCardByUid(uid: string) {
        return this.mongoDB.collection("cards").findOne({uid: uid});
    }

    public clearReminders() {
        this.mongoDB.collection(this.remindersCollection).deleteMany({});
    }

}