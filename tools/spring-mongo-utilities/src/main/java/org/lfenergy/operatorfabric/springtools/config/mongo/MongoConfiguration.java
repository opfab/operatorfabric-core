/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.springtools.config.mongo;

import com.mongodb.*;
import com.mongodb.connection.*;
import com.mongodb.reactivestreams.client.MongoClient;
import com.mongodb.reactivestreams.client.MongoClients;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.convert.CustomConversions;
import org.springframework.data.mongodb.core.ReactiveMongoTemplate;
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

//import com.mongodb.async.client.MongoClientSettings;

/**
 * <p></p>
 * Created on 24/07/18
 *
 * @author davibind
 */
@Slf4j
@Configuration
public class MongoConfiguration /*extends AbstractReactiveMongoConfiguration*/{

    @Autowired
    private OperatorFabricMongoProperties properties;
    @Autowired
    private AbstractLocalMongoConfiguration localConfiguration;
    private MongoClient client;

    @Bean
    public synchronized MongoClient reactiveMongoClient() {
        if(client == null)
            this.client = MongoClients.create(mongoSettings());
        return client;
    }

    @Bean
    public com.mongodb.MongoClient mongoClient() {
        MongoClientOptions.Builder optionsBuilder = new MongoClientOptions.Builder();
        optionsBuilder.maxConnectionIdleTime(60000);
        List<ServerAddress> addrs = new ArrayList<>();
        List<MongoCredential> credentials = new ArrayList<>();
        for(String uriString:properties.getUris()) {
            URI uri = URI.create(uriString);
            addrs.add(new ServerAddress(uri.getHost(), uri.getPort()));
            String[] userInfo = uri.getUserInfo().split(":");
            credentials.add(MongoCredential.createCredential(userInfo[0],"admin",userInfo[1].toCharArray()));
        }
        com.mongodb.MongoClient client = new com.mongodb.MongoClient(addrs,credentials,optionsBuilder.build());
        return client;
    }

    @Bean
//    @Override
    public MappingMongoConverter mappingMongoConverter() throws Exception {

        MappingMongoConverter converter = new MappingMongoConverter(ReactiveMongoTemplate.NO_OP_REF_RESOLVER,
           mongoMappingContext());
        converter.setCustomConversions(customConversions());
        DefaultMongoTypeMapper typeMapper = new DefaultMongoTypeMapper(null);
        converter.setTypeMapper(typeMapper);
        return converter;
    }

//    @Override
    protected String getDatabaseName() {
        return properties.getDatabase();
    }

    @Bean
    public MongoMappingContext mongoMappingContext() {

        MongoMappingContext mappingContext = new MongoMappingContext();
//        mappingContext.setInitialEntitySet(getInitialEntitySet());
//        mappingContext.setSimpleTypeHolder(customConversions().getSimpleTypeHolder());
//        mappingContext.setFieldNamingStrategy(fieldNamingStrategy());

        return mappingContext;
    }

    @Bean
    public ValidatingMongoEventListener validatingMongoEventListener(@Autowired LocalValidatorFactoryBean
                                                                        localValidatorFactoryBean) {
        return new ValidatingMongoEventListener(localValidatorFactoryBean);
    }


    private MongoClientSettings mongoSettings() {
        List<String> dbUris = properties.getUris();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < dbUris.size(); i++) {
            sb.append(dbUris.get(i));
            if (i < dbUris.size()-1)
                sb.append(",");
        }
        ConnectionString connectionString = new ConnectionString(sb.toString());
        MongoClientSettings.Builder builder = MongoClientSettings.builder()
           .applyToConnectionPoolSettings(b->
                   b.applySettings(ConnectionPoolSettings.builder()
              .applyConnectionString(connectionString)
              .maxConnectionIdleTime(60, TimeUnit.SECONDS)
              .build()))
           .applyToServerSettings(b->
              b.applySettings(
                 ServerSettings.builder()
                    .applyConnectionString(connectionString)
                    .build()
              )
           )
           .applyToSslSettings(b->
              b.applySettings(SslSettings.builder()
                 .applyConnectionString(connectionString)
                 .build())
           )
           .applyToSocketSettings(b->
           b.applySettings(SocketSettings.builder()
              .applyConnectionString(connectionString)
              .build()))
           ;

//        if(dbUris.size()>1)
        builder.applyToClusterSettings(b->
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
    public CustomConversions customConversions() {
        return new MongoCustomConversions(localConfiguration.converterList());
    }

}
