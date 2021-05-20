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
import com.mongodb.MongoCredential;
import com.mongodb.ServerAddress;
import com.mongodb.connection.*;
import com.mongodb.reactivestreams.client.MongoClient;
import com.mongodb.reactivestreams.client.MongoClients;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
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

import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;


/**
 * Mongo configuration.
 *  extends AbstractReactiveMongoConfiguration and overrides for custums
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

    @Autowired
    private OperatorFabricMongoProperties properties;
    @Autowired
    private AbstractLocalMongoConfiguration localConfiguration;


    /**
     * @return reactive client
     */
    @Bean
    public  MongoClient reactiveMongoClient() {
            return MongoClients.create(mongoSettings());
    }


    /**
     * @return standard client
     */
    @Bean
    public com.mongodb.client.MongoClient mongoClientx() {

        List<ServerAddress> addrs = new ArrayList<>();
        MongoCredential credential = null;

        for (String uriString : properties.getUris()) {
            URI uri = URI.create(uriString);
            addrs.add(new ServerAddress(uri.getHost(), uri.getPort()));
            String[] userInfo = uri.getUserInfo().split(":");

            if (credential == null) {
                credential = MongoCredential.createCredential(userInfo[0], "admin", userInfo[1].toCharArray());
            }
        }


        return com.mongodb.client.MongoClients.create(
                MongoClientSettings.builder().credential(credential).
                        applyToConnectionPoolSettings(builder -> builder.maxConnectionIdleTime(60000,TimeUnit.SECONDS))
                        .applyToClusterSettings(builder -> builder.hosts(addrs))
                        .build());

    }



    /**
     * @return database name from configuration
     */
    protected String getDatabaseName() {
        return properties.getDatabase();
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


    /**
     * client cluster configuration for reactive client
     *
     * @return reactive client configuration
     */
    private MongoClientSettings mongoSettings() {
        List<String> dbUris = properties.getUris();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < dbUris.size(); i++) {
            sb.append(dbUris.get(i));
            if (i < dbUris.size() - 1)
                sb.append(",");
        }
        ConnectionString connectionString = new ConnectionString(sb.toString());
        MongoClientSettings.Builder builder = MongoClientSettings.builder()
           .applyToConnectionPoolSettings(b ->
              b.applySettings(ConnectionPoolSettings.builder()
                 .applyConnectionString(connectionString)
                 .maxConnectionIdleTime(60, TimeUnit.SECONDS)
                 .build()))
           .applyToServerSettings(b ->
              b.applySettings(
                 ServerSettings.builder()
                    .applyConnectionString(connectionString)
                    .build()
              )
           )
           .applyToSslSettings(b ->
              b.applySettings(SslSettings.builder()
                 .applyConnectionString(connectionString)
                 .build())
           )
           .applyToSocketSettings(b ->
              b.applySettings(SocketSettings.builder()
                 .applyConnectionString(connectionString)
                 .build()));

//        if(dbUris.size()>1)
        builder.applyToClusterSettings(b ->
           b.applySettings(
              ClusterSettings.builder()
                 .applyConnectionString(connectionString)
                 .mode(ClusterConnectionMode.MULTIPLE)
                 .build()));

        if (connectionString.getCredential() != null) {
            builder.credential(connectionString.getCredential());
        }

        if (connectionString.getReadPreference() != null) {
            builder.readPreference(connectionString.getReadPreference());
        }
        if (connectionString.getReadConcern() != null) {
            builder.readConcern(connectionString.getReadConcern());
        }
        if (connectionString.getWriteConcern() != null) {
            builder.writeConcern(connectionString.getWriteConcern());
        }
        if (connectionString.getApplicationName() != null) {
            builder.applicationName(connectionString.getApplicationName());
        }
        builder.compressorList(connectionString.getCompressorList());
        return builder.build();
    }

    @Bean
    public MongoCustomConversions customConversions() {
        return new MongoCustomConversions(localConfiguration.converterList());
    }


    @Bean
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
