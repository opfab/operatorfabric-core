/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.useractiontracing.repositories;

import lombok.extern.slf4j.Slf4j;
import org.opfab.useractiontracing.model.UserActionLog;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationOperation;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.util.MultiValueMap;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import net.minidev.json.JSONObject;
import net.minidev.json.parser.JSONParser;
import net.minidev.json.parser.ParseException;

import static org.springframework.data.mongodb.core.aggregation.Aggregation.*;

@Slf4j
public class UserActionLogCustomRepositoryImpl implements  UserActionLogCustomRepository {

    private final MongoTemplate template;

    @Autowired
    public UserActionLogCustomRepositoryImpl(MongoTemplate template) {
        this.template = template;
    }

    @Override
    public Page<UserActionLog> findByParams(MultiValueMap<String, String> params, Pageable pageable) {
        Aggregation agg = newAggregation( this.getOperations(params, pageable));
        Aggregation countAgg = newAggregation( this.getOperationsForCount(params));
        List<UserActionLog> results = template.aggregate(agg, "userActionLogs", UserActionLog.class).getMappedResults();
        String count = template.aggregate(countAgg, "userActionLogs", String.class).getUniqueMappedResult();

        long totalSize = count != null ? getCountFromJson(count) : 0;
        return new PageImpl<>(results, pageable, totalSize);
    }

    private long getCountFromJson(String json ) {
        JSONObject count;
        try {
            count = (JSONObject) (new JSONParser(JSONParser.MODE_PERMISSIVE)).parse(json);
        } catch (ParseException e) {
            log.error("Error", e);
            return 0;
        }
        return ((Integer) count.get("count")).longValue();
    }

    private List<AggregationOperation> getOperations(MultiValueMap<String, String> queryParams, Pageable pageableRequest) {

        List<Criteria> criteria = getCriteria(queryParams);

        List<AggregationOperation> operations = new ArrayList<>();

        if (!criteria.isEmpty())
            operations.add(match(new Criteria().andOperator(criteria.toArray(new Criteria[criteria.size()]))));

        operations.add(sort(Sort.by(Sort.Order.desc("date"))));

        if ((pageableRequest != null) && (pageableRequest.isPaged())) {
            operations.add(skip((long) (pageableRequest.getPageNumber() * pageableRequest.getPageSize())));
            operations.add(limit(pageableRequest.getPageSize()));
        }
        return operations;
    }

    private  List<AggregationOperation> getOperationsForCount(MultiValueMap<String, String> queryParams) {

        List<Criteria> criteria = getCriteria(queryParams);

        List<AggregationOperation> operations = new ArrayList<>();

        if (!criteria.isEmpty())
            operations.add(match(new Criteria().andOperator(criteria.toArray(new Criteria[criteria.size()]))));

        operations.add(count().as("count"));
        return operations;
    }

    private List<Criteria> getCriteria(MultiValueMap<String, String> queryParams) {
        List<Criteria> criteria = new ArrayList<>();

        queryParams.forEach((key, values) -> {
            if (key.equals("dateFrom"))
                criteria.add(Criteria.where("date").gte(Instant.ofEpochMilli(Long.parseLong(values.get(0)))));
            else if (key.equals("dateTo"))
                criteria.add(Criteria.where("date").lte(Instant.ofEpochMilli(Long.parseLong(values.get(0)))));
            else criteria.add(Criteria.where(key).in(values));
        });
        return criteria;
    }

}
