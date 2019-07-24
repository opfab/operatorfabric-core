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

@Slf4j
public class ArchivedCardCustomRepositoryImpl implements ArchivedCardCustomRepository {

    public static final String PUBLISH_DATE_FIELD = "publishDate";
    public static final String PUBLISH_DATE_FROM_FIELD = "publishDateFrom";
    public static final String PUBLISH_DATE_TO_FIELD = "publishDateTo";

    public static final String START_DATE_FIELD = "startDate";
    public static final String END_DATE_FIELD = "endDate";
    public static final String ACTIVE_FROM_FIELD = "activeFrom";
    public static final String ACTIVE_TO_FIELD = "activeTo";


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

        params.forEach((key, values) -> {
            //TODO Remove log
            log.info("ArchivedCardRepo: key "+key);
            values.forEach(value -> log.info("ArchivedCardRepo: values "+value));

            switch(key) {
                case PUBLISH_DATE_FROM_FIELD:
                    //TODO Throw error if more than 1 value
                    //TODO Throw error if value can't be parsed to long (catch NumberFormatException)
                    log.info("ArchivedCardRepo: instant "+Instant.ofEpochMilli(Long.parseLong(values.get(0))));
                    query.addCriteria(Criteria.where(PUBLISH_DATE_FIELD).gte(Instant.ofEpochMilli(Long.parseLong(values.get(0))))); //TODO Should it be gt or gte?
                    break;
                case PUBLISH_DATE_TO_FIELD:
                    //TODO Throw error if more than 1 value
                    //TODO Throw error if value can't be parsed to long
                    log.info("ArchivedCardRepo: instant "+Instant.ofEpochMilli(Long.parseLong(values.get(0))));
                    query.addCriteria(Criteria.where(PUBLISH_DATE_FIELD).lte(Instant.ofEpochMilli(Long.parseLong(values.get(0)))));
                    break;
                default:
                    //TODO Check whether the provided query param key does exist in the card data model (or in a pre-defined list)
                    // to be able to throw error if it's not the case
                    query.addCriteria(Criteria.where(key).in(values));
            }


        });

        return query;
    }

}
