/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.springtools.configuration.mongo;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.mongo.MongoProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.ReactiveMongoDatabaseFactory;
import org.springframework.data.mongodb.config.AbstractReactiveMongoConfiguration;
import org.springframework.data.mongodb.core.convert.DefaultMongoTypeMapper;
import org.springframework.data.mongodb.core.convert.MappingMongoConverter;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;
import org.springframework.data.mongodb.core.mapping.MongoMappingContext;
import org.springframework.data.mongodb.core.mapping.event.ValidatingMongoEventListener;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;


/**
 * Mongo configuration.
 *  extends AbstractReactiveMongoConfiguration and overrides for customization
 * <ul>
 * <li>Standard cluster client configuration</li>
 * <li>Reactive cluster client configuration</li>
 * <li>Builds converter form {@link AbstractLocalMongoConfiguration#converterList()}</li>
 * <li>Mongo bean validation</li>
 * </ul>
 *
 *
 */
@Slf4j
@Configuration
public class MongoConfiguration extends AbstractReactiveMongoConfiguration {

    private MongoProperties mongoProperties;

    @Autowired
    public MongoConfiguration(MongoProperties mongoProperties) {
        this.mongoProperties = mongoProperties;
    }

    @Override
    protected void configureClientSettings(MongoClientSettings.Builder builder) {
        builder.applyConnectionString(new ConnectionString(mongoProperties.getUri()))
                .build();
    }

    /**
     * @return database name from configuration
     */
    protected String getDatabaseName() {
        return mongoProperties.getDatabase();
    }

    /**
     * Called before entities are persisted to mongo, triggers bean validation
     *
     * @param localValidatorFactoryBean
     *    spring bean validation main component
     * @return Mongo lifecycle listener that triggers validation
     */
    @Bean
    public ValidatingMongoEventListener validatingMongoEventListener(@Autowired LocalValidatorFactoryBean
                                                                        localValidatorFactoryBean) {
        return new ValidatingMongoEventListener(localValidatorFactoryBean);
    }

    @Bean
    public MongoCustomConversions customConversions(@Autowired AbstractLocalMongoConfiguration localConfiguration) {
        return new MongoCustomConversions(localConfiguration.converterList());
    }

    @Override
    public MappingMongoConverter mappingMongoConverter(ReactiveMongoDatabaseFactory databaseFactory,
                                                       MongoCustomConversions customConversions, MongoMappingContext mappingContext) {

        MappingMongoConverter converter=super.mappingMongoConverter(databaseFactory,customConversions,mappingContext);
        DefaultMongoTypeMapper typeMapper = new DefaultMongoTypeMapper(null);
        converter.setTypeMapper(typeMapper);

        return converter;
    }

    @Override
    protected boolean autoIndexCreation() {
        return true;
    }
}
