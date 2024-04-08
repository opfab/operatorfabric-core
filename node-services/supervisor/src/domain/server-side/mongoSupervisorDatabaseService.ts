/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Db, MongoClient} from 'mongodb';
import {Logger} from 'winston';
import {MongoConfig} from './mongoConfig';
import {EntityToSupervise} from '../application/entityToSupervise';
import SupervisorDatabaseService from './supervisorDatabaseService';

export default class MongoSupervisorDatabaseService implements SupervisorDatabaseService {
    logger: Logger;
    mongoClient: MongoClient;
    mongoDB: Db;
    mongoConfig: MongoConfig;
    retryInterval = 5000; // Retry every 5 seconds

    public setMongoDbConfiguration(mongoConfig: MongoConfig): this {
        this.mongoConfig = mongoConfig;
        this.mongoClient = new MongoClient(mongoConfig.uri);
        return this;
    }

    public setLogger(logger: any): this {
        this.logger = logger;
        return this;
    }

    public async openConnection(): Promise<void> {
        await this.connectWithRetry();
    }

    private async connectWithRetry(): Promise<void> {
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
                        this.connectWithRetry().catch((error) => {
                            this.logger.error('Failed to reconnect to MongoDB' + error);
                        });
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

    public async getSupervisedEntities(): Promise<EntityToSupervise[]> {
        return (await this.mongoDB.collection('supervisedEntities').find().toArray()) as any as EntityToSupervise[];
    }

    public async saveSupervisedEntity(supervisedEntity: EntityToSupervise): Promise<void> {
        try {
            const query = {entityId: supervisedEntity.entityId};
            const update = {
                $set: {supervisors: supervisedEntity.supervisors},
                $setOnInsert: {entityId: supervisedEntity.entityId}
            };
            const options = {upsert: true};
            await this.mongoDB.collection('supervisedEntities').updateOne(query, update, options);
        } catch (error) {
            this.logger.error('Mongo error in insert supervised Entity' + JSON.stringify(error));
        }
    }

    public async getSupervisedEntity(id: string): Promise<EntityToSupervise | undefined> {
        try {
            return (await this.mongoDB
                .collection('supervisedEntities')
                .findOne({entityId: id})) as any as EntityToSupervise;
        } catch (error) {
            this.logger.error('Mongo error in find supervised Entity' + JSON.stringify(error));
        }
    }

    public async deleteSupervisedEntity(id: string): Promise<void> {
        try {
            await this.mongoDB.collection('supervisedEntities').deleteOne({entityId: id});
        } catch (error) {
            this.logger.error('Mongo error in delete supervised Entity' + JSON.stringify(error));
        }
    }
}
