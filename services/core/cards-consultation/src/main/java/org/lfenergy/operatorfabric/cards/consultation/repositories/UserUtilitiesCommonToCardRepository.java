package org.lfenergy.operatorfabric.cards.consultation.repositories;

import org.lfenergy.operatorfabric.cards.consultation.model.Card;
import org.lfenergy.operatorfabric.users.model.User;
import org.springframework.data.mongodb.core.ReactiveMongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.List;

import static org.springframework.data.mongodb.core.query.Criteria.where;

public interface UserUtilitiesCommonToCardRepository<T extends Card> {

    default Mono<T> findByIdWithUser(ReactiveMongoTemplate template, String id, User user, Class<T> clazz) {
        Query query = new Query();
        List<Criteria> criteria = computeCriteriaToFindCardByProcessIdWithUser(id, user);
        if (!criteria.isEmpty())
            query.addCriteria(new Criteria().andOperator(criteria.toArray(new Criteria[criteria.size()])));

        return template.findOne(query, clazz);
    }

    default List<Criteria> computeCriteriaToFindCardByProcessIdWithUser(String processId, User user) {
        List<Criteria> criteria = new ArrayList<>();
        criteria.add(Criteria.where("_id").is(processId));
        criteria.addAll(computeCriteriaList4User(user));
        return criteria;
    }

    default List<Criteria> computeCriteriaList4User(User user) {
        List<Criteria> criteria = new ArrayList<>();
        String login = user.getLogin();
        List<String> groups = user.getGroups();

        if (login != null && !(groups == null || groups.isEmpty())) {
            criteria.add(new Criteria().orOperator(
                    where("userRecipients").in(login),
                    where("groupRecipients").in(groups)));
        } else if (login != null) {
            criteria.add(new Criteria().orOperator(
                    where("userRecipients").in(login)));
        } else if (!(groups == null || groups.isEmpty())) {
            criteria.add(where("groupRecipients").in(groups));
        }

        return criteria;
    }

    default Criteria computeUserCriteria(User user) {
        Criteria criteria = new Criteria();
        String login = user.getLogin();
        List<String> groups = user.getGroups();
        boolean isGroupNonEmpty = !(null == groups || groups.isEmpty());
        if (isGroupNonEmpty)  criteria = where("groupRecipients").in(groups);
        if (null != login) {
            Criteria userRec = where("userRecipients").in(login);
            boolean isGroupEmpty = !isGroupNonEmpty;
            Criteria[] crits=(isGroupEmpty)?new Criteria[]{userRec}:new Criteria[]{userRec,criteria};
            criteria = new Criteria().orOperator(crits);
        }
        return criteria;
    }

    Mono<T> findByIdWithUser(String id, User user);
}
