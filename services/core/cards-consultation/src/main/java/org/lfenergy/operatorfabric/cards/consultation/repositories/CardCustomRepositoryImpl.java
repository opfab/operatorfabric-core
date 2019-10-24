package org.lfenergy.operatorfabric.cards.consultation.repositories;

import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.cards.consultation.model.CardConsultationData;
import org.lfenergy.operatorfabric.users.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.ReactiveMongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.List;

@Slf4j
public class CardCustomRepositoryImpl implements  CardCustomRepository {

    private final ReactiveMongoTemplate template;

    @Autowired
    public CardCustomRepositoryImpl(ReactiveMongoTemplate template) {
        this.template = template;
    }

    public Mono<CardConsultationData> findByIdWithUser(String processId, User user) {
        return findByIdWithUser(template,processId,user,CardConsultationData.class);
    }

    public  Mono<CardConsultationData> trucTestMachinNext(Instant pivotalInstant
            , User user
    ){
        Query query = new Query();
        Criteria criteria = new Criteria().where("startDate").gte(pivotalInstant);
        query.addCriteria(criteria
                .andOperator(this.computeUserCriteria(user))
        );
        query.with(new Sort(new Sort.Order(Sort.Direction.ASC,"startDate")));
        query.with(new Sort(new Sort.Order(Sort.Direction.ASC,"_id")));
        return template.findOne(query,CardConsultationData.class);
    }
    public  Mono<CardConsultationData> trucTestMachinPrevious(Instant pivotalInstant
            , User user
    ){
        Query query = new Query();
        Criteria criteria = new Criteria().where("startDate").lte(pivotalInstant);
        query.addCriteria(criteria
                .andOperator(this.computeUserCriteria(user))
        );
        query.with(new Sort(new Sort.Order(Sort.Direction.DESC,"startDate")));
        query.with(new Sort(new Sort.Order(Sort.Direction.ASC,"_id")));
        return template.findOne(query,CardConsultationData.class);
    }}
