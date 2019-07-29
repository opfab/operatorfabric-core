package org.lfenergy.operatorfabric.cards.consultation.repositories;

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
import java.util.Arrays;
import java.util.List;

import static org.springframework.data.mongodb.core.query.Criteria.where;

@Slf4j
public class ArchivedCardCustomRepositoryImpl implements ArchivedCardCustomRepository {

    public static final String PUBLISH_DATE_FIELD = "publishDate";
    public static final String PUBLISH_DATE_FROM_PARAM = "publishDateFrom";
    public static final String PUBLISH_DATE_TO_PARAM = "publishDateTo";

    public static final String START_DATE_FIELD = "startDate";
    public static final String END_DATE_FIELD = "endDate";
    public static final String ACTIVE_FROM_PARAM = "activeFrom";
    public static final String ACTIVE_TO_PARAM = "activeTo";

    private static final List<String> specialParameters =Arrays.asList(
            PUBLISH_DATE_FROM_PARAM, PUBLISH_DATE_TO_PARAM, ACTIVE_FROM_PARAM, ACTIVE_TO_PARAM);

    private static final List<String> uniqueParameters = Arrays.asList(
            PUBLISH_DATE_FROM_PARAM, PUBLISH_DATE_TO_PARAM, ACTIVE_FROM_PARAM, ACTIVE_TO_PARAM);

    private final ReactiveMongoTemplate template;
    //TODO Will we need methods returning JSON as strings instead of ArchivedCardConsultationData objects?
    //TODO Return "light" ArchivedCards (projection) ?

    @Autowired
    public ArchivedCardCustomRepositoryImpl(ReactiveMongoTemplate template) {
        this.template = template;
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
                .include(PUBLISH_DATE_FIELD)
                .include("lttd")
                .include(START_DATE_FIELD)
                .include(END_DATE_FIELD)
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

        //TODO Improvement Pass only items from params that are interesting to each method, not the whole map (split it)..

        /* Check that parameters that should be unique are */
        uniqueParameters.forEach(param_key -> {
            if(params.containsKey(param_key)) {
                if(params.get(param_key).size()>1) {
                    //TODO THROW ERROR
                }
            }
        });

        //TODO Check whether the provided query param key does exist in the card data model (or in a pre-defined list)
        // to be able to throw error if it's not the case

        /* Handle special parameters */

        // Publish date range
        query = addPublishDateCriteria(query, params);

        // Active range
        query = addActiveRangeCriteria(query, params);

        /* Handle regular parameters */
        query = addRegularParameters(query, params);

        log.info("ArchivedCardRepo: "+query.toString());

        return query;
    }

    private Query addRegularParameters(Query query, MultiValueMap<String, String> params) {

        params.forEach((key, values) -> {

            if(!specialParameters.contains(key)) {
                query.addCriteria(Criteria.where(key).in(values));
            }

        });

        return query;
    }

    //TODO Note in doc that this assumes params to be unique, otherwise will take first occurrence
    private Query addPublishDateCriteria(Query query, MultiValueMap<String, String> params) {

        if(params.containsKey(PUBLISH_DATE_FROM_PARAM)&&params.containsKey(PUBLISH_DATE_TO_PARAM)) {
            query.addCriteria(Criteria.where(PUBLISH_DATE_FIELD)
                    .gte(Instant.ofEpochMilli(Long.parseLong(params.getFirst(PUBLISH_DATE_FROM_PARAM))))
                    .lte(Instant.ofEpochMilli(Long.parseLong(params.getFirst(PUBLISH_DATE_TO_PARAM)))));
        } else if(params.containsKey(PUBLISH_DATE_FROM_PARAM)) {
            query.addCriteria(Criteria.where(PUBLISH_DATE_FIELD)
                    .gte(Instant.ofEpochMilli(Long.parseLong(params.getFirst(PUBLISH_DATE_FROM_PARAM)))));
        } else if(params.containsKey(PUBLISH_DATE_TO_PARAM)) {
            query.addCriteria(Criteria.where(PUBLISH_DATE_FIELD)
                    .lte(Instant.ofEpochMilli(Long.parseLong(params.getFirst(PUBLISH_DATE_TO_PARAM)))));
        }

        return query;
    }

    private Query addActiveRangeCriteria(Query query, MultiValueMap<String, String> params) {

        if (params.containsKey(ACTIVE_FROM_PARAM) && params.containsKey(ACTIVE_TO_PARAM)) {
            Instant activeFrom = Instant.ofEpochMilli(Long.parseLong(params.getFirst(ACTIVE_FROM_PARAM)));
            Instant activeTo = Instant.ofEpochMilli(Long.parseLong(params.getFirst(ACTIVE_TO_PARAM)));
            query.addCriteria(new Criteria().orOperator(
                    //Case 1: Card start date is included in query filter range
                    where(START_DATE_FIELD).gte(activeFrom).lte(activeTo),
                    //Case 2: Card start date is before start of query filter range
                    new Criteria().andOperator(
                            where(START_DATE_FIELD).lte(activeFrom),
                            new Criteria().orOperator(
                                    where(END_DATE_FIELD).is(null),
                                    where(END_DATE_FIELD).gte(activeFrom)
                            )
                    )
            ));
        } else if (params.containsKey(ACTIVE_FROM_PARAM)) {
            Instant activeFrom = Instant.ofEpochMilli(Long.parseLong(params.getFirst(ACTIVE_FROM_PARAM)));
            query.addCriteria(new Criteria().orOperator(
                    where(END_DATE_FIELD).is(null),
                    where(END_DATE_FIELD).gte(activeFrom)
            ));
        } else if (params.containsKey(ACTIVE_TO_PARAM)) {
            Instant activeTo = Instant.ofEpochMilli(Long.parseLong(params.getFirst(ACTIVE_TO_PARAM)));
            query.addCriteria(Criteria.where(START_DATE_FIELD).lte(activeTo));
        }

        return query;

    }
}
