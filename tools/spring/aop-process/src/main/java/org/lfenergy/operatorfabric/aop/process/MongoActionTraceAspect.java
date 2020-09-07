package org.lfenergy.operatorfabric.aop.process;

import org.lfenergy.operatorfabric.aop.process.mongo.models.UserActionTraceData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;

public class MongoActionTraceAspect extends AbstractActionAspect<UserActionTraceData> {

    @Autowired
    protected MongoTemplate template;

    @Override
    void trace(UserActionTraceData trace) {
        template.save(trace);
    }


}
