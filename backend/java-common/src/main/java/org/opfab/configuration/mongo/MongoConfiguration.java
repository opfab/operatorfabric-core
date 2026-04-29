/* Copyright (c) 2018-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.configuration.mongo;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;

import org.springframework.boot.mongodb.autoconfigure.MongoProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.ReactiveMongoDatabaseFactory;
import org.springframework.data.mongodb.config.AbstractReactiveMongoConfiguration;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.SimpleMongoClientDatabaseFactory;
import org.springframework.data.mongodb.core.convert.DefaultMongoTypeMapper;
import org.springframework.data.mongodb.core.convert.MappingMongoConverter;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;
import org.springframework.data.mongodb.core.mapping.MongoMappingContext;

@Configuration
public class MongoConfiguration extends AbstractReactiveMongoConfiguration {

    private MongoProperties mongoProperties;

    /**
     * The mongo properties are injected by the Spring Boot auto-configuration.
     * it is taken from the application.yml file with the prefix
     * "spring.data.mongodb".
     */
    public MongoConfiguration(MongoProperties mongoProperties) {
        this.mongoProperties = mongoProperties;
    }

    @Override
    protected void configureClientSettings(MongoClientSettings.Builder builder) {
        if (mongoProperties.getUri() == null) {
            throw new IllegalArgumentException("MongoDB URI must be provided");
        }
        builder.applyConnectionString(new ConnectionString(mongoProperties.getUri()))
                .build();
    }

    @Override
    protected String getDatabaseName() {
        return mongoProperties.getDatabase();
    }

    /**
     * Provides an imperative MongoTemplate bean required
     * by @EnableMongoRepositories.
     * This is necessary because MongoConfiguration extends
     * AbstractReactiveMongoConfiguration
     * which only provides reactive beans; imperative MongoRepository interfaces
     * need a MongoTemplate backed by an imperative MongoClient.
     * The MappingMongoConverter is injected so that any customization applied to it
     * (e.g. preserveMapKeys in MappingConfiguration) is shared with this template.
     */
    @Bean
    public MongoTemplate mongoTemplate(MongoClient client, MappingMongoConverter converter) {
        if (client == null) {
            throw new IllegalArgumentException("MongoClient must not be null");
        }
        String databaseName = mongoProperties.getDatabase();
        if (databaseName == null || databaseName.isEmpty()) {
            throw new IllegalArgumentException("MongoDB database name must be provided");
        }
        MongoDatabaseFactory factory = new SimpleMongoClientDatabaseFactory(client, databaseName);
        return new MongoTemplate(factory, converter);
    }

    @Bean(destroyMethod = "close")
    public MongoClient mongoClient() {
        String uri = mongoProperties.getUri();
        if (uri == null || uri.isEmpty()) {
            throw new IllegalArgumentException("MongoDB URI must be provided");
        }
        return MongoClients.create(uri);
    }

    /**
     * This method is necessary to avoid having field _class for each object in
     * collections.
     **/
    @Override
    public MappingMongoConverter mappingMongoConverter(ReactiveMongoDatabaseFactory databaseFactory,
            MongoCustomConversions customConversions, MongoMappingContext mappingContext) {
        MappingMongoConverter converter = super.mappingMongoConverter(databaseFactory, customConversions,
                mappingContext);
        DefaultMongoTypeMapper typeMapper = new DefaultMongoTypeMapper(null);
        converter.setTypeMapper(typeMapper);
        return converter;
    }

    /**
     * This method is used to automatically create indexes on the collections when
     * the application starts.
     * for parameters with the @Indexed annotation.
     */
    @Override
    protected boolean autoIndexCreation() {
        return true;
    }
}
