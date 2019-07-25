package org.lfenergy.operatorfabric.cards.consultation.repositories;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.cards.consultation.model.ArchivedCardConsultationData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.ReactiveMongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.util.MultiValueMap;
import reactor.core.publisher.Flux;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Slf4j
public class ArchivedCardCustomRepositoryImpl implements ArchivedCardCustomRepository {

    public static final String PUBLISH_DATE_FIELD = "publishDate";
    public static final String PUBLISH_DATE_FROM_FIELD = "publishDateFrom";
    public static final String PUBLISH_DATE_TO_FIELD = "publishDateTo";

    public static final String START_DATE_FIELD = "startDate";
    public static final String END_DATE_FIELD = "endDate";
    public static final String ACTIVE_FROM_FIELD = "activeFrom";
    public static final String ACTIVE_TO_FIELD = "activeTo";

    public static final List<String> specialParameters =Arrays.asList(
            PUBLISH_DATE_FROM_FIELD, PUBLISH_DATE_TO_FIELD, ACTIVE_FROM_FIELD, ACTIVE_TO_FIELD);

    private final ReactiveMongoTemplate template;
    private final ObjectMapper mapper; //TODO Will we need methods returning JSON as strings instead of ArchivedCardConsultationData objects?
    //TODO Return "light" ArchivedCards (projection) ?

    @Autowired
    public ArchivedCardCustomRepositoryImpl(ReactiveMongoTemplate template, ObjectMapper mapper) {
        this.template = template;
        this.mapper = mapper;
    }

    public Flux<ArchivedCardConsultationData> findWithParams(MultiValueMap<String, String> params) {
        Query query = createQueryFromParams(params);
        //TODO Replace it with proper archivedLightCard
        query.fields()
                .include("_id")
                .include("publisher")
                .include("publisherVersion")
                .include("process")
                .include("processId")
                .include("state")
                .include("publishDate")
                .include("lttd")
                .include("startDate")
                .include("endDate")
                .include("severity")
                .include("tags");
        return template.find(query,ArchivedCardConsultationData.class);
    }

    //TODO Is there a point in returning a mono instead ? To handle null using switchifempty ?

    private Query createQueryFromParams(MultiValueMap<String, String> params) {

        Query query = new Query();

        //TODO Improvement: Pass sort order as param instead
        query.with(Sort.by(Sort.Order.desc(PUBLISH_DATE_FIELD)));

        //TODO Remove log
        params.forEach((key, values) -> {
                    log.info("ArchivedCardRepo: key " + key);
                    values.forEach(value -> log.info("ArchivedCardRepo: values " + value));
        });

        /* Handle special parameters */

        // Publish date range
        if(params.containsKey(PUBLISH_DATE_FROM_FIELD)){
            if(params.get(PUBLISH_DATE_FROM_FIELD).size()>1) {
                //TODO Throw Error
            } else {
                if(params.containsKey(PUBLISH_DATE_TO_FIELD)){
                    if(params.get(PUBLISH_DATE_TO_FIELD).size()>1) {
                        //TODO Throw Error
                    } else {
                        query.addCriteria(Criteria.where(PUBLISH_DATE_FIELD)
                                .gte(Instant.ofEpochMilli(Long.parseLong(params.getFirst(PUBLISH_DATE_FROM_FIELD))))
                                .lte(Instant.ofEpochMilli(Long.parseLong(params.getFirst(PUBLISH_DATE_TO_FIELD))))
                        );
                    }
                } else {
                    query.addCriteria(Criteria.where(PUBLISH_DATE_FIELD)
                            .gte(Instant.ofEpochMilli(Long.parseLong(params.getFirst(PUBLISH_DATE_FROM_FIELD))))
                    );
                }
            }
        } else {
            if(params.containsKey(PUBLISH_DATE_TO_FIELD)){
                if(params.get(PUBLISH_DATE_TO_FIELD).size()>1) {
                    //TODO Throw Error
                } else {
                    query.addCriteria(Criteria.where(PUBLISH_DATE_FIELD)
                            .lte(Instant.ofEpochMilli(Long.parseLong(params.getFirst(PUBLISH_DATE_TO_FIELD))))
                    );
                }
            }
        }

        // Active range
        //TODO

        /* Handle regular parameters */
        params.forEach((key, values) -> {

            if(!specialParameters.contains(key)) {
                query.addCriteria(Criteria.where(key).in(values));
            }

            //TODO Check whether the provided query param key does exist in the card data model (or in a pre-defined list)
            // to be able to throw error if it's not the case


        });

        log.info("ArchivedCardRepo: "+query.toString());

        return query;
    }

}
