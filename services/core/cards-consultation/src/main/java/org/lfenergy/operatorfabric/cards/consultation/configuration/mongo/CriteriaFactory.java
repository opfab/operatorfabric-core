package org.lfenergy.operatorfabric.cards.consultation.configuration.mongo;

import org.lfenergy.operatorfabric.users.model.User;
import org.springframework.data.mongodb.core.query.Criteria;

import java.util.ArrayList;
import java.util.List;

import static org.springframework.data.mongodb.core.query.Criteria.where;

public class CriteriaFactory {

    public static List<Criteria> computeCriteria(User user){
        List<Criteria> criteria = new ArrayList<>();

        String login = user.getLogin();
        List<String> groups = user.getGroups();

        if(login!=null&&!(groups==null||groups.isEmpty())) {
            criteria.add(new Criteria().orOperator(
                    where("userRecipients").in(user.getLogin()),
                    where("groupRecipients").in(user.getGroups())));
        } else if (login!=null) {
            criteria.add(new Criteria().orOperator(
                    where("userRecipients").in(user.getLogin())));
        } else if (!(groups==null||groups.isEmpty())) {
            criteria.add(where("groupRecipients").in(user.getGroups()));
        }

        return criteria;
    }
}
