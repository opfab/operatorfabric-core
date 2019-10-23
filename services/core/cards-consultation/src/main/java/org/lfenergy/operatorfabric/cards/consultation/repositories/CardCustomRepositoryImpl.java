package org.lfenergy.operatorfabric.cards.consultation.repositories;

import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.cards.consultation.model.CardConsultationData;
import org.lfenergy.operatorfabric.users.model.User;
import org.springframework.beans.factory.annotation.Autowired;
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

    public  Mono<CardConsultationData> trucTestMachin(Instant pivotalInstant, User user){
        Query query = new Query();
        List<Criteria> withUser = this.computeCriteriaList4User(user);
        query.addCriteria(withUser.get(0));
        return template.findOne(query,CardConsultationData.class);
    }

}
