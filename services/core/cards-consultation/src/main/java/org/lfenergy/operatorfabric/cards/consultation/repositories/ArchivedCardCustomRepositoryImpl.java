package org.lfenergy.operatorfabric.cards.consultation.repositories;

import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.cards.consultation.model.ArchivedCardConsultationData;
import org.lfenergy.operatorfabric.users.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.ReactiveMongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.util.MultiValueMap;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuple2;

import java.time.Instant;
import java.util.ArrayList;
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

    public Mono<ArchivedCardConsultationData> findByIdWithUser(String id, User user) {
        Query query = new Query();

        List<Criteria> criteria = new ArrayList<>();

        criteria.add(Criteria.where("_id").is(id));
        criteria.addAll(userCriteria(user));

        if(!criteria.isEmpty()){
            query.addCriteria(new Criteria().andOperator(criteria.toArray(new Criteria[criteria.size()])));
        }

        return template.findOne(query,ArchivedCardConsultationData.class);

    }

    public Flux<ArchivedCardConsultationData> findWithUserAndParams(Tuple2<User,MultiValueMap<String, String>> params) {
        Query query = createQueryFromUserAndParams(params);
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

        log.info("ArchivedCardRepo: query " + query);

        return template.find(query,ArchivedCardConsultationData.class);
    }

    //TODO Is there a point in returning a mono instead ? To handle null using switchifempty ?

    private Query createQueryFromUserAndParams(Tuple2<User,MultiValueMap<String, String>> params) {

        Query query = new Query();

        List<Criteria> criteria = new ArrayList<>();

        User user = params.getT1();
        MultiValueMap<String, String> queryParams = params.getT2();

        query.with(Sort.by(Sort.Order.desc(PUBLISH_DATE_FIELD)));

        //TODO Remove log
        queryParams.forEach((key, values) -> {
            log.info("ArchivedCardRepo: key " + key);
            values.forEach(value -> log.info("ArchivedCardRepo: values " + value));
        });

        //TODO Improvement Pass only items from params that are interesting to each method, not the whole map (split it)..
        /* Check that parameters that should be unique are */
        uniqueParameters.forEach(param_key -> {
            if(queryParams.containsKey(param_key)) {
                if(queryParams.get(param_key).size()>1) {
                    //TODO THROW ERROR
                }
            }
        });

        //TODO Explain in doc that not checks are made against exotic params (ex: typos), they just won't do anything

        /* Handle special parameters */

        // Publish date range
        criteria.addAll(publishDateCriteria(queryParams));

        // Active range
        criteria.addAll(activeRangeCriteria(queryParams));

        /* Handle regular parameters */
        criteria.addAll(regularParametersCriteria(queryParams));

        /* Add user criteria */
        criteria.addAll(userCriteria(user));

        if(!criteria.isEmpty()){
            query.addCriteria(new Criteria().andOperator(criteria.toArray(new Criteria[criteria.size()])));
        }

        return query;
    }

    private List<Criteria> regularParametersCriteria(MultiValueMap<String, String> params) {

        List<Criteria> criteria = new ArrayList<>();

        params.forEach((key, values) -> {

            if(!specialParameters.contains(key)) {
                criteria.add(Criteria.where(key).in(values));
            }

        });

        return criteria;
    }

    //TODO Note in doc that this assumes params to be unique, otherwise will take first occurrence
    private List<Criteria> publishDateCriteria(MultiValueMap<String, String> params) {

        List<Criteria> criteria = new ArrayList<>();

        if(params.containsKey(PUBLISH_DATE_FROM_PARAM)&&params.containsKey(PUBLISH_DATE_TO_PARAM)) {
            criteria.add(Criteria.where(PUBLISH_DATE_FIELD)
                    .gte(Instant.ofEpochMilli(Long.parseLong(params.getFirst(PUBLISH_DATE_FROM_PARAM))))
                    .lte(Instant.ofEpochMilli(Long.parseLong(params.getFirst(PUBLISH_DATE_TO_PARAM)))));
        } else if(params.containsKey(PUBLISH_DATE_FROM_PARAM)) {
            criteria.add(Criteria.where(PUBLISH_DATE_FIELD)
                    .gte(Instant.ofEpochMilli(Long.parseLong(params.getFirst(PUBLISH_DATE_FROM_PARAM)))));
        } else if(params.containsKey(PUBLISH_DATE_TO_PARAM)) {
            criteria.add(Criteria.where(PUBLISH_DATE_FIELD)
                    .lte(Instant.ofEpochMilli(Long.parseLong(params.getFirst(PUBLISH_DATE_TO_PARAM)))));
        }

        return criteria;
    }

    private List<Criteria> activeRangeCriteria(MultiValueMap<String, String> params) {

        List<Criteria> criteria = new ArrayList<>();

        if (params.containsKey(ACTIVE_FROM_PARAM) && params.containsKey(ACTIVE_TO_PARAM)) {
            Instant activeFrom = Instant.ofEpochMilli(Long.parseLong(params.getFirst(ACTIVE_FROM_PARAM)));
            Instant activeTo = Instant.ofEpochMilli(Long.parseLong(params.getFirst(ACTIVE_TO_PARAM)));
            criteria.add(new Criteria().orOperator(
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
            criteria.add(new Criteria().orOperator(
                    where(END_DATE_FIELD).is(null),
                    where(END_DATE_FIELD).gte(activeFrom)
            ));
        } else if (params.containsKey(ACTIVE_TO_PARAM)) {
            Instant activeTo = Instant.ofEpochMilli(Long.parseLong(params.getFirst(ACTIVE_TO_PARAM)));
            criteria.add(Criteria.where(START_DATE_FIELD).lte(activeTo));
        }

        return criteria;

    }

    private List<Criteria> userCriteria(User user) {

        List<Criteria> criteria = new ArrayList<>();

        String login = user.getLogin();
        List<String> groups = user.getGroups();

        if(login!=null&&!(groups==null||groups.isEmpty())) {
            criteria.add(new Criteria().orOperator(
                    where("orphanedUsers").in(user.getLogin()),
                    where("userRecipients").in(user.getLogin()),
                    where("groupRecipients").in(user.getGroups())));
        } else if (login!=null) {
            criteria.add(new Criteria().orOperator(
                    where("orphanedUsers").in(user.getLogin()),
                    where("userRecipients").in(user.getLogin())));
        } else if (!(groups==null||groups.isEmpty())) {
            criteria.add(where("groupRecipients").in(user.getGroups()));
        }

        return criteria;

    }

}
