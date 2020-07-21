package org.lfenergy.operatorfabric.aop.process.mongo.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Data
@Document(collection = "user_actions")
@Builder
@AllArgsConstructor
public class UserActionTraceData {

    public UserActionTraceData(String action){
        this.action=action;
    }
    private String userName;
    private List<String> entities;
    private String cardUid;
    private String action;
    private Instant actionDate;
}
