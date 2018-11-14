package org.lfenergy.operatorfabric.cards.consultation.repositories;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.cards.consultation.model.CardConsultationData;
import org.lfenergy.operatorfabric.cards.consultation.model.CardOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.ReactiveMongoTemplate;
import org.springframework.data.mongodb.core.aggregation.*;
import org.springframework.data.mongodb.core.query.Criteria;
import reactor.core.publisher.Flux;

import javax.annotation.PostConstruct;

import static org.springframework.data.mongodb.core.query.Criteria.where;

@Slf4j
public class CardOperationRepositoryImpl implements CardOperationRepository {

    public static final String PUBLISH_DATE_FIELD = "publishDate";
    public static final String START_DATE_FIELD = "startDate";
    public static final String END_DATE_FIELD = "endDate";
    public static final String CARDS_FIELD = "cards";
    public static final String TYPE_FIELD = "type";
    private final ReactiveMongoTemplate template;
    private final ObjectMapper mapper;
    private ProjectionOperation projectStage;
    private GroupOperation groupStage;
    private SortOperation sortStage1;
    private SortOperation sortStage2;


    @Autowired
    public CardOperationRepositoryImpl(ReactiveMongoTemplate template, ObjectMapper mapper) {
        this.template = template;
        this.mapper = mapper;
    }

    @PostConstruct
    public void initCommonStages(){
        projectStage = projectToLightCard();
        groupStage = groupByPublishDate();
        sortStage1 = Aggregation.sort(Sort.by(START_DATE_FIELD));
        sortStage2 = Aggregation.sort(Sort.by(PUBLISH_DATE_FIELD));
    }

    @Override
    public Flux<String> findUrgentJSON(long latestPublication, long rangeStart, long rangeEnd) {
        return findUrgent( latestPublication, rangeStart, rangeEnd).map(this::writeValueAsString);
    }

    private String writeValueAsString(CardOperation cardOperation) {
        try {
            return mapper.writeValueAsString(cardOperation);
        } catch (JsonProcessingException e) {
            log.error(String.format("Unnable to linearize %s to Json",cardOperation.getClass().getSimpleName()),e);
            return null;
        }
    }

    @Override
    public Flux<String> findFutureOnlyJSON(long latestPublication, long rangeStart) {
        return findFutureOnly(latestPublication, rangeStart)
                .map(this::writeValueAsString);
    }

    @Override
    public Flux<String> findPastOnlyJSON(long latestPublication, long rangeEnd) {
        return findPastOnly(latestPublication, rangeEnd)
                .map(this::writeValueAsString);
    }

    @Override
    public Flux<CardOperation> findUrgent(long latestPublication, long rangeStart, long rangeEnd) {
        return findUrgent0(CardOperation.class, latestPublication, rangeStart, rangeEnd);
    }

    @Override
    public Flux<CardOperation> findFutureOnly(long latestPublication, long rangeStart) {
        return findFutureOnly0(CardOperation.class, latestPublication, rangeStart);
    }

    @Override
    public Flux<CardOperation> findPastOnly(long latestPublication, long rangeEnd) {
        return findPastOnly0(CardOperation.class, latestPublication, rangeEnd);
    }

    public <T> Flux<T> findUrgent0(Class<T> clazz, long latestPublication, long rangeStart, long rangeEnd) {
        MatchOperation queryStage = Aggregation.match(new Criteria().andOperator(
                where(PUBLISH_DATE_FIELD).lte(latestPublication),
                new Criteria().orOperator(
                        where(START_DATE_FIELD).gte(rangeStart).lte(rangeEnd),
                        where(END_DATE_FIELD).gte(rangeStart).lte(rangeEnd),
                        new Criteria().andOperator(
                                where(START_DATE_FIELD).lt(rangeStart),
                                new Criteria().orOperator(
                                        where(END_DATE_FIELD).is(null),
                                        where(END_DATE_FIELD).gt(rangeEnd)
                                )
                        )
                )
        ));
        TypedAggregation<CardConsultationData> aggregation = Aggregation.newAggregation(CardConsultationData.class, queryStage, sortStage1, groupStage, projectStage, sortStage2);

        return template.aggregate(aggregation, clazz);
    }

    public <T> Flux<T> findFutureOnly0(Class<T> clazz, long latestPublication, long rangeStart) {
        MatchOperation queryStage = Aggregation.match(new Criteria().andOperator(
                where(PUBLISH_DATE_FIELD).lte(latestPublication),
                where(START_DATE_FIELD).gt(rangeStart)));

        TypedAggregation<CardConsultationData> aggregation = Aggregation.newAggregation(CardConsultationData.class, queryStage, sortStage1,groupStage, projectStage, sortStage2);

        return template.aggregate(aggregation, clazz);
    }

    public <T> Flux<T> findPastOnly0(Class<T> clazz, long latestPublication, long rangeEnd) {
        MatchOperation queryStage = Aggregation.match(new Criteria().andOperator(
                where(PUBLISH_DATE_FIELD).lte(latestPublication),
                where(END_DATE_FIELD).lt(rangeEnd)));

        TypedAggregation<CardConsultationData> aggregation = Aggregation.newAggregation(CardConsultationData.class, queryStage, sortStage1, groupStage, projectStage, sortStage2);
        return template.aggregate(aggregation, clazz);
    }

    private ProjectionOperation projectToLightCard() {
        return Aggregation.project(CARDS_FIELD)
                .andExpression("_id").as(PUBLISH_DATE_FIELD)
                .andExpression("[0]", "ADD").as(TYPE_FIELD);
    }

    private GroupOperation groupByPublishDate() {
        return Aggregation.group(PUBLISH_DATE_FIELD)
                .push(Aggregation.ROOT).as(CARDS_FIELD);
    }
}
