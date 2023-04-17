/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.useractiontracing.mongo;

import lombok.extern.slf4j.Slf4j;
import org.opfab.useractiontracing.model.UserActionLog;
import org.opfab.useractiontracing.repositories.UserActionLogRepository;
import org.springframework.data.domain.*;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationOperation;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.util.MultiValueMap;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import net.minidev.json.JSONObject;
import net.minidev.json.parser.JSONParser;
import net.minidev.json.parser.ParseException;

import static org.springframework.data.mongodb.core.aggregation.Aggregation.*;

@Slf4j
public class UserActionLogRepositoryImpl implements UserActionLogRepository {

    private final MongoTemplate template;
    private final MongoUserActionLogRepository repository;
    private static final String COLLECTION_NAME = "userActionLogs";

    public UserActionLogRepositoryImpl(MongoTemplate template, MongoUserActionLogRepository repository) {
        this.template = template;
        this.repository = repository;
    }

    @Override
    public Page<UserActionLog> findByParams(MultiValueMap<String, String> params, Pageable pageable) {
        Aggregation agg = newAggregation(this.getOperations(params, pageable));
        Aggregation countAgg = newAggregation(this.getOperationsForCount(params));
        List<UserActionLog> results = template.aggregate(agg, COLLECTION_NAME, UserActionLog.class).getMappedResults();
        String count = template.aggregate(countAgg, COLLECTION_NAME, String.class).getUniqueMappedResult();

        long totalSize = count != null ? getCountFromJson(count) : 0;
        return new PageImpl<>(results, pageable, totalSize);
    }

    private long getCountFromJson(String json) {
        JSONObject count;
        try {
            count = (JSONObject) (new JSONParser(JSONParser.MODE_PERMISSIVE)).parse(json);
        } catch (ParseException e) {
            log.error("Error", e);
            return 0;
        }
        return ((Integer) count.get("count")).longValue();
    }

    private List<AggregationOperation> getOperations(MultiValueMap<String, String> queryParams,
            Pageable pageableRequest) {

        List<Criteria> criteria = getCriteria(queryParams);

        List<AggregationOperation> operations = new ArrayList<>();

        if (!criteria.isEmpty())
            operations.add(match(new Criteria().andOperator(criteria.toArray(new Criteria[criteria.size()]))));

        operations.add(sort(Sort.by(Sort.Order.desc("date"))));

        if ((pageableRequest != null) && (pageableRequest.isPaged())) {
            operations.add(skip(((long) pageableRequest.getPageNumber()) * pageableRequest.getPageSize()));
            operations.add(limit(pageableRequest.getPageSize()));
        }
        return operations;
    }

    private List<AggregationOperation> getOperationsForCount(MultiValueMap<String, String> queryParams) {

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
            else
                criteria.add(Criteria.where(key).in(values));
        });
        return criteria;
    }

    @Override
    public void deleteExpiredLogs(Instant expirationDate) {
        Query expiredLogs = new Query();
        expiredLogs.addCriteria(Criteria.where("date").lt(expirationDate));
        this.template.remove(expiredLogs, UserActionLog.class, COLLECTION_NAME);
    }

    @Override
    public List<UserActionLog> findAll() {
        return repository.findAll(Sort.by("date").descending());
    }

    @Override
    public UserActionLog save(UserActionLog userActionLog) {
        return repository.save(userActionLog);
    }

    @Override
    public Optional<UserActionLog> findById(String id) {
        return repository.findById(id);
    }

    @Override
    public void delete(UserActionLog entity) {
        repository.delete(entity);
    }

    @Override
    public void deleteAll() {
        repository.deleteAll();
    }

}
